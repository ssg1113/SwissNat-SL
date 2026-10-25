/**
 * SwissNat SL - Shared spreadsheet import helpers
 *
 * Used by both the Web (PC) and Mobile views so that file uploads, pasted
 * rows and Google Sheets links are all parsed and column-mapped identically.
 */

import * as XLSX from 'xlsx';
import { autoDetectColumns, sanitizePlayerRow } from './sanitizer';
import type { ColumnMapping, NatRecord, RawPlayerRow, SplitMode } from './types';

export interface ImportResult {
  records: NatRecord[];
  rows: RawPlayerRow[];
  mapping: ColumnMapping;
}

/** Removes rows where every cell is blank. */
export function filterEmptyRows(rows: any[]): any[] {
  return rows.filter(row => {
    const values = Object.values(row ?? {}).map(v => String(v ?? '').trim()).filter(Boolean);
    return values.length > 0;
  });
}

/**
 * Cleans raw sheet rows: drops blank rows and, when the first row is a
 * title/banner row with the real headers in row 2, re-keys rows by those headers.
 */
export function normalizeImportedRows(rawRows: any[]): any[] {
  let rows = filterEmptyRows(rawRows);
  if (rows.length < 2) return rows;

  const row0Keys = Object.keys(rows[0]);
  const isDefaultEmptyKeys = row0Keys.some(k => k.startsWith('__EMPTY'));

  if (isDefaultEmptyKeys) {
    const isHeaderList = (vals: any[]) =>
      vals.some(v => {
        const s = String(v || '').toLowerCase();
        return (
          s.includes('name') ||
          s.includes('school') ||
          s.includes('birth') ||
          s.includes('fide') ||
          s.includes('last') ||
          s.includes('first') ||
          s.includes('නම') ||
          s.includes('පාසල')
        );
      });

    // Case 1: Row 0 is a title/banner row and Row 1 contains the actual column headers
    if (rows.length > 2 && isHeaderList(Object.values(rows[1]))) {
      const customHeaders = Object.values(rows[1]).map(v => String(v || '').trim());
      const shiftedRows = rows.slice(2).map(r => {
        const newObj: Record<string, any> = {};
        const vals = Object.values(r);
        customHeaders.forEach((h, i) => {
          if (h) newObj[h] = vals[i] ?? '';
        });
        return newObj;
      });
      return filterEmptyRows(shiftedRows);
    }

    // Case 2: Row 0 itself contains the column headers
    if (isHeaderList(Object.values(rows[0]))) {
      const customHeaders = Object.values(rows[0]).map(v => String(v || '').trim());
      const shiftedRows = rows.slice(1).map(r => {
        const newObj: Record<string, any> = {};
        const vals = Object.values(r);
        customHeaders.forEach((h, i) => {
          if (h) newObj[h] = vals[i] ?? '';
        });
        return newObj;
      });
      return filterEmptyRows(shiftedRows);
    }
  }

  return rows;
}

/** Collects header names from the first few rows (some rows omit empty columns). */
export function collectHeaders(rows: any[]): string[] {
  const headerSet = new Set<string>();
  for (const r of rows.slice(0, 5)) {
    Object.keys(r).forEach(k => headerSet.add(k));
  }
  return Array.from(headerSet);
}

/**
 * Turns raw sheet rows into sanitized NAT records.
 * Throws if there are no usable rows.
 */
export function buildRecordsFromRows(
  rawRows: any[],
  splitMode: SplitMode,
  mappingOverride?: ColumnMapping
): ImportResult {
  const rows = normalizeImportedRows(rawRows);
  if (rows.length === 0) {
    throw new Error('No valid data rows found in the file, pasted text, or link.');
  }
  const mapping = mappingOverride || autoDetectColumns(collectHeaders(rows));
  const records = rows.map((row, idx) => sanitizePlayerRow(row, idx, mapping, splitMode));
  return { records, rows, mapping };
}

/** Parses an uploaded .xlsx / .xls / .csv file (ArrayBuffer) into JSON rows. */
export function parseWorkbookBuffer(buffer: ArrayBuffer): any[] {
  const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(worksheet, { defval: '' });
}

/** Parses pasted TSV (copied from Google Sheets/Excel) or CSV text into JSON rows. */
export function parseSheetText(text: string): any[] {
  const workbook = XLSX.read(text, { type: 'string' });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(worksheet, { defval: '' });
}

// ---------------------------------------------------------------------------
// Google Sheets
// ---------------------------------------------------------------------------

export interface GoogleSheetLinkInfo {
  kind: 'sheet' | 'published' | 'apps-script';
  /** Spreadsheet ID, or the published "2PACX-..." ID */
  id?: string;
  /** Tab (worksheet) ID, if the link points to a specific tab */
  gid?: string;
  /** The cleaned URL */
  url: string;
}

/**
 * Pulls the first http(s) URL out of whatever the user pasted.
 * Mobile "Share → Copy link" often adds extra text around the link.
 */
export function extractUrl(input: string): string {
  const trimmed = (input || '').trim();
  const match = trimmed.match(/https?:\/\/[^\s<>"']+/i);
  return match ? match[0] : trimmed;
}

/** Recognises Google Sheet edit/view links, "Publish to web" links, and Apps Script web apps. */
export function parseGoogleSheetLink(input: string): GoogleSheetLinkInfo | null {
  const url = extractUrl(input);
  if (!url) return null;

  if (/script\.google(usercontent)?\.com/i.test(url)) {
    return { kind: 'apps-script', url };
  }

  const gidMatch = url.match(/[#&?]gid=(\d+)/);
  const gid = gidMatch ? gidMatch[1] : undefined;

  // "File → Share → Publish to web" links: /spreadsheets/d/e/2PACX-.../pubhtml
  const published = url.match(/\/spreadsheets\/d\/e\/([a-zA-Z0-9-_]+)/);
  if (published) {
    return { kind: 'published', id: published[1], gid, url };
  }

  // Normal links: /spreadsheets/d/<id>/edit, /view, /htmlview, /u/0/d/<id> ...
  const normal = url.match(/\/spreadsheets\/(?:u\/\d+\/)?d\/([a-zA-Z0-9-_]{20,})/);
  if (normal) {
    return { kind: 'sheet', id: normal[1], gid, url };
  }

  return null;
}

/** Candidate CSV endpoints for a sheet link, most reliable first. */
export function getGoogleSheetCsvUrls(info: GoogleSheetLinkInfo): string[] {
  if (!info.id) return [];
  const gidParam = info.gid ? `&gid=${info.gid}` : '';

  if (info.kind === 'published') {
    return [`https://docs.google.com/spreadsheets/d/e/${info.id}/pub?output=csv${gidParam}`];
  }

  return [
    // gviz endpoint sends CORS headers, so it works from browsers and phones
    `https://docs.google.com/spreadsheets/d/${info.id}/gviz/tq?tqx=out:csv&headers=1${gidParam}`,
    `https://docs.google.com/spreadsheets/d/${info.id}/export?format=csv${gidParam}`,
  ];
}

/** Direct CSV download link to show the user if automatic fetching fails. */
export function getGoogleSheetCsvDownloadLink(input: string): string | null {
  const info = parseGoogleSheetLink(input);
  if (!info || !info.id) return null;
  const gidParam = info.gid ? `&gid=${info.gid}` : '';
  return info.kind === 'published'
    ? `https://docs.google.com/spreadsheets/d/e/${info.id}/pub?output=csv${gidParam}`
    : `https://docs.google.com/spreadsheets/d/${info.id}/export?format=csv${gidParam}`;
}

function looksLikeHtml(text: string): boolean {
  const head = text.slice(0, 500).trim().toLowerCase();
  return head.startsWith('<!doctype html') || head.startsWith('<html') || head.includes('<head');
}

/** Converts an Apps Script JSON payload (array of arrays or array of objects) into rows. */
function rowsFromAppsScriptJson(data: any): any[] {
  const payload = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : null;
  if (!payload || payload.length === 0) {
    throw new Error('The Apps Script link did not return any rows.');
  }
  if (Array.isArray(payload[0])) {
    const headers: string[] = payload[0].map((h: any) => String(h ?? '').trim());
    return payload.slice(1).map((row: any[]) => {
      const obj: Record<string, any> = {};
      headers.forEach((h, i) => {
        if (h) obj[h] = row[i] ?? '';
      });
      return obj;
    });
  }
  return payload;
}

/**
 * Downloads the rows of a Google Sheet from a share link.
 * The sheet must be shared as "Anyone with the link can view" (or published),
 * or be exposed through a Google Apps Script web app.
 */
export async function fetchGoogleSheetRows(input: string, fetchImpl: typeof fetch = fetch): Promise<any[]> {
  const info = parseGoogleSheetLink(input);
  if (!info) {
    throw new Error('This does not look like a Google Sheets link. Open the sheet, tap Share → Copy link, and paste it here.');
  }

  if (info.kind === 'apps-script') {
    const response = await fetchImpl(info.url);
    if (!response.ok) throw new Error(`Apps Script returned HTTP ${response.status}.`);
    const text = await response.text();
    try {
      return rowsFromAppsScriptJson(JSON.parse(text));
    } catch {
      // Some scripts return CSV instead of JSON
      if (looksLikeHtml(text)) throw new Error('The Apps Script link returned a web page instead of data. Deploy it with access "Anyone".');
      return parseSheetText(text);
    }
  }

  let sawPrivate = false;
  let lastError: unknown = null;

  for (const csvUrl of getGoogleSheetCsvUrls(info)) {
    try {
      const response = await fetchImpl(csvUrl);
      if (!response.ok) {
        if (response.status === 401 || response.status === 403 || response.status === 404) sawPrivate = true;
        continue;
      }
      const text = await response.text();
      if (looksLikeHtml(text)) {
        // Google returns its sign-in page for private sheets
        sawPrivate = true;
        continue;
      }
      const rows = parseSheetText(text);
      if (filterEmptyRows(rows).length > 0) return rows;
    } catch (err) {
      lastError = err;
    }
  }

  if (sawPrivate) {
    throw new Error('This Google Sheet is private. In Google Sheets tap Share → General access → "Anyone with the link" (Viewer), then try again.');
  }
  if (lastError) {
    throw new Error('Could not reach Google Sheets. Check your internet connection, or download the sheet as CSV and upload the file instead.');
  }
  throw new Error('The Google Sheet appears to be empty.');
}
