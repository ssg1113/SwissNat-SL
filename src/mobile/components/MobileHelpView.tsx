import React from 'react';
import { Sparkles, BookOpen, Smartphone, Download, ArrowRight } from 'lucide-react';

interface MobileHelpViewProps {
  onOpenInstall?: () => void;
}

export const MobileHelpView: React.FC<MobileHelpViewProps> = ({ onOpenInstall }) => {
  return (
    <div style={{ padding: '16px 14px 80px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Install App Card */}
      {onOpenInstall && (
        <div
          className="glass-panel"
          style={{
            padding: 16,
            background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.1) 0%, rgba(245, 158, 11, 0.04) 100%)',
            border: '1px solid var(--accent-gold-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Smartphone size={18} color="var(--accent-gold)" />
              <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Install SwissNat SL App
              </h3>
            </div>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: 8,
                background: 'var(--accent-gold-light)',
                color: 'var(--accent-gold-dark)',
              }}
            >
              Offline Ready
            </span>
          </div>

          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 12px 0' }}>
            Add SwissNat SL to your phone or tablet home screen for 1-tap launch in tournament halls with no internet.
          </p>

          <button
            type="button"
            onClick={onOpenInstall}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-gold)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(217, 119, 6, 0.3)',
            }}
          >
            <Download size={15} />
            <span>View Install Options (Mobile &amp; PC)</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      <div className="glass-panel" style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <BookOpen size={20} color="var(--accent-gold)" />
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            Swiss-Manager Import Guide
          </h3>
        </div>

        <ol style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <li>Open <strong>Swiss-Manager</strong> on your computer.</li>
          <li>Go to top menu: <strong>Specials</strong> &rarr; <strong>Options...</strong></li>
          <li>Click the tab: <strong>Rating lists</strong>.</li>
          <li>Click the button: <strong>Import rating list</strong>.</li>
          <li>Select <strong>"NAT rating list"</strong> and choose your downloaded <code>.xls</code> file.</li>
          <li>Click <strong>"Start import"</strong> to build <code>RatingNat.DAT</code>.</li>
          <li>Verify the player count in the log window.</li>
        </ol>
      </div>

      <div className="glass-panel" style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <Sparkles size={18} color="var(--accent-emerald)" />
          <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
            Sri Lankan CFSL Conventions
          </h4>
        </div>
        <ul style={{ paddingLeft: 18, margin: 0, fontSize: 12.5, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <li>Initials with dots are normalized with spaces (e.g. <code>K.G.Banuja</code> &rarr; <code>K G Banuja</code>).</li>
          <li>Combined length of Last Name + First Name is kept under 32 characters to prevent Swiss-Manager truncation.</li>
          <li>Sinhala school names are transliterated/translated into English standard format.</li>
          <li>9-digit National Identity Card (NIC) numbers are automatically filtered from FIDE ID.</li>
        </ul>
      </div>

      <div style={{ textAlign: 'center', padding: '10px 0', fontSize: 11, color: 'var(--text-dim)' }}>
        Created &amp; Developed by <strong>S S Gayashan De Silva</strong> &bull; National Arbiter &bull; Sri Lanka
      </div>
    </div>
  );
};
