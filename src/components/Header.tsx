import React from 'react';
import { Download, Share2, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import type { NatRecord } from '../core/types';
import { downloadNatXls, downloadNatXlsx, shareNatFile } from '../core/natBuilder';
import type * as XLSX from 'xlsx';

interface HeaderProps {
  records: NatRecord[];
  selectedCategory: string;
  customTemplateWorkbook?: XLSX.WorkBook | null;
  onNotify?: (msg: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  records,
  selectedCategory,
  customTemplateWorkbook,
  onNotify,
}) => {
  const [sharing, setSharing] = React.useState(false);
  const [shareSuccess, setShareSuccess] = React.useState<boolean | null>(null);

  const filteredRecords = selectedCategory === 'all'
    ? records
    : records.filter(r => r.Category === selectedCategory);

  const handleDownloadXls = () => {
    if (filteredRecords.length === 0) return;
    try {
      const filename = selectedCategory === 'all'
        ? 'Nat_File_Master.xls'
        : `Nat_File_${selectedCategory.replace(/[^a-zA-Z0-9]/g, '_')}.xls`;
      downloadNatXls(filteredRecords, filename, customTemplateWorkbook);
      onNotify?.(`Downloaded "${filename}" (${filteredRecords.length} players) ready for Swiss-Manager!`);
    } catch (err: any) {
      console.error('Download XLS error:', err);
      alert(`Download failed: ${err.message || 'Unknown error'}`);
    }
  };

  const handleDownloadXlsx = () => {
    if (filteredRecords.length === 0) return;
    try {
      const filename = selectedCategory === 'all'
        ? 'Nat_File_Master.xlsx'
        : `Nat_File_${selectedCategory.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`;
      downloadNatXlsx(filteredRecords, filename, customTemplateWorkbook);
      onNotify?.(`Downloaded "${filename}" (${filteredRecords.length} players)`);
    } catch (err: any) {
      console.error('Download XLSX error:', err);
      alert(`Download failed: ${err.message || 'Unknown error'}`);
    }
  };

  const handleShare = async () => {
    if (filteredRecords.length === 0) return;
    setSharing(true);
    try {
      const filename = selectedCategory === 'all'
        ? 'Nat_File_Master.xls'
        : `Nat_File_${selectedCategory.replace(/[^a-zA-Z0-9]/g, '_')}.xls`;
      const res = await shareNatFile(filteredRecords, filename, customTemplateWorkbook);
      setShareSuccess(res);
      if (res) {
        onNotify?.('NAT file shared successfully!');
      }
    } catch (err) {
      console.error('Share error:', err);
    } finally {
      setSharing(false);
      setTimeout(() => setShareSuccess(null), 3000);
    }
  };

  return (
    <header style={{
      background: 'var(--header-bg)',
      borderBottom: '1px solid var(--border-color)',
      padding: '14px 24px',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      boxShadow: 'var(--shadow-xs)',
    }}>
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}>
        {/* Brand & Arbiter Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img
            src="/SwissNat SL Icon.png"
            alt="SwissNat SL Logo"
            style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-md)',
              objectFit: 'cover',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
              display: 'block',
              flexShrink: 0,
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h1 style={{
                fontSize: 19,
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: 'var(--text-main)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}>
                SwissNat <span style={{ color: 'var(--accent-gold)' }}>SL</span>
              </h1>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>
              Dedicated Pairing Arbiter Assistant
            </p>
          </div>
        </div>

        {/* Right Actions: Download .xls, .xlsx, Share */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={handleDownloadXls}
            disabled={filteredRecords.length === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 15px',
              fontSize: 13,
              fontWeight: 700,
              borderRadius: 'var(--radius-md)',
              background: filteredRecords.length === 0 ? 'var(--border-color)' : 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
              color: '#ffffff',
              boxShadow: filteredRecords.length === 0 ? 'none' : '0 3px 10px rgba(217, 119, 6, 0.25)',
              cursor: filteredRecords.length === 0 ? 'not-allowed' : 'pointer',
            }}
            title="Download Swiss-Manager compatible Excel 97-2003 BIFF8 .xls file"
          >
            <Download size={15} strokeWidth={2.4} />
            Download .xls ({filteredRecords.length})
          </button>

          <button
            onClick={handleDownloadXlsx}
            disabled={filteredRecords.length === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 12px',
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-card)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-xs)',
            }}
            title="Download modern Excel .xlsx file"
          >
            <FileSpreadsheet size={15} color="var(--accent-emerald)" />
            .xlsx
          </button>

          <button
            onClick={handleShare}
            disabled={filteredRecords.length === 0 || sharing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 12px',
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-emerald-light)',
              color: 'var(--accent-emerald-dark)',
              border: '1px solid var(--accent-emerald-border)',
            }}
            title="Share via WhatsApp, Telegram, Gmail, or Drive (Mobile / Web Share)"
          >
            {shareSuccess ? (
              <CheckCircle2 size={16} color="var(--accent-emerald)" />
            ) : (
              <Share2 size={15} />
            )}
            Share
          </button>
        </div>
      </div>
    </header>
  );
};
