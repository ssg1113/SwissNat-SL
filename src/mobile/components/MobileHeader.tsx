import React from 'react';
import { Share2, Download, CheckCircle2, Smartphone } from 'lucide-react';
import type { NatRecord } from '../../core/types';
import { downloadNatXls, shareNatFile } from '../../core/natBuilder';

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

  const handleDownload = () => {
    if (filtered.length === 0) return;
    const filename = selectedCategory === 'all'
      ? 'Nat_File_Master.xls'
      : `Nat_File_${selectedCategory.replace(/[^a-zA-Z0-9]/g, '_')}.xls`;
    downloadNatXls(filtered, filename);
    onNotify?.(`Downloaded "${filename}" (${filtered.length} players)`);
  };

  return (
    <header style={{
      background: 'var(--header-bg)',
      borderBottom: '1px solid var(--border-color)',
      padding: '10px 14px',
      position: 'sticky',
      top: 0,
      zIndex: 80,
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
    }}>
      {/* Brand & Mobile Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <img
          src="/SwissNat SL Icon.png"
          alt="SwissNat SL"
          style={{
            width: 34,
            height: 34,
            borderRadius: 'var(--radius-sm)',
            objectFit: 'cover',
            display: 'block',
          }}
        />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <h1 style={{
              fontSize: 16,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: 'var(--text-main)',
              margin: 0,
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
            }}>
              App
            </span>
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {records.length > 0 ? `${records.length} Players` : 'Pairing Arbiter'}
          </span>
        </div>
      </div>

      {/* Right Controls: View Switcher & Action buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {onOpenInstall && (
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
            }}
            title="Install SwissNat SL App (Mobile / Tablet / PC)"
          >
            <Smartphone size={13} />
            <span>Install</span>
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
