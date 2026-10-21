import { useState } from 'react';
import { Table, Upload, CheckCircle2 } from 'lucide-react';
import { Header } from './components/Header';
import { MetricsBar } from './components/MetricsBar';
import { NatTable } from './components/NatTable';
import { ImportTab } from './components/ImportTab';
import type { NatRecord, RawPlayerRow, ColumnMapping, SplitMode } from './core/types';
import { sanitizePlayerRow } from './core/sanitizer';
import type * as XLSX from 'xlsx';

export function App() {
  const [splitMode] = useState<SplitMode>('surname_first');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'upload' | 'table'>('upload');
  const [customTemplateWb, setCustomTemplateWb] = useState<XLSX.WorkBook | null>(null);
  const [customTemplateName, setCustomTemplateName] = useState<string | null>(null);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  // Start with clean empty state (no hardcoded dummy data)
  const [rawRows, setRawRows] = useState<RawPlayerRow[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping | null>(null);
  const [records, setRecords] = useState<NatRecord[]>([]);

  const showNotification = (msg: string) => {
    setStatusNotification(msg);
    setTimeout(() => setStatusNotification(null), 4000);
  };

  // Handle new import from CSV, Excel, clipboard paste, or URL
  const handleRecordsImported = (
    newRecords: NatRecord[],
    newRawRows: RawPlayerRow[],
    newMapping: ColumnMapping
  ) => {
    setRecords(newRecords);
    setRawRows(newRawRows);
    setMapping(newMapping);
    setSelectedCategory('all');
    setActiveTab('table');
    showNotification(`Processed ${newRecords.length} players ready for Swiss-Manager!`);
  };

  // Handle custom template upload (optional, defaults to src/assets/Nat File - Last Name & First Name.xls)
  const handleCustomTemplateLoaded = (wb: XLSX.WorkBook, filename: string) => {
    setCustomTemplateWb(wb);
    setCustomTemplateName(filename);
    showNotification(`Custom template "${filename}" activated. Sheet 2 (Help) preserved.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Top Header */}
      <Header
        records={records}
        selectedCategory={selectedCategory}
        customTemplateWorkbook={customTemplateWb}
        onNotify={showNotification}
      />

      {/* Floating Status Notification Toast */}
      {statusNotification && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 100,
          background: 'var(--bg-card)',
          border: '1px solid var(--accent-gold-border)',
          boxShadow: 'var(--shadow-lg)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--text-main)',
        }} className="animate-fade-in">
          <CheckCircle2 size={18} color="var(--accent-emerald)" />
          <span>{statusNotification}</span>
        </div>
      )}

      {/* Summary Metrics Cards (Visible once players are loaded) */}
      {records.length > 0 && <MetricsBar records={records} />}

      {/* Tab Navigation */}
      <div style={{
        maxWidth: 1400,
        margin: '16px auto 0',
        padding: '0 24px',
        width: '100%',
        borderBottom: '1px solid var(--border-color)',
      }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setActiveTab('upload')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 18px',
              fontSize: 13,
              fontWeight: 700,
              background: 'transparent',
              color: activeTab === 'upload' ? 'var(--accent-gold)' : 'var(--text-muted)',
              borderBottom: activeTab === 'upload' ? '2px solid var(--accent-gold)' : '2px solid transparent',
              cursor: 'pointer',
            }}
          >
            <Upload size={16} />
            Upload File
          </button>

          <button
            onClick={() => setActiveTab('table')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 18px',
              fontSize: 13,
              fontWeight: 700,
              background: 'transparent',
              color: activeTab === 'table' ? 'var(--accent-gold)' : 'var(--text-muted)',
              borderBottom: activeTab === 'table' ? '2px solid var(--accent-gold)' : '2px solid transparent',
              cursor: 'pointer',
            }}
          >
            <Table size={16} />
            NAT Table {records.length > 0 ? `(${records.length})` : ''}
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <main style={{ flex: 1, paddingBottom: 40 }}>
        {activeTab === 'upload' && (
          <ImportTab
            onRecordsImported={handleRecordsImported}
            splitMode={splitMode}
            currentMapping={mapping}
            onCustomTemplateLoaded={handleCustomTemplateLoaded}
            customTemplateName={customTemplateName}
            customTemplateWorkbook={customTemplateWb}
            currentRecords={records}
            onGoToTable={() => setActiveTab('table')}
            onNotify={showNotification}
          />
        )}

        {activeTab === 'table' && (
          <NatTable
            records={records}
            onRecordsChange={setRecords}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            customTemplateWorkbook={customTemplateWb}
            onNotify={showNotification}
          />
        )}
      </main>

      {/* Arbiter Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-color)',
        padding: '16px 24px',
        textAlign: 'center',
        fontSize: 12,
        color: 'var(--text-dim)',
        background: 'var(--bg-card)',
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <div>
            <strong>SwissNat SL</strong> — Pairing Arbiter NAT File Generator for Swiss-Manager
          </div>
          <div>
            Official Format: <code>src\assets\Nat File - Last Name &amp; First Name.xls</code> (BIFF8 .xls)
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
