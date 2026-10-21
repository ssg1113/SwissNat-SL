import React from 'react';
import { Smartphone, Monitor } from 'lucide-react';
import type { ViewMode } from '../hooks/useDeviceMode';

interface ViewModeSwitcherProps {
  isMobile: boolean;
  viewOverride: ViewMode;
  onViewChange: (mode: ViewMode) => void;
}

export const ViewModeSwitcher: React.FC<ViewModeSwitcherProps> = ({
  isMobile,
  viewOverride,
  onViewChange,
}) => {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 20,
        padding: '2px 4px',
        gap: 2,
        fontSize: 11,
        fontWeight: 600,
      }}
      title="Switch between Desktop Web spreadsheet view and Mobile App touch view"
    >
      <button
        type="button"
        onClick={() => onViewChange('web')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '4px 8px',
          borderRadius: 16,
          border: 'none',
          background: !isMobile ? 'var(--accent-gold)' : 'transparent',
          color: !isMobile ? '#ffffff' : 'var(--text-muted)',
          cursor: 'pointer',
          fontWeight: !isMobile ? 700 : 500,
        }}
      >
        <Monitor size={12} />
        <span>Web</span>
      </button>

      <button
        type="button"
        onClick={() => onViewChange('mobile')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '4px 8px',
          borderRadius: 16,
          border: 'none',
          background: isMobile ? 'var(--accent-gold)' : 'transparent',
          color: isMobile ? '#ffffff' : 'var(--text-muted)',
          cursor: 'pointer',
          fontWeight: isMobile ? 700 : 500,
        }}
      >
        <Smartphone size={12} />
        <span>Mobile</span>
      </button>

      {viewOverride !== 'auto' && (
        <button
          type="button"
          onClick={() => onViewChange('auto')}
          style={{
            padding: '4px 6px',
            fontSize: 10,
            borderRadius: 12,
            border: 'none',
            background: 'transparent',
            color: 'var(--text-dim)',
            cursor: 'pointer',
          }}
          title="Reset to Auto device detection"
        >
          Auto
        </button>
      )}
    </div>
  );
};
