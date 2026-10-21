import React from 'react';
import { Upload, Users, Share2, HelpCircle } from 'lucide-react';

export type MobileTab = 'import' | 'players' | 'export' | 'help';

interface MobileBottomNavProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
  playerCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  playerCount,
}) => {
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: 64,
      background: 'var(--header-bg)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderTop: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      zIndex: 90,
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.08)',
    }}>
      {/* 1. Import Tab */}
      <button
        type="button"
        onClick={() => onTabChange('import')}
        style={{
          background: 'none',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          color: activeTab === 'import' ? 'var(--accent-gold)' : 'var(--text-muted)',
          cursor: 'pointer',
          padding: '6px 12px',
        }}
      >
        <Upload size={20} strokeWidth={activeTab === 'import' ? 2.5 : 1.8} />
        <span style={{ fontSize: 11, fontWeight: activeTab === 'import' ? 700 : 500 }}>
          Import
        </span>
      </button>

      {/* 2. Players Tab */}
      <button
        type="button"
        onClick={() => onTabChange('players')}
        style={{
          background: 'none',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          position: 'relative',
          color: activeTab === 'players' ? 'var(--accent-gold)' : 'var(--text-muted)',
          cursor: 'pointer',
          padding: '6px 12px',
        }}
      >
        <Users size={20} strokeWidth={activeTab === 'players' ? 2.5 : 1.8} />
        <span style={{ fontSize: 11, fontWeight: activeTab === 'players' ? 700 : 500 }}>
          Players
        </span>
        {playerCount > 0 && (
          <span style={{
            position: 'absolute',
            top: 2,
            right: 8,
            background: 'var(--accent-gold)',
            color: '#ffffff',
            fontSize: 10,
            fontWeight: 800,
            borderRadius: 10,
            padding: '1px 5px',
            lineHeight: 1.2,
          }}>
            {playerCount > 99 ? '99+' : playerCount}
          </span>
        )}
      </button>

      {/* 3. Export Tab */}
      <button
        type="button"
        onClick={() => onTabChange('export')}
        style={{
          background: 'none',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          color: activeTab === 'export' ? 'var(--accent-gold)' : 'var(--text-muted)',
          cursor: 'pointer',
          padding: '6px 12px',
        }}
      >
        <Share2 size={20} strokeWidth={activeTab === 'export' ? 2.5 : 1.8} />
        <span style={{ fontSize: 11, fontWeight: activeTab === 'export' ? 700 : 500 }}>
          Export
        </span>
      </button>

      {/* 4. Help Tab */}
      <button
        type="button"
        onClick={() => onTabChange('help')}
        style={{
          background: 'none',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          color: activeTab === 'help' ? 'var(--accent-gold)' : 'var(--text-muted)',
          cursor: 'pointer',
          padding: '6px 12px',
        }}
      >
        <HelpCircle size={20} strokeWidth={activeTab === 'help' ? 2.5 : 1.8} />
        <span style={{ fontSize: 11, fontWeight: activeTab === 'help' ? 700 : 500 }}>
          Guide
        </span>
      </button>
    </nav>
  );
};
