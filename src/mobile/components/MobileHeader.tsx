import React from 'react';
import { Share2, Download, CheckCircle2, Smartphone } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import type { NatRecord } from '../../core/types';
import { exportNatFile, shareNatFile } from '../../core/natBuilder';

interface MobileHeaderProps {
  records: NatRecord[];
  selectedCategory: string;
  onNotify?: (msg: string) => void;
  onOpenInstall?: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  records,
  selectedCategory,
  onNotify,
  onOpenInstall,
}) => {
  const [sharing, setSharing] = React.useState(false);
  const [shareSuccess, setShareSuccess] = React.useState<boolean | null>(null);
  const isNative = Capacitor.isNativePlatform();

  const filtered = selectedCategory === 'all'
    ? records
    : records.filter(r => r.Category === selectedCategory);

  const handleShare = async () => {
    if (filtered.length === 0) return;
    setSharing(true);
    try {
      const filename = selectedCategory === 'all'
        ? 'Nat_File_Master.xls'
        : `Nat_File_${selectedCategory.replace(/[^a-zA-Z0-9]/g, '_')}.xls`;
      const res = await shareNatFile(filtered, filename);
      setShareSuccess(res);
      if (res) onNotify?.('NAT file shared successfully!');
    } catch (err) {
      console.error(err);
    } finally {
      setSharing(false);
      setTimeout(() => setShareSuccess(null), 3000);
    }
  };

  const handleDownload = async () => {
    if (filtered.length === 0) return;
    const filename = selectedCategory === 'all'
      ? 'Nat_File_Master.xls'
      : `Nat_File_${selectedCategory.replace(/[^a-zA-Z0-9]/g, '_')}.xls`;
    try {
      onNotify?.(await exportNatFile(filtered, filename, 'xls'));
    } catch (err: any) {
      console.error(err);
      onNotify?.(`Download failed: ${err?.message || 'Unknown error'}`);
    }
  };

  return (
    <header style={{
      background: 'var(--header-bg)',
      borderBottom: '1px solid var(--border-color)',
      paddingTop: isNative
        ? 'max(calc(10px + env(safe-area-inset-top, 0px)), 34px)'
        : 'max(calc(10px + env(safe-area-inset-top, 0px)), 12px)',
      paddingBottom: 10,
      paddingLeft: 'max(calc(14px + env(safe-area-inset-left, 0px)), 14px)',
      paddingRight: 'max(calc(14px + env(safe-area-inset-right, 0px)), 14px)',
      position: 'sticky',
      top: 0,
      zIndex: 80,
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      boxSizing: 'border-box',
      width: '100%',
    }}>
      {/* Brand & Mobile Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <img
          src="/SwissNat SL Icon.png"
          alt="SwissNat SL"
          style={{
            width: 34,
            height: 34,
            borderRadius: 'var(--radius-sm)',
            objectFit: 'cover',
            display: 'block',
            flexShrink: 0,
          }}
        />
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'nowrap' }}>
            <h1 style={{
              fontSize: 16,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: 'var(--text-main)',
              margin: 0,
              whiteSpace: 'nowrap',
            }}>
              SwissNat <span style={{ color: 'var(--accent-gold)' }}>SL</span>
            </h1>
            <span style={{
              fontSize: 9,
              fontWeight: 700,
              padding: '1px 5px',
              borderRadius: 8,
              background: 'var(--accent-emerald-light)',
              color: 'var(--accent-emerald-dark)',
              textTransform: 'uppercase',
              flexShrink: 0,
            }}>
              App
            </span>
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {records.length > 0 ? `${records.length} Players` : 'Pairing Arbiter'}
          </span>
        </div>
      </div>

      {/* Right Controls: Action buttons (APK download button hidden inside native APK) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        {onOpenInstall && !isNative && (
          <button
            type="button"
            onClick={onOpenInstall}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '5px 8px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--accent-gold-light)',
              color: 'var(--accent-gold-dark)',
              border: '1px solid var(--accent-gold-border)',
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
              flexShrink: 0,
            }}
            title="Install SwissNat SL App (Mobile / Tablet / PC)"
          >
            <Smartphone size={13} />
            <span>APK / App</span>
          </button>
        )}

        {records.length > 0 && (
          <>
            <button
              type="button"
              onClick={handleShare}
              disabled={sharing}
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-sm)',
                background: 'var(--accent-emerald-light)',
                color: 'var(--accent-emerald-dark)',
                border: '1px solid var(--accent-emerald-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title="Share NAT file via WhatsApp, Telegram, etc."
            >
              {shareSuccess ? <CheckCircle2 size={16} /> : <Share2 size={16} />}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-sm)',
                background: 'var(--accent-gold)',
                color: '#ffffff',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title="Download .xls"
            >
              <Download size={16} />
            </button>
          </>
        )}
      </div>
    </header>
  );
};
