import React, { useState } from 'react';
import { Table, Upload, CheckCircle2 } from 'lucide-react';
import { WebHeader } from './components/WebHeader';
import { WebMetricsBar } from './components/WebMetricsBar';
import { WebNatTable } from './components/WebNatTable';
import { WebImportTab } from './components/WebImportTab';
import { WebFooter } from './components/WebFooter';
import type { NatRecord, RawPlayerRow, ColumnMapping, SplitMode } from '../core/types';
import type { ViewMode } from '../shared/hooks/useDeviceMode';

export interface WebAppProps {
  records: NatRecord[];
  onRecordsChange: (records: NatRecord[]) => void;
  rawRows: RawPlayerRow[];
  mapping: ColumnMapping | null;
  onImport: (newRecords: NatRecord[], newRaw: RawPlayerRow[], newMap: ColumnMapping) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  splitMode: SplitMode;
  statusNotification: string | null;
  onNotify: (msg: string) => void;
  isMobile: boolean;
  viewOverride: ViewMode;
  onViewChange: (mode: ViewMode) => void;
}

export const WebApp: React.FC<WebAppProps> = ({
  records,
  onRecordsChange,
  mapping,
  onImport,
  selectedCategory,
  onSelectCategory,
  splitMode,
  statusNotification,
  onNotify,
  isMobile,
  viewOverride,
  onViewChange,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'table'>('upload');

  const handleRecordsImported = (
    newRecords: NatRecord[],
    newRawRows: RawPlayerRow[],
    newMapping: ColumnMapping
  ) => {
    onImport(newRecords, newRawRows, newMapping);
    setActiveTab('table');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Web Header */}
      <WebHeader
        records={records}
        selectedCategory={selectedCategory}
        onNotify={onNotify}
        isMobile={isMobile}
        viewOverride={viewOverride}
        onViewChange={onViewChange}
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

      {/* Summary Metrics Cards */}
      {records.length > 0 && <WebMetricsBar records={records} />}

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
          <WebImportTab
            onRecordsImported={handleRecordsImported}
            splitMode={splitMode}
            currentMapping={mapping}
            currentRecords={records}
            onGoToTable={() => setActiveTab('table')}
            onNotify={onNotify}
          />
        )}

        {activeTab === 'table' && (
          <WebNatTable
            records={records}
            onRecordsChange={onRecordsChange}
            selectedCategory={selectedCategory}
            onSelectCategory={onSelectCategory}
            onNotify={onNotify}
          />
        )}
      </main>

      {/* Footer */}
      <WebFooter />
    </div>
  );
};
