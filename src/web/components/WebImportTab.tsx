import React, { useState } from 'react';
import { UploadCloud, Link as LinkIcon, CheckCircle, CheckCircle2, AlertCircle, Sparkles, RefreshCw, Clipboard, ExternalLink, HelpCircle, Download, FileSpreadsheet, Table } from 'lucide-react';
import * as XLSX from 'xlsx';
import { autoDetectColumns, sanitizePlayerRow } from '../../core/sanitizer';
import type { RawPlayerRow, NatRecord, ColumnMapping, SplitMode } from '../../core/types';
import { downloadNatXls, downloadNatXlsx } from '../../core/natBuilder';

export interface WebImportTabProps {
  onRecordsImported: (records: NatRecord[], rawData: RawPlayerRow[], mapping: ColumnMapping) => void;
  splitMode: SplitMode;
  currentMapping: ColumnMapping | null;
  currentRecords?: NatRecord[];
  onGoToTable?: () => void;
  onNotify?: (msg: string) => void;
}

export const WebImportTab: React.FC<WebImportTabProps> = ({
  onRecordsImported,
  splitMode,
  currentMapping,
  currentRecords,
  onGoToTable,
  onNotify,
}) => {
  const [googleSheetUrl, setGoogleSheetUrl] = useState('');
  const [clipboardText, setClipboardText] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeImportMethod, setActiveImportMethod] = useState<'upload' | 'paste' | 'url'>('upload');

  // Filter out completely blank rows
  const filterEmptyRows = (rows: any[]): any[] => {
    return rows.filter(row => {
      const values = Object.values(row).map(v => String(v || '').trim()).filter(Boolean);
      return values.length > 0;
    });
  };

  // Parse raw sheet rows into NatRecords
  const processRawRows = (rawRows: any[], mappingOverride?: ColumnMapping) => {
    let rows = filterEmptyRows(rawRows);
    if (!rows || rows.length === 0) {
      setErrorMessage('No valid data rows found in the uploaded file or link.');
      return;
    }

    // Check if row 0 was actually a title/banner row and row 1 contains the headers
    if (rows.length > 1) {
      const row0Keys = Object.keys(rows[0]);
      const emptyKeysCount = row0Keys.filter(k => k.startsWith('__EMPTY')).length;
      const row0Values = Object.values(rows[0]).map(v => String(v || '').toLowerCase());
      const hasHeaderWords = row0Values.some(v =>
        v.includes('name') || v.includes('school') || v.includes('birth') || v.includes('fide') || v.includes('last') || v.includes('first')
      );
      if (emptyKeysCount >= row0Keys.length - 2 && hasHeaderWords) {
        const customHeaders = Object.values(rows[0]).map(v => String(v || '').trim());
        const shiftedRows = rows.slice(1).map(r => {
          const newObj: Record<string, any> = {};
          const vals = Object.values(r);
          customHeaders.forEach((h, i) => {
            if (h) newObj[h] = vals[i] ?? '';
          });
          return newObj;
        });
        rows = filterEmptyRows(shiftedRows);
      }
    }

    // Extract headers across first few rows to ensure all column names are captured
    const allHeadersSet = new Set<string>();
    for (const r of rows.slice(0, 5)) {
      Object.keys(r).forEach(k => allHeadersSet.add(k));
    }
    const headers = Array.from(allHeadersSet);
    const mapping = mappingOverride || autoDetectColumns(headers);

    const records: NatRecord[] = rows.map((row, idx) =>
      sanitizePlayerRow(row, idx, mapping, splitMode)
    );

    onRecordsImported(records, rows, mapping);
    setSuccessMessage(`Successfully processed and sanitized ${records.length} player registrations!`);
    setErrorMessage(null);
  };

  // Handle file drop / upload (.xlsx, .xls, .csv)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        processRawRows(json);
      } catch (err: any) {
        setErrorMessage(`Failed to read file: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };


  // Handle Fast Clipboard Paste (Google Sheet TSV / CSV)
  const handleProcessClipboard = () => {
    if (!clipboardText.trim()) {
      setErrorMessage('Please paste rows from your Google Sheet or Excel export first.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Use XLSX to read TSV / CSV text directly
      const workbook = XLSX.read(clipboardText, { type: 'string' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      processRawRows(json);
    } catch (err: any) {
      setErrorMessage(`Failed to parse pasted text: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Sheet URL Fetch
  const handleFetchGoogleSheet = async () => {
    if (!googleSheetUrl) {
      setErrorMessage('Please paste a valid Google Sheet or Google Apps Script URL.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Check if it is a Google Apps Script Web App JSON link
      if (googleSheetUrl.includes('script.google.com')) {
        const response = await fetch(googleSheetUrl);
        const data = await response.json();
        if (Array.isArray(data) && data.length > 1) {
          const headers: string[] = data[0];
          const rows = data.slice(1).map(row => {
            const obj: Record<string, any> = {};
            headers.forEach((h, i) => {
              obj[h] = row[i];
            });
            return obj;
          });
          processRawRows(rows);
          return;
        }
      }

      // Extract Sheet ID from standard Google Sheet URL
      const match = googleSheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (!match) {
        throw new Error('Could not find Google Spreadsheet ID in the link. Ensure it is a valid Google Sheet link.');
      }

      const sheetId = match[1];
      const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;

      // Try fetching public CSV directly
      try {
        const response = await fetch(exportUrl);
        if (response.ok) {
          const csvText = await response.text();
          const workbook = XLSX.read(csvText, { type: 'string' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
          processRawRows(json);
          return;
        }
      } catch (corsErr) {
        // Direct browser fetch blocked by Google's CORS header
        throw new Error(
          'Google blocked direct browser fetching due to CORS security. Tip: Simply press Ctrl+A & Ctrl+C on your Google Sheet, switch to the "Paste from Clipboard" tab below, and paste directly!'
        );
      }

      throw new Error('Unable to fetch CSV. Ensure the sheet is shared with "Anyone with the link can view".');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to fetch Google Sheet.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to get Google Sheet CSV download link
  const getGoogleSheetCsvDownloadLink = () => {
    const match = googleSheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) return null;
    return `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv`;
  };

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', padding: '24px 24px', width: '100%' }}>
      {/* Alert Messages */}
      {errorMessage && (
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
          background: 'var(--accent-rose-light)',
          border: '1px solid var(--accent-rose-border)',
          color: 'var(--accent-rose-dark)',
          padding: '14px 18px',
          borderRadius: 'var(--radius-md)',
          marginBottom: 20,
          fontSize: 13,
          lineHeight: 1.5,
        }}>
          <AlertCircle size={20} style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ flex: 1 }}>
            <strong>Notice: </strong>
            {errorMessage}
            {getGoogleSheetCsvDownloadLink() && (
              <div style={{ marginTop: 8 }}>
                <a
                  href={getGoogleSheetCsvDownloadLink()!}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    color: 'var(--accent-cyan-dark)',
                    fontWeight: 700,
                    textDecoration: 'underline',
                  }}
                >
                  <ExternalLink size={14} /> Open direct CSV download link in new tab
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {successMessage && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'var(--accent-emerald-light)',
          border: '1px solid var(--accent-emerald-border)',
          color: 'var(--accent-emerald-dark)',
          padding: '14px 18px',
          borderRadius: 'var(--radius-md)',
          marginBottom: 20,
          fontSize: 13,
          fontWeight: 600,
        }}>
          <CheckCircle size={20} />
          <div>{successMessage}</div>
        </div>
      )}

      {/* Prominent Direct Download Card (When players are loaded) */}
      {currentRecords && currentRecords.length > 0 && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--accent-gold-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px 24px',
          marginBottom: 24,
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <CheckCircle2 size={20} color="var(--accent-emerald)" />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                Cleaned NAT File Ready for Swiss-Manager
              </h3>
              <span className="badge badge-gold" style={{ fontSize: 11, padding: '2px 8px' }}>
                {currentRecords.length} Players Sanitized
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, marginBottom: 0 }}>
              Preserves Sheet 1 (Nat) with exact 13 columns and Sheet 2 (Help) ready for Swiss-Manager.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                try {
                  downloadNatXls(currentRecords, 'Nat_File_Master.xls');
                  onNotify?.(`Downloaded "Nat_File_Master.xls" (${currentRecords.length} players) ready for Swiss-Manager!`);
                } catch (err: any) {
                  console.error('Download XLS error:', err);
                  alert(`Download failed: ${err.message || 'Unknown error'}`);
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 18px',
                fontSize: 13,
                fontWeight: 700,
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(217, 119, 6, 0.25)',
                cursor: 'pointer',
              }}
              title="Download Swiss-Manager compatible Excel 97-2003 BIFF8 .xls file"
            >
              <Download size={16} strokeWidth={2.5} />
              Download .xls ({currentRecords.length})
            </button>

            <button
              onClick={() => {
                try {
                  downloadNatXlsx(currentRecords, 'Nat_File_Master.xlsx');
                  onNotify?.(`Downloaded "Nat_File_Master.xlsx" (${currentRecords.length} players)`);
                } catch (err: any) {
                  console.error('Download XLSX error:', err);
                  alert(`Download failed: ${err.message || 'Unknown error'}`);
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 14px',
                fontSize: 13,
                fontWeight: 600,
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-card)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
              }}
              title="Download modern Excel .xlsx file"
            >
              <FileSpreadsheet size={15} color="var(--accent-emerald)" />
              .xlsx
            </button>

            {onGoToTable && (
              <button
                onClick={onGoToTable}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '10px 16px',
                  fontSize: 13,
                  fontWeight: 600,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                }}
              >
                <Table size={15} />
                View &amp; Edit in Table
              </button>
            )}
          </div>
        </div>
      )}

      {/* Import Method Subtabs */}
      <div style={{
        display: 'flex',
        gap: 8,
        marginBottom: 16,
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: 8,
      }}>
        <button
          onClick={() => setActiveImportMethod('upload')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: 700,
            borderRadius: 'var(--radius-md)',
            background: activeImportMethod === 'upload' ? 'var(--accent-gold)' : 'var(--bg-secondary)',
            color: activeImportMethod === 'upload' ? '#ffffff' : 'var(--text-muted)',
          }}
        >
          <UploadCloud size={16} />
          Upload File (.xlsx / .csv)
        </button>

        <button
          onClick={() => setActiveImportMethod('paste')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: 700,
            borderRadius: 'var(--radius-md)',
            background: activeImportMethod === 'paste' ? 'var(--accent-gold)' : 'var(--bg-secondary)',
            color: activeImportMethod === 'paste' ? '#ffffff' : 'var(--text-muted)',
          }}
        >
          <Clipboard size={16} />
          Paste from Clipboard (Fastest)
        </button>

        <button
          onClick={() => setActiveImportMethod('url')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: 700,
            borderRadius: 'var(--radius-md)',
            background: activeImportMethod === 'url' ? 'var(--accent-gold)' : 'var(--bg-secondary)',
            color: activeImportMethod === 'url' ? '#ffffff' : 'var(--text-muted)',
          }}
        >
          <LinkIcon size={16} />
          Google Sheet URL Sync
        </button>
      </div>

      {/* Method 1: Upload File */}
      {activeImportMethod === 'upload' && (
        <div className="glass-panel" style={{ padding: 26, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-gold-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-gold-dark)',
            }}>
              <UploadCloud size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)' }}>Upload Google Form Export</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Drag & drop your tournament registration .xlsx, .xls, or .csv file</p>
            </div>
          </div>

          <label style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px dashed var(--accent-gold)',
            borderRadius: 'var(--radius-lg)',
            padding: '36px 20px',
            cursor: 'pointer',
            background: 'var(--bg-secondary)',
            transition: 'border-color 0.2s',
          }}>
            <UploadCloud size={40} color="var(--accent-gold)" style={{ marginBottom: 12, opacity: 0.9 }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>Click to Browse or Drag File Here</span>
            <span style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>
              Supports Excel (.xlsx, .xls) and CSV exports from Google Forms or CFSL spreadsheets
            </span>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              disabled={loading}
            />
          </label>
        </div>
      )}

      {/* Method 2: Fast Clipboard Paste */}
      {activeImportMethod === 'paste' && (
        <div className="glass-panel" style={{ padding: 26, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-emerald-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-emerald-dark)',
            }}>
              <Clipboard size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)' }}>Paste Directly from Google Sheets</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Select all rows in Google Sheet (Ctrl+A, Ctrl+C) and paste below (Ctrl+V)</p>
            </div>
          </div>

          <textarea
            rows={7}
            placeholder="Paste your copied spreadsheet cells here... (Includes headers and rows)"
            value={clipboardText}
            onChange={e => setClipboardText(e.target.value)}
            style={{
              width: '100%',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              color: 'var(--text-main)',
              fontSize: 12,
              fontFamily: 'var(--font-mono)',
              lineHeight: 1.4,
              resize: 'vertical',
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, flexWrap: 'wrap', gap: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>
              Works completely offline with zero CORS restrictions or sharing permission requirements.
            </span>
            <button
              onClick={handleProcessClipboard}
              disabled={loading || !clipboardText.trim()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 18px',
                borderRadius: 'var(--radius-md)',
                fontSize: 13,
                fontWeight: 700,
                background: !clipboardText.trim() ? 'var(--border-color)' : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: '#ffffff',
                cursor: !clipboardText.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              <Sparkles size={15} />
              Sanitize Pasted Rows
            </button>
          </div>
        </div>
      )}

      {/* Method 3: Google Sheet URL */}
      {activeImportMethod === 'url' && (
        <div className="glass-panel" style={{ padding: 26, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-cyan-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-cyan-dark)',
            }}>
              <LinkIcon size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)' }}>Sync from Google Sheet Link</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Paste the public Google Sheet view link</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              type="url"
              placeholder="https://docs.google.com/spreadsheets/d/.../edit"
              value={googleSheetUrl}
              onChange={e => setGoogleSheetUrl(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                color: 'var(--text-main)',
                fontSize: 13,
              }}
            />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <span style={{ fontSize: 11, color: 'var(--text-dim)', lineHeight: 1.4 }}>
                * Ensure sheet access is set to <strong>"Anyone with the link can view"</strong>.
              </span>

              <button
                onClick={handleFetchGoogleSheet}
                disabled={loading || !googleSheetUrl}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 18px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 13,
                  fontWeight: 700,
                  background: !googleSheetUrl ? 'var(--border-color)' : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#ffffff',
                  cursor: !googleSheetUrl ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    Fetching...
                  </>
                ) : (
                  <>
                    <Sparkles size={15} />
                    Fetch & Sanitize
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}



      {currentMapping && (
        <div className="glass-panel" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <HelpCircle size={16} color="var(--accent-gold)" />
            <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>
              Auto-Detected Spreadsheet Field Mapping
            </h4>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 12,
            fontSize: 12,
          }}>
            {currentMapping.lastName || currentMapping.firstName ? (
              <>
                <div style={{ background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-dim)', display: 'block' }}>Last Name Header:</span>
                  <span style={{ color: 'var(--accent-gold-dark)', fontWeight: 700 }}>{currentMapping.lastName || '(Auto-split from name)'}</span>
                </div>
                <div style={{ background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-dim)', display: 'block' }}>First Name Header:</span>
                  <span style={{ color: 'var(--accent-gold-dark)', fontWeight: 700 }}>{currentMapping.firstName || '(Auto-split from name)'}</span>
                </div>
              </>
            ) : (
              <div style={{ background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-dim)', display: 'block' }}>Full Name Header:</span>
                <span style={{ color: 'var(--accent-gold-dark)', fontWeight: 700 }}>{currentMapping.fullName || '(Auto: Column 2)'}</span>
              </div>
            )}
            <div style={{ background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-dim)', display: 'block' }}>Birthday Header:</span>
              <span style={{ color: 'var(--accent-cyan-dark)', fontWeight: 700 }}>{currentMapping.birthday || '(Auto detected)'}</span>
            </div>
            <div style={{ background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-dim)', display: 'block' }}>School / Club Header:</span>
              <span style={{ color: 'var(--accent-emerald-dark)', fontWeight: 700 }}>{currentMapping.school || '(Auto detected)'}</span>
            </div>
            <div style={{ background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-dim)', display: 'block' }}>FIDE ID Header:</span>
              <span style={{ color: 'var(--accent-purple)', fontWeight: 700 }}>{currentMapping.fideId || '(Auto detected)'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
