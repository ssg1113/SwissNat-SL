import React, { useState } from 'react';
import { Share2, Download, FileSpreadsheet, CheckCircle2, ShieldCheck, Users, HelpCircle } from 'lucide-react';
import type { NatRecord } from '../../core/types';
import { exportNatFile, shareNatFile } from '../../core/natBuilder';

interface MobileExportViewProps {
  records: NatRecord[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onNotify?: (msg: string) => void;
}

export const MobileExportView: React.FC<MobileExportViewProps> = ({
  records,
  selectedCategory,
  onSelectCategory,
  onNotify,
}) => {
  const [sharing, setSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState<boolean | null>(null);

  const categories = Array.from(new Set(records.map(r => r.Category).filter(Boolean)));
  const filtered = selectedCategory === 'all'
    ? records
    : records.filter(r => r.Category === selectedCategory);

  const total = filtered.length;
  const females = filtered.filter(r => r.Sex === 'f').length;
  const males = total - females;
  const fideCount = filtered.filter(r => r.Fide_No || r.Rtg_Int).length;

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

  const handleDownloadXls = async () => {
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

  const handleDownloadXlsx = async () => {
    if (filtered.length === 0) return;
    const filename = selectedCategory === 'all'
      ? 'Nat_File_Master.xlsx'
      : `Nat_File_${selectedCategory.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`;
    try {
      onNotify?.(await exportNatFile(filtered, filename, 'xlsx'));
    } catch (err: any) {
      console.error(err);
      onNotify?.(`Download failed: ${err?.message || 'Unknown error'}`);
    }
  };

  return (
    <div style={{ padding: '16px 14px 80px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Category Selection Filter */}
      {categories.length > 0 && (
        <div className="glass-panel" style={{ padding: 12 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
            Export Target Division:
          </label>
          <select
            value={selectedCategory}
            onChange={e => onSelectCategory(e.target.value)}
            className="cell-input"
            style={{ width: '100%', padding: '8px 10px', fontSize: 13, fontWeight: 700 }}
          >
            <option value="all">🏆 All Divisions / Master File ({records.length} players)</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat} ({records.filter(r => r.Category === cat).length} players)
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Quick Summary Pill Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 8,
        textAlign: 'center',
      }}>
        <div style={{ background: 'var(--bg-secondary)', padding: '10px 8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Total</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)', marginTop: 2 }}>{total}</div>
        </div>
        <div style={{ background: 'var(--bg-secondary)', padding: '10px 8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Boys / Girls</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginTop: 4 }}>{males} / {females}</div>
        </div>
        <div style={{ background: 'var(--bg-secondary)', padding: '10px 8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>FIDE Rated</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent-purple)', marginTop: 2 }}>{fideCount}</div>
        </div>
      </div>

      {/* Big Action 1: Mobile Share */}
      <div
        onClick={handleShare}
        className="glass-panel"
        style={{
          padding: 16,
          borderRadius: 'var(--radius-lg)',
          cursor: total === 0 ? 'not-allowed' : 'pointer',
          opacity: total === 0 ? 0.6 : 1,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          border: '1.5px solid var(--accent-emerald)',
          background: 'var(--accent-emerald-light)',
        }}
      >
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 'var(--radius-md)',
          background: 'var(--accent-emerald)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          {shareSuccess ? <CheckCircle2 size={22} /> : <Share2 size={22} />}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--accent-emerald-dark)' }}>
            Share NAT File via Mobile
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>
            Instant share to WhatsApp, Telegram, Gmail, or Google Drive
          </div>
        </div>
      </div>

      {/* Big Action 2: Download .xls (Swiss-Manager standard) */}
      <div
        onClick={handleDownloadXls}
        className="glass-panel"
        style={{
          padding: 16,
          borderRadius: 'var(--radius-lg)',
          cursor: total === 0 ? 'not-allowed' : 'pointer',
          opacity: total === 0 ? 0.6 : 1,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          border: '1.5px solid var(--accent-gold)',
          background: 'var(--bg-card)',
        }}
      >
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 'var(--radius-md)',
          background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Download size={22} strokeWidth={2.5} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-main)' }}>
            Download .xls (Swiss-Manager)
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            Excel 97-2003 BIFF8 with Sheet 1 (Nat) and Sheet 2 (Help)
          </div>
        </div>
      </div>

      {/* Big Action 3: Download .xlsx */}
      <div
        onClick={handleDownloadXlsx}
        className="glass-panel"
        style={{
          padding: 16,
          borderRadius: 'var(--radius-lg)',
          cursor: total === 0 ? 'not-allowed' : 'pointer',
          opacity: total === 0 ? 0.6 : 1,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          border: '1px solid var(--border-color)',
          background: 'var(--bg-secondary)',
        }}
      >
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          color: 'var(--accent-emerald)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <FileSpreadsheet size={22} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)' }}>
            Download .xlsx (Modern Excel)
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            Compatible with modern Microsoft Excel, Google Sheets, LibreOffice
          </div>
        </div>
      </div>
    </div>
  );
};
