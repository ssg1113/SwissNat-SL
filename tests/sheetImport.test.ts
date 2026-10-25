import { describe, it, expect, vi } from 'vitest';
import {
  extractUrl,
  parseGoogleSheetLink,
  getGoogleSheetCsvUrls,
  getGoogleSheetCsvDownloadLink,
  filterEmptyRows,
  normalizeImportedRows,
  collectHeaders,
  buildRecordsFromRows,
  parseSheetText,
  fetchGoogleSheetRows,
} from '../src/core/sheetImport';

describe('sheetImport - Google Sheet link parsing & extraction', () => {
  it('extracts URL when surrounded by text copied from mobile messaging', () => {
    const raw = 'Here is our tournament responses sheet: https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing please check';
    expect(extractUrl(raw)).toBe(
      'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing'
    );
  });

  it('parses standard Google Sheet edit/view links and extracts sheet ID', () => {
    const url = 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=123456';
    const parsed = parseGoogleSheetLink(url);
    expect(parsed).not.toBeNull();
    expect(parsed?.kind).toBe('sheet');
    expect(parsed?.id).toBe('1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms');
    expect(parsed?.gid).toBe('123456');
  });

  it('parses Google Sheets "Publish to the web" links', () => {
    const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTR8examplePublishedId12345/pubhtml?gid=789&single=true';
    const parsed = parseGoogleSheetLink(url);
    expect(parsed).not.toBeNull();
    expect(parsed?.kind).toBe('published');
    expect(parsed?.id).toBe('2PACX-1vTR8examplePublishedId12345');
    expect(parsed?.gid).toBe('789');
  });

  it('parses Google Apps Script web app URLs', () => {
    const url = 'https://script.google.com/macros/s/AKfycbxExampleScriptId/exec';
    const parsed = parseGoogleSheetLink(url);
    expect(parsed).not.toBeNull();
    expect(parsed?.kind).toBe('apps-script');
  });

  it('generates CORS-friendly gviz CSV endpoints for standard sheets', () => {
    const parsed = parseGoogleSheetLink(
      'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=42'
    );
    expect(parsed).not.toBeNull();
    const urls = getGoogleSheetCsvUrls(parsed!);
    expect(urls[0]).toContain('/gviz/tq?tqx=out:csv&headers=1&gid=42');
    expect(urls[1]).toContain('/export?format=csv&gid=42');
  });

  it('builds direct CSV download link for user fallback', () => {
    const link = getGoogleSheetCsvDownloadLink(
      'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=99'
    );
    expect(link).toBe('https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/export?format=csv&gid=99');
  });

  it('returns null for non-Google Sheets URLs', () => {
    expect(parseGoogleSheetLink('https://example.com/somefile.xlsx')).toBeNull();
    expect(parseGoogleSheetLink('')).toBeNull();
  });
});

describe('sheetImport - Row normalization and record building', () => {
  it('filters empty rows correctly', () => {
    const rows = [
      { a: '  ', b: '' },
      { a: 'K G Banuja', b: '20120514' },
      { a: '', b: null },
    ];
    const filtered = filterEmptyRows(rows);
    expect(filtered.length).toBe(1);
    expect(filtered[0].a).toBe('K G Banuja');
  });

  it('shifts rows when row 0 is a title/banner row', () => {
    const raw = [
      { __EMPTY: 'Sri Lanka Youth Chess Championship 2026 Registration Responses', __EMPTY_1: '' },
      { __EMPTY: 'Player Full Name', __EMPTY_1: 'School / Club', __EMPTY_2: 'Birth Date' },
      { __EMPTY: 'K G Banuja', __EMPTY_1: 'Ananda College', __EMPTY_2: '20120514' },
      { __EMPTY: 'M M Perera', __EMPTY_1: 'Nalanda College', __EMPTY_2: '20140810' },
    ];
    const normalized = normalizeImportedRows(raw);
    expect(normalized.length).toBe(2);
    expect(normalized[0]['Player Full Name']).toBe('K G Banuja');
    expect(normalized[1]['School / Club']).toBe('Nalanda College');
  });

  it('parses pasted TSV string into structured rows', () => {
    const tsv = 'Player Name\tBirthday\tGender\nK G Banuja\t20120514\tMale\nS S Gayashan\t19990101\tm';
    const rows = parseSheetText(tsv);
    expect(rows.length).toBe(2);
    expect(rows[0]['Player Name']).toBe('K G Banuja');
  });

  it('builds sanitized NAT records with correct 1-based sequential ID_No', () => {
    const rawRows = [
      { 'Full Name': 'K.G.Banuja Binuwara', Birthday: '2012-05-14', Gender: 'Male', 'School / Club': 'Ananda College Colombo' },
      { 'Full Name': 'S.S.Gayashan De Silva', Birthday: '1999-01-01', Gender: 'Male', 'School / Club': 'University of Moratuwa' },
    ];
    const result = buildRecordsFromRows(rawRows, 'surname_first');
    expect(result.records.length).toBe(2);
    expect(result.records[0].ID_No).toBe('1');
    expect(result.records[1].ID_No).toBe('2');
    expect(result.records[0].LastName).toBe('Binuwara');
    expect(result.records[0].FirstName).toBe('K G Banuja');
    expect(result.records[0].Birthday).toBe('20120514');
  });

  it('fetches and sanitizes rows from mocked fetch responding with CSV', async () => {
    const mockCsv = 'Full Name,Birthday,Gender,School\nDe Silva S S G,19990101,Male,Richmond College Galle\n';
    const fakeFetch: any = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => mockCsv,
    });

    const rows = await fetchGoogleSheetRows(
      'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit',
      fakeFetch
    );
    expect(rows.length).toBe(1);
    expect(rows[0]['Full Name']).toBe('De Silva S S G');
  });
});
