import React from 'react';
import { Sparkles, BookOpen, Smartphone, Download, ArrowRight } from 'lucide-react';
import { SiteInfoSection } from '../../shared/components/SiteInfoSection';

interface MobileHelpViewProps {
  onOpenInstall?: () => void;
  onGoToImport?: () => void;
}

export const MobileHelpView: React.FC<MobileHelpViewProps> = ({ onOpenInstall, onGoToImport }) => {
  return (
    <div style={{ padding: '16px 14px 80px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Install App Card */}
      <div
        className="glass-panel"
        style={{
          padding: 16,
          background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.12) 0%, rgba(245, 158, 11, 0.04) 100%)',
          border: '1.5px solid var(--accent-gold)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Smartphone size={18} color="var(--accent-gold)" />
            <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              SwissNat SL for Mobile
            </h3>
          </div>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: '2px 7px',
              borderRadius: 8,
              background: 'var(--accent-gold)',
              color: '#ffffff',
            }}
          >
            Android APK
          </span>
        </div>

        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 12px 0', lineHeight: 1.45 }}>
          Download the Android APK to your phone for 1-tap launch, full offline data cleaning, and instant WhatsApp &amp; Telegram file sharing.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <a
            href="https://github.com/ssg1113/SwissNat-SL/releases/latest/download/SwissNat-SL.apk"
            download="SwissNat-SL.apk"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '11px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 800,
              fontSize: 13.5,
              cursor: 'pointer',
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(217, 119, 6, 0.35)',
            }}
          >
            <Download size={16} strokeWidth={2.4} />
            <span>Download Android APK (.apk)</span>
          </a>

          {onOpenInstall && (
            <button
              type="button"
              onClick={onOpenInstall}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '9px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-color)',
                fontWeight: 600,
                fontSize: 12.5,
                cursor: 'pointer',
              }}
            >
              <span>Other Install Options (iOS Safari / PC)</span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>
      </div>

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

      <SiteInfoSection onGetStarted={onGoToImport} />

      <div style={{ textAlign: 'center', padding: '10px 0', fontSize: 11, color: 'var(--text-dim)' }}>
        Created &amp; Developed by <strong>S S Gayashan De Silva</strong> &bull; National Arbiter &bull; Sri Lanka
      </div>
    </div>
  );
};
