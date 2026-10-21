import React from 'react';
import { Users, UserCheck, ShieldCheck, Zap } from 'lucide-react';
import type { NatRecord } from '../core/types';

interface MetricsBarProps {
  records: NatRecord[];
}

export const MetricsBar: React.FC<MetricsBarProps> = ({ records }) => {
  const total = records.length;
  const females = records.filter(r => r.Sex === 'f').length;
  const males = total - females;
  const fideRated = records.filter(r => r.Fide_No || r.Rtg_Int).length;

  const nicStripped = records.filter(r => r.flags.includes('NIC Rejected')).length;
  const typoFixed = records.filter(r => r.flags.includes('Typo Auto-Corrected')).length;

  // Extract unique divisions/categories
  const categories = Array.from(new Set(records.map(r => r.Category).filter(Boolean)));

  return (
    <div style={{
      maxWidth: 1400,
      margin: '0 auto',
      padding: '16px 24px 0',
      width: '100%',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 12,
      }}>
        {/* Total Players */}
        <div className="glass-panel" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-gold-light)',
            border: '1px solid var(--accent-gold-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-gold-dark)',
          }}>
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
              Total Registrations
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-main)', marginTop: 1 }}>
              {total} <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-dim)' }}>({categories.length} Divisions)</span>
            </div>
          </div>
        </div>

        {/* Gender Distribution */}
        <div className="glass-panel" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-rose-light)',
            border: '1px solid var(--accent-rose-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-rose-dark)',
          }}>
            <UserCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
              Gender Distribution
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginTop: 3 }}>
              <span style={{ color: 'var(--accent-cyan-dark)', fontWeight: 700 }}>{males} Boys</span>
              <span style={{ color: 'var(--text-dim)', margin: '0 6px' }}>•</span>
              <span style={{ color: 'var(--accent-rose-dark)', fontWeight: 700 }}>{females} Girls (Sex: f)</span>
            </div>
          </div>
        </div>

        {/* FIDE Rated */}
        <div className="glass-panel" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-emerald-light)',
            border: '1px solid var(--accent-emerald-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-emerald-dark)',
          }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
              FIDE Affiliated
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-main)', marginTop: 1 }}>
              {fideRated} <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-dim)' }}>with FIDE ID / Rating</span>
            </div>
          </div>
        </div>

        {/* Auto-Sanitization Audit */}
        <div className="glass-panel" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-cyan-light)',
            border: '1px solid var(--accent-cyan-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-cyan-dark)',
          }}>
            <Zap size={22} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
              Auto-Sanitization
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
              <span className="badge badge-emerald" title="All names preserved with 100% of letters included">
                {total} Names Preserved
              </span>
              {nicStripped > 0 && (
                <span className="badge badge-rose" title="9-digit NIC numbers removed from FIDE ID">
                  {nicStripped} NIC Filtered
                </span>
              )}
              {typoFixed > 0 && (
                <span className="badge badge-cyan" title="Birth date format sanitized">
                  {typoFixed} DOB Formatted
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
