import React, { useState } from 'react';
import { UploadCloud, Clipboard, Link as LinkIcon, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { autoDetectColumns, sanitizePlayerRow } from '../../core/sanitizer';
import { SAMPLE_GOOGLE_FORM_DATA } from '../../core/sampleData';
import type { RawPlayerRow, NatRecord, ColumnMapping, SplitMode } from '../../core/types';

interface MobileImportViewProps {
  onRecordsImported: (records: NatRecord[], rawData: RawPlayerRow[], mapping: ColumnMapping) => void;
  splitMode: SplitMode;
  currentRecords: NatRecord[];
  onGoToPlayers: () => void;
  onNotify?: (msg: string) => void;
}

export const MobileImportView: React.FC<MobileImportViewProps> = ({
  onRecordsImported,
  splitMode,
  currentRecords,
  onGoToPlayers,
  onNotify,
}) => {
  const [googleUrl, setGoogleUrl] = useState('');
  const [pasteText, setPasteText] = useState('');
  const [pasteOpen, setPasteOpen] = useState(false);
  const [urlOpen, setUrlOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const processRows = (rawRows: any[]) => {
    const validRows = rawRows.filter(r => {
      const vals = Object.values(r).map(v => String(v || '').trim()).filter(Boolean);
      return vals.length > 0;
    });

    if (validRows.length === 0) {
      setErrorMsg('No valid rows found in file.');
      return;
    }

    const mapping = autoDetectColumns(validRows);
    const sanitized: NatRecord[] = [];

    validRows.forEach((row, idx) => {
      const rec = sanitizePlayerRow(row, idx + 1, mapping, splitMode);
      if (rec) sanitized.push(rec);
    });

    onRecordsImported(sanitized, validRows, mapping);
    onNotify?.(`Loaded ${sanitized.length} players!`);
    onGoToPlayers();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);
        processRows(json);
      } catch (err: any) {
        setErrorMsg(`Failed to parse file: ${err.message || 'Unknown error'}`);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleProcessPaste = () => {
    if (!pasteText.trim()) return;
    try {
      const lines = pasteText.trim().split('\n');
      if (lines.length < 2) {
        setErrorMsg('Please paste at least a header row and 1 data row.');
        return;
      }
      const sep = lines[0].includes('\t') ? '\t' : ',';
      const headers = lines[0].split(sep).map(h => h.trim());
      const rows: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        const vals = lines[i].split(sep);
        const obj: Record<string, string> = {};
        headers.forEach((h, idx) => {
          obj[h] = (vals[idx] || '').trim();
        });
        rows.push(obj);
      }
      processRows(rows);
    } catch (err: any) {
      setErrorMsg(`Failed to parse text: ${err.message}`);
    }
  };

  const handleLoadSample = () => {
    const raw = SAMPLE_GOOGLE_FORM_DATA;
    const mapping = autoDetectColumns(raw);
    const sanitized = raw.map((r, i) => sanitizePlayerRow(r, i + 1, mapping, splitMode)).filter(Boolean) as NatRecord[];
    onRecordsImported(sanitized, raw, mapping);
    onNotify?.(`Loaded sample tournament (${sanitized.length} players)!`);
    onGoToPlayers();
  };

  return (
    <div style={{ padding: '16px 14px 80px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Current Records Quick Banner */}
      {currentRecords.length > 0 && (
        <div style={{
          background: 'var(--accent-emerald-light)',
          border: '1px solid var(--accent-emerald-border)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={18} color="var(--accent-emerald-dark)" />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-emerald-dark)' }}>
                {currentRecords.length} Players Active
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                Ready for Swiss-Manager export
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onGoToPlayers}
            style={{
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 700,
              borderRadius: 6,
              background: 'var(--accent-emerald)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            View Players
          </button>
        </div>
      )}

      {/* Error alert */}
      {errorMsg && (
        <div style={{
          background: 'var(--accent-rose-light)',
          border: '1px solid var(--accent-rose-border)',
          color: 'var(--accent-rose-dark)',
          padding: '10px 14px',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 12,
        }}>
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Primary Action 1: Upload File */}
      <label style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        borderRadius: 'var(--radius-lg)',
        border: '2px dashed var(--accent-gold)',
        background: 'var(--bg-card)',
        cursor: 'pointer',
        textAlign: 'center',
        gap: 8,
      }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'var(--accent-gold-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent-gold-dark)',
        }}>
          <UploadCloud size={24} />
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)' }}>
            Choose Excel / CSV File
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            Supports .xlsx, .xls, .csv from tournament registrations
          </div>
        </div>
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
      </label>

      {/* Secondary Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {/* Paste from Clipboard */}
        <button
          type="button"
          onClick={() => setPasteOpen(!pasteOpen)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '14px 10px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-main)',
            gap: 6,
            cursor: 'pointer',
          }}
        >
          <Clipboard size={18} color="var(--accent-purple)" />
          <span style={{ fontSize: 12, fontWeight: 700 }}>Paste Data</span>
        </button>

        {/* Load Sample Data */}
        <button
          type="button"
          onClick={handleLoadSample}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '14px 10px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-main)',
            gap: 6,
            cursor: 'pointer',
          }}
        >
          <Sparkles size={18} color="var(--accent-gold)" />
          <span style={{ fontSize: 12, fontWeight: 700 }}>Sample Data</span>
        </button>
      </div>

      {/* Paste Collapsible Area */}
      {pasteOpen && (
        <div className="glass-panel" style={{ padding: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>
            Paste Spreadsheet Rows:
          </div>
          <textarea
            rows={5}
            value={pasteText}
            onChange={e => setPasteText(e.target.value)}
            placeholder="Name&#9;School&#9;Birthday&#9;FIDE ID&#10;K G Banuja&#9;Ananda College&#9;20120514&#9;9931234"
            className="cell-input font-mono"
            style={{ width: '100%', padding: 8, fontSize: 11, resize: 'vertical' }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button
              type="button"
              onClick={handleProcessPaste}
              style={{
                padding: '6px 14px',
                fontSize: 12,
                fontWeight: 700,
                borderRadius: 'var(--radius-sm)',
                background: 'var(--accent-gold)',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Process Pasted Rows
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
