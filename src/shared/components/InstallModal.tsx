import React, { useState } from 'react';
import {
  Monitor,
  Smartphone,
  Download,
  X,
  CheckCircle2,
  ExternalLink,
  Laptop,
  Tablet,
  Share,
  PlusSquare,
  ShieldCheck,
  Zap,
  WifiOff,
  Sparkles,
} from 'lucide-react';
import { usePwaInstall } from '../hooks/usePwaInstall';

export interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'pc' | 'mobile';
}

export const InstallModal: React.FC<InstallModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'pc',
}) => {
  const { canInstall, isInstalled, platform, promptInstall } = usePwaInstall();
  const [activeTab, setActiveTab] = useState<'pc' | 'mobile'>(() => {
    if (defaultTab) return defaultTab;
    return platform === 'android' || platform === 'ios' ? 'mobile' : 'pc';
  });
  const [mobileSubTab, setMobileSubTab] = useState<'android' | 'ios'>(() => {
    return platform === 'ios' ? 'ios' : 'android';
  });
  const [installResult, setInstallResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePwaInstall = async () => {
    const outcome = await promptInstall();
    if (outcome === 'accepted') {
      setInstallResult('SwissNat SL has been installed! You can now launch it directly from your device.');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(5, 8, 16, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: 620,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px var(--border-color)',
          overflow: 'hidden',
          animation: 'modalSlideUp 0.22s ease-out',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-secondary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img
              src="/SwissNat SL Icon.png"
              alt="SwissNat SL Logo"
              style={{
                width: 38,
                height: 38,
                borderRadius: 'var(--radius-sm)',
                objectFit: 'cover',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
              }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2
                  style={{
                    fontSize: 17,
                    fontWeight: 800,
                    margin: 0,
                    color: 'var(--text-main)',
                  }}
                >
                  Install SwissNat <span style={{ color: 'var(--accent-gold)' }}>SL</span>
                </h2>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: 10,
                    background: 'var(--accent-gold-light)',
                    color: 'var(--accent-gold-dark)',
                    border: '1px solid var(--accent-gold-border)',
                    textTransform: 'uppercase',
                  }}
                >
                  Free &amp; Offline
                </span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, marginTop: 2 }}>
                Separate installation options for PC/Laptop and Mobile/Tablet
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: 6,
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Primary Target Tabs: PC vs Mobile */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: 'var(--bg-secondary)',
            padding: '8px 16px 0',
            gap: 8,
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          {/* PC / Laptop Option Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('pc')}
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
              border: 'none',
              background: activeTab === 'pc' ? 'var(--bg-card)' : 'transparent',
              borderBottom: activeTab === 'pc' ? '2px solid var(--accent-gold)' : '2px solid transparent',
              color: activeTab === 'pc' ? 'var(--accent-gold)' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Laptop size={16} />
            <span>PC &amp; Laptop</span>
            {platform === 'pc' && (
              <span
                style={{
                  fontSize: 10,
                  padding: '1px 5px',
                  borderRadius: 6,
                  background: 'var(--accent-emerald-light)',
                  color: 'var(--accent-emerald-dark)',
                }}
              >
                Your Device
              </span>
            )}
          </button>

          {/* Mobile & Tablet Option Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('mobile')}
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
              border: 'none',
              background: activeTab === 'mobile' ? 'var(--bg-card)' : 'transparent',
              borderBottom: activeTab === 'mobile' ? '2px solid var(--accent-gold)' : '2px solid transparent',
              color: activeTab === 'mobile' ? 'var(--accent-gold)' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Smartphone size={16} />
            <span>Mobile &amp; Tablet</span>
            {(platform === 'android' || platform === 'ios') && (
              <span
                style={{
                  fontSize: 10,
                  padding: '1px 5px',
                  borderRadius: 6,
                  background: 'var(--accent-emerald-light)',
                  color: 'var(--accent-emerald-dark)',
                }}
              >
                Your Device
              </span>
            )}
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {installResult && (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent-emerald-light)',
                border: '1px solid var(--accent-emerald-border)',
                color: 'var(--accent-emerald-dark)',
                fontSize: 13,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <CheckCircle2 size={18} />
              <span>{installResult}</span>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 1: PC & LAPTOP INSTALLATION OPTIONS                         */}
          {/* ============================================================== */}
          {activeTab === 'pc' && (
            <>
              {/* Primary Action Hero Card for PC */}
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.08) 0%, rgba(245, 158, 11, 0.03) 100%)',
                  border: '1px solid var(--accent-gold-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                      Install as Desktop Application
                    </h3>
                    <p style={{ fontSize: 12.5, color: 'var(--text-muted)', margin: 0, marginTop: 2 }}>
                      Pin to Windows Taskbar, macOS Dock, or Desktop alongside Swiss-Manager.
                    </p>
                  </div>

                  {canInstall && !isInstalled && (
                    <button
                      type="button"
                      onClick={handlePwaInstall}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '10px 18px',
                        fontSize: 13,
                        fontWeight: 700,
                        borderRadius: 'var(--radius-md)',
                        background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                        color: '#ffffff',
                        boxShadow: '0 4px 14px rgba(217, 119, 6, 0.35)',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <Download size={16} strokeWidth={2.4} />
                      Install on this PC
                    </button>
                  )}

                  {isInstalled && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '6px 12px',
                        borderRadius: 20,
                        background: 'var(--accent-emerald-light)',
                        color: 'var(--accent-emerald-dark)',
                        fontSize: 12,
                        fontWeight: 700,
                        border: '1px solid var(--accent-emerald-border)',
                      }}
                    >
                      <CheckCircle2 size={14} /> Already Installed
                    </span>
                  )}
                </div>

                {/* PC Features Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                    gap: 10,
                    marginTop: 4,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-main)' }}>
                    <Monitor size={14} color="var(--accent-gold)" />
                    <span>Standalone Window</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-main)' }}>
                    <WifiOff size={14} color="var(--accent-emerald)" />
                    <span>Works Offline</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-main)' }}>
                    <Zap size={14} color="var(--accent-gold)" />
                    <span>Instant Launch</span>
                  </div>
                </div>
              </div>

              {/* Browser Instructions for PC */}
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 10 }}>
                  How to Install on Desktop Browsers:
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {/* Chrome Guide */}
                  <div
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>
                        Google Chrome
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                      Click the <strong>Install icon</strong> in the right side of the address bar (looks like a monitor with down-arrow), or click <strong>Menu (⋮) &rarr; Save and share &rarr; Install SwissNat SL</strong>.
                    </p>
                  </div>

                  {/* Microsoft Edge Guide */}
                  <div
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>
                        Microsoft Edge
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                      Click the <strong>App available</strong> icon in the address bar (three squares with plus), or click <strong>Menu (&hellip;) &rarr; Apps &rarr; Install SwissNat SL</strong>.
                    </p>
                  </div>

                  {/* Safari Mac Guide */}
                  <div
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>
                        Apple Safari on Mac (macOS Sonoma+)
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                      Click <strong>File</strong> in the top menu bar &rarr; choose <strong>Add to Dock</strong> to create an official Mac application.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ============================================================== */}
          {/* TAB 2: MOBILE & TABLET INSTALLATION OPTIONS                     */}
          {/* ============================================================== */}
          {activeTab === 'mobile' && (
            <>
              {/* Mobile Sub-selector: Android vs iPhone/iPad */}
              <div
                style={{
                  display: 'inline-flex',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: 3,
                  gap: 4,
                  alignSelf: 'flex-start',
                }}
              >
                <button
                  type="button"
                  onClick={() => setMobileSubTab('android')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: mobileSubTab === 'android' ? 'var(--accent-gold)' : 'transparent',
                    color: mobileSubTab === 'android' ? '#ffffff' : 'var(--text-muted)',
                    fontWeight: 600,
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  Android (Phone &amp; Tab)
                </button>
                <button
                  type="button"
                  onClick={() => setMobileSubTab('ios')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: mobileSubTab === 'ios' ? 'var(--accent-gold)' : 'transparent',
                    color: mobileSubTab === 'ios' ? '#ffffff' : 'var(--text-muted)',
                    fontWeight: 600,
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  Apple iOS (iPhone &amp; iPad)
                </button>
              </div>

              {/* Android Section */}
              {mobileSubTab === 'android' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Android Quick Install Card */}
                  <div
                    style={{
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.03) 100%)',
                      border: '1px solid var(--accent-emerald-border)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '16px 18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                      <div>
                        <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                          Android Web App (PWA)
                        </h4>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, marginTop: 2 }}>
                          Instant installation without downloading large files. Runs full screen.
                        </p>
                      </div>

                      {canInstall && (
                        <button
                          type="button"
                          onClick={handlePwaInstall}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '8px 14px',
                            fontSize: 12.5,
                            fontWeight: 700,
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--accent-emerald)',
                            color: '#ffffff',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          <Download size={15} />
                          Install on Android
                        </button>
                      )}
                    </div>

                    <div style={{ fontSize: 12, color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div>
                        <strong>Chrome for Android manual steps:</strong>
                      </div>
                      <ol style={{ paddingLeft: 18, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <li>Tap the <strong>three dots (⋮)</strong> in Chrome.</li>
                        <li>Tap <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong>.</li>
                        <li>Confirm <strong>"Install"</strong>. SwissNat SL will appear in your app drawer.</li>
                      </ol>
                    </div>
                  </div>

                  {/* Android Native APK Package */}
                  <div
                    style={{
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                      <div>
                        <h5 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                          Android APK / Native Build
                        </h5>
                        <p style={{ fontSize: 11.5, color: 'var(--text-muted)', margin: 0, marginTop: 2 }}>
                          Capacitor Android package for pairing arbiters with native WhatsApp &amp; Telegram file share.
                        </p>
                      </div>

                      <a
                        href="https://github.com/ssg1113/SwissNat-SL/releases"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '6px 12px',
                          fontSize: 12,
                          fontWeight: 600,
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-card)',
                          color: 'var(--text-main)',
                          border: '1px solid var(--border-color)',
                          textDecoration: 'none',
                        }}
                      >
                        <ExternalLink size={13} />
                        GitHub Releases
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* iOS (iPhone & iPad) Section */}
              {mobileSubTab === 'ios' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div
                    style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '16px 18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Tablet size={18} color="var(--accent-gold)" />
                      <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                        Add to Home Screen on iPhone &amp; iPad
                      </h4>
                    </div>

                    <p style={{ fontSize: 12.5, color: 'var(--text-muted)', margin: 0 }}>
                      Apple iOS allows you to install SwissNat SL directly through Safari without going to the App Store:
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 12.5 }}>
                        <div
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            background: 'var(--accent-gold)',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          1
                        </div>
                        <div>
                          Open <strong>SwissNat SL</strong> in <strong>Safari</strong> on your iPhone or iPad.
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 12.5 }}>
                        <div
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            background: 'var(--accent-gold)',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          2
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          Tap the <strong>Share</strong> button <Share size={15} color="var(--accent-gold)" /> at the bottom (iPhone) or top (iPad).
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 12.5 }}>
                        <div
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            background: 'var(--accent-gold)',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          3
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          Scroll down and tap <strong>"Add to Home Screen"</strong> <PlusSquare size={15} color="var(--accent-emerald)" />.
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 12.5 }}>
                        <div
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            background: 'var(--accent-gold)',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          4
                        </div>
                        <div>
                          Tap <strong>"Add"</strong> in the top-right corner. The app will launch with full screen standalone mode.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile Features Summary */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: 10,
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-secondary)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'var(--text-main)' }}>
                  <Smartphone size={14} color="var(--accent-gold)" />
                  <span>Touch-Optimized</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'var(--text-main)' }}>
                  <Sparkles size={14} color="var(--accent-emerald)" />
                  <span>1-Tap WhatsApp Share</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'var(--text-main)' }}>
                  <ShieldCheck size={14} color="var(--accent-gold)" />
                  <span>100% Client-Side</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-secondary)',
            fontSize: 12,
            color: 'var(--text-muted)',
          }}
        >
          <span>SwissNat SL &bull; Pairing Arbiter Assistant</span>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
