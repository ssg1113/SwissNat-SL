import { useState } from 'react';
import { Table, Upload, CheckCircle2 } from 'lucide-react';
import { Header } from './components/Header';
import { MetricsBar } from './components/MetricsBar';
import { NatTable } from './components/NatTable';
import { ImportTab } from './components/ImportTab';
import { Footer } from './components/Footer';
import type { NatRecord, RawPlayerRow, ColumnMapping, SplitMode } from './core/types';
import { sanitizePlayerRow } from './core/sanitizer';
import type * as XLSX from 'xlsx';

export function App() {
  const [splitMode] = useState<SplitMode>('surname_first');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'upload' | 'table'>('upload');
  const [customTemplateWb, setCustomTemplateWb] = useState<XLSX.WorkBook | null>(null);
  const [customTemplateName, setCustomTemplateName] = useState<string | null>(null);
  const [activeTemplateMode, setActiveTemplateMode] = useState<'default' | 'custom'>('default');
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

  // Handle custom template upload (in-memory only, not permanently stored)
  const handleCustomTemplateLoaded = (wb: XLSX.WorkBook, filename: string) => {
    setCustomTemplateWb(wb);
    setCustomTemplateName(filename);
    setActiveTemplateMode('custom');
    showNotification(`Custom template "${filename}" loaded! Output will follow this template.`);
  };

  // Remove custom template and restore official default template
  const handleRemoveCustomTemplate = () => {
    setCustomTemplateWb(null);
    setCustomTemplateName(null);
    setActiveTemplateMode('default');
    showNotification('Custom template cleared. Official default template restored.');
  };

  // Template workbook to use based on user selection (default or custom)
  const effectiveTemplateWorkbook = activeTemplateMode === 'custom' && customTemplateWb ? customTemplateWb : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Top Header */}
      <Header
        records={records}
        selectedCategory={selectedCategory}
        customTemplateWorkbook={effectiveTemplateWorkbook}
        customTemplateName={customTemplateName}
        activeTemplateMode={activeTemplateMode}
        onSelectTemplateMode={setActiveTemplateMode}
        onRemoveCustomTemplate={handleRemoveCustomTemplate}
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
            activeTemplateMode={activeTemplateMode}
            onSelectTemplateMode={setActiveTemplateMode}
            onRemoveCustomTemplate={handleRemoveCustomTemplate}
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
            customTemplateWorkbook={effectiveTemplateWorkbook}
            customTemplateName={customTemplateName}
            activeTemplateMode={activeTemplateMode}
            onSelectTemplateMode={setActiveTemplateMode}
            onRemoveCustomTemplate={handleRemoveCustomTemplate}
            onNotify={showNotification}
          />
        )}
      </main>

      {/* Arbiter Footer */}
      <Footer />
    </div>
  );
}

export default App;
