import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { MobileHeader } from './components/MobileHeader';
import { MobileBottomNav, type MobileTab } from './components/MobileBottomNav';
import { MobileImportView } from './components/MobileImportView';
import { MobilePlayerList } from './components/MobilePlayerList';
import { MobileExportView } from './components/MobileExportView';
import { MobileHelpView } from './components/MobileHelpView';
import { InstallModal } from '../shared/components/InstallModal';
import type { NatRecord, RawPlayerRow, ColumnMapping, SplitMode } from '../core/types';

export interface MobileAppProps {
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
  isMobile?: boolean;
}

export const MobileApp: React.FC<MobileAppProps> = ({
  records,
  onRecordsChange,
  mapping,
  onImport,
  selectedCategory,
  onSelectCategory,
  splitMode,
  statusNotification,
  onNotify,
}) => {
  const [activeTab, setActiveTab] = useState<MobileTab>(
    records.length > 0 ? 'players' : 'import'
  );
  const [isInstallOpen, setIsInstallOpen] = useState(false);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100dvh',
      background: 'var(--bg-primary)',
      paddingBottom: 'calc(76px + env(safe-area-inset-bottom, 18px))', // Space for bottom nav
      overflowX: 'hidden',
      position: 'relative',
      width: '100%',
    }}>
      {/* Mobile Top Header */}
      <MobileHeader
        records={records}
        selectedCategory={selectedCategory}
        onNotify={onNotify}
        onOpenInstall={() => setIsInstallOpen(true)}
      />

      {/* Floating Status Notification Toast */}
      {statusNotification && (
        <div style={{
          position: 'fixed',
          top: 'calc(68px + env(safe-area-inset-top, 0px))',
          left: 'max(16px, env(safe-area-inset-left, 16px))',
          right: 'max(16px, env(safe-area-inset-right, 16px))',
          zIndex: 100,
          background: 'var(--bg-card)',
          border: '1px solid var(--accent-gold-border)',
          boxShadow: 'var(--shadow-lg)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 12.5,
          fontWeight: 600,
          color: 'var(--text-main)',
        }} className="animate-fade-in">
          <CheckCircle2 size={16} color="var(--accent-emerald)" />
          <span>{statusNotification}</span>
        </div>
      )}

      {/* Main Tab Content */}
      <main style={{ flex: 1 }}>
        {activeTab === 'import' && (
          <MobileImportView
            onRecordsImported={onImport}
            splitMode={splitMode}
            currentRecords={records}
            onGoToPlayers={() => setActiveTab('players')}
            onNotify={onNotify}
          />
        )}

        {activeTab === 'players' && (
          <MobilePlayerList
            records={records}
            onRecordsChange={onRecordsChange}
            selectedCategory={selectedCategory}
            onSelectCategory={onSelectCategory}
            onNotify={onNotify}
          />
        )}

        {activeTab === 'export' && (
          <MobileExportView
            records={records}
            selectedCategory={selectedCategory}
            onSelectCategory={onSelectCategory}
            onNotify={onNotify}
          />
        )}

        {activeTab === 'help' && (
          <MobileHelpView
            onOpenInstall={() => setIsInstallOpen(true)}
            onGoToImport={() => setActiveTab('import')}
          />
        )}
      </main>

      {/* Fixed Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        playerCount={records.length}
      />

      {/* Mobile & PC Separate Install Modal */}
      <InstallModal
        isOpen={isInstallOpen}
        onClose={() => setIsInstallOpen(false)}
        defaultTab="mobile"
      />
    </div>
  );
};
