import React, { useState } from 'react';
import {
  UploadCloud,
  Clipboard,
  ClipboardPaste,
  Link as LinkIcon,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  X,
} from 'lucide-react';
import { SAMPLE_GOOGLE_FORM_DATA } from '../../core/sampleData';
import {
  buildRecordsFromRows,
  fetchGoogleSheetRows,
  getGoogleSheetCsvDownloadLink,
  parseGoogleSheetLink,
  parseSheetText,
  parseWorkbookBuffer,
} from '../../core/sheetImport';
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
  const [loadingSheet, setLoadingSheet] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const trimmedUrl = googleUrl.trim();
  const linkInfo = trimmedUrl ? parseGoogleSheetLink(trimmedUrl) : null;
  const showLinkHint = trimmedUrl.length > 8 && !linkInfo;

  const processRows = (rawRows: any[], sourceLabel: string) => {
    try {
      const { records, rows, mapping } = buildRecordsFromRows(rawRows, splitMode);
      setErrorMsg(null);
      onRecordsImported(records, rows, mapping);
      onNotify?.(`Loaded ${records.length} players from ${sourceLabel}!`);
      onGoToPlayers();
    } catch (err: any) {
      setErrorMsg(err.message || 'No valid rows found.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        processRows(parseWorkbookBuffer(evt.target?.result as ArrayBuffer), file.name);
      } catch (err: any) {
        setErrorMsg(`Failed to parse file: ${err.message || 'Unknown error'}`);
      } finally {
        // Allow re-selecting the same file
        input.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleProcessPaste = () => {
    if (!pasteText.trim()) return;
    try {
      const rows = parseSheetText(pasteText);
      if (rows.length < 1) {
        setErrorMsg('Please paste at least a header row and 1 data row.');
        return;
      }
      processRows(rows, 'pasted rows');
    } catch (err: any) {
      setErrorMsg(`Failed to parse text: ${err.message}`);
    }
  };

  const handlePasteLinkFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setGoogleUrl(text.trim());
        setErrorMsg(null);
      }
    } catch {
      setErrorMsg('Clipboard access was blocked. Long-press the box and choose "Paste" instead.');
    }
  };

  const handleFetchGoogleSheet = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!trimmedUrl || loadingSheet) return;

    // Hide the on-screen keyboard
    (document.activeElement as HTMLElement | null)?.blur?.();

    setLoadingSheet(true);
    setErrorMsg(null);
    try {
      const rows = await fetchGoogleSheetRows(trimmedUrl);
      processRows(rows, 'Google Sheets');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load the Google Sheet.');
    } finally {
      setLoadingSheet(false);
    }
  };

  const handleLoadSample = () => {
    processRows(SAMPLE_GOOGLE_FORM_DATA, 'the sample tournament');
  };

  const csvFallbackLink = errorMsg && linkInfo ? getGoogleSheetCsvDownloadLink(trimmedUrl) : null;

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
        <div
          role="alert"
          style={{
            background: 'var(--accent-rose-light)',
            border: '1px solid var(--accent-rose-border)',
            color: 'var(--accent-rose-dark)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8,
            fontSize: 12.5,
            lineHeight: 1.45,
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ flex: 1 }}>
            <span>{errorMsg}</span>
            {csvFallbackLink && (
              <a
                href={csvFallbackLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  marginTop: 6,
                  fontWeight: 700,
                  color: 'var(--accent-cyan-dark)',
                  textDecoration: 'underline',
                }}
              >
                <ExternalLink size={12} /> Download sheet as CSV, then upload it above
              </a>
            )}
          </div>
        </div>
      )}

      {/* Primary Action 1: Upload File */}
      <label
        htmlFor="mobile-file-input"
        style={{
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
        }}
      >
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
          id="mobile-file-input"
          type="file"
          accept=".xlsx,.xls,.csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
      </label>

      {/* Primary Action 2: Google Sheets Link */}
      <form
        onSubmit={handleFetchGoogleSheet}
        className="glass-panel"
        style={{
          padding: 14,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          border: '1px solid var(--accent-cyan-border, var(--border-color))',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-cyan-light)',
            color: 'var(--accent-cyan-dark)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <LinkIcon size={18} />
          </div>
          <div>
            <label
              htmlFor="mobile-google-sheet-url"
              style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)', display: 'block' }}
            >
              Google Sheets Link
            </label>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
              Paste the Google Form responses sheet link
            </div>
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <input
            id="mobile-google-sheet-url"
            name="googleSheetUrl"
            type="url"
            inputMode="url"
            enterKeyHint="go"
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder="https://docs.google.com/spreadsheets/d/..."
            value={googleUrl}
            onChange={e => setGoogleUrl(e.target.value)}
            disabled={loadingSheet}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              // 16px prevents iOS Safari from zooming in when the field is focused
              fontSize: 16,
              padding: '11px 40px 11px 12px',
              borderRadius: 'var(--radius-md)',
              border: `1px solid ${showLinkHint ? 'var(--accent-rose-border)' : 'var(--border-color)'}`,
              background: 'var(--bg-secondary)',
              color: 'var(--text-main)',
              outline: 'none',
            }}
          />
          {googleUrl && !loadingSheet && (
            <button
              type="button"
              aria-label="Clear link"
              onClick={() => setGoogleUrl('')}
              style={{
                position: 'absolute',
                right: 6,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 30,
                height: 30,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {showLinkHint && (
          <div style={{ fontSize: 11.5, color: 'var(--accent-rose-dark)' }}>
            That isn't a Google Sheets link. In Google Sheets tap <strong>Share → Copy link</strong>.
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 8 }}>
          <button
            id="mobile-paste-link-btn"
            type="button"
            onClick={handlePasteLinkFromClipboard}
            disabled={loadingSheet}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '10px 12px',
              fontSize: 13,
              fontWeight: 700,
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              cursor: 'pointer',
            }}
          >
            <ClipboardPaste size={15} />
            Paste
          </button>

          <button
            id="mobile-fetch-sheet-btn"
            type="submit"
            disabled={!trimmedUrl || loadingSheet}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '10px 12px',
              fontSize: 13,
              fontWeight: 700,
              borderRadius: 'var(--radius-md)',
              border: 'none',
              color: '#ffffff',
              background: !trimmedUrl ? 'var(--border-color)' : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              cursor: !trimmedUrl || loadingSheet ? 'not-allowed' : 'pointer',
            }}
          >
            {loadingSheet ? (
              <>
                <RefreshCw size={15} className="animate-spin" />
                Loading sheet...
              </>
            ) : (
              <>
                <Sparkles size={15} />
                Load &amp; Clean Players
              </>
            )}
          </button>
        </div>

        <div style={{ fontSize: 11, color: 'var(--text-dim)', lineHeight: 1.4 }}>
          Sheet access must be <strong>"Anyone with the link" (Viewer)</strong>. A link to a specific tab (<code>#gid=</code>) loads that tab.
        </div>
      </form>

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
          <span style={{ fontSize: 12, fontWeight: 700 }}>Paste Rows</span>
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
            placeholder={'Name\tSchool\tBirthday\tFIDE ID\nK G Banuja\tAnanda College\t20120514\t9931234'}
            className="cell-input font-mono"
            style={{ width: '100%', padding: 8, fontSize: 16, resize: 'vertical' }}
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
