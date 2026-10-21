import React, { useState } from 'react';
import { X, ArrowLeftRight, Trash2, Check, User, School, Calendar, Award } from 'lucide-react';
import type { NatRecord } from '../../core/types';
import { recalculateRecordFlags } from '../../core/sanitizer';

interface MobilePlayerModalProps {
  player: NatRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: NatRecord) => void;
  onDelete: (id: string) => void;
}

export const MobilePlayerModal: React.FC<MobilePlayerModalProps> = ({
  player,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const [prevId, setPrevId] = useState<string | undefined>(player?.id);
  const [form, setForm] = useState<NatRecord>(() => (player ? { ...player } : ({} as NatRecord)));

  if (player && player.id !== prevId) {
    setPrevId(player.id);
    setForm({ ...player });
  }

  if (!isOpen || !player) return null;

  const handleChange = (field: keyof NatRecord, value: any) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value };
      return recalculateRecordFlags(updated);
    });
  };

  const handleSwapNames = () => {
    setForm(prev => {
      const updated = {
        ...prev,
        LastName: prev.FirstName,
        FirstName: prev.LastName,
      };
      return recalculateRecordFlags(updated);
    });
  };

  const handleSave = () => {
    onSave(form);
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm(`Delete "${form.LastName}, ${form.FirstName}"?`)) {
      onDelete(form.id);
      onClose();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 110,
      background: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
    }}>
      {/* Modal Sheet */}
      <div style={{
        background: 'var(--bg-card)',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.3)',
        animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)',
        }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
              Edit Player #{form.ID_No}
            </h3>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {form.Category || 'Open Division'}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'var(--bg-secondary)',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Name Section with Swap Button */}
          <div style={{
            background: 'var(--bg-secondary)',
            padding: 12,
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <User size={14} color="var(--accent-gold)" />
                Player Name Split
              </span>
              <button
                type="button"
                onClick={handleSwapNames}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '4px 8px',
                  borderRadius: 6,
                  background: 'var(--accent-gold-light)',
                  color: 'var(--accent-gold-dark)',
                  border: '1px solid var(--accent-gold-border)',
                  cursor: 'pointer',
                }}
              >
                <ArrowLeftRight size={12} />
                Swap Last/First
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent-gold-dark)', display: 'block', marginBottom: 2 }}>
                  Last Name (Surname / Family Name):
                </label>
                <input
                  type="text"
                  value={form.LastName}
                  onChange={e => handleChange('LastName', e.target.value)}
                  className="cell-input"
                  style={{ width: '100%', padding: '8px 10px', fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>
                  First Name (Initials + Given Names):
                </label>
                <input
                  type="text"
                  value={form.FirstName}
                  onChange={e => handleChange('FirstName', e.target.value)}
                  className="cell-input"
                  style={{ width: '100%', padding: '8px 10px' }}
                />
              </div>
            </div>
          </div>

          {/* School / Club Section */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
              <School size={14} color="var(--accent-emerald)" />
              School / Chess Club:
            </label>
            <input
              type="text"
              value={form.ClubName}
              onChange={e => handleChange('ClubName', e.target.value)}
              className="cell-input"
              style={{ width: '100%', padding: '8px 10px' }}
            />
          </div>

          {/* Birthday & Gender Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                <Calendar size={14} color="var(--accent-cyan)" />
                Birthday (YYYYMMDD):
              </label>
              <input
                type="text"
                maxLength={8}
                value={form.Birthday}
                onChange={e => handleChange('Birthday', e.target.value)}
                placeholder="20120514"
                className="cell-input font-mono"
                style={{ width: '100%', padding: '8px 10px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: 4 }}>
                Gender:
              </label>
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  type="button"
                  onClick={() => handleChange('Sex', '')}
                  style={{
                    flex: 1,
                    padding: '8px 0',
                    fontSize: 12,
                    fontWeight: 700,
                    borderRadius: 6,
                    border: '1px solid var(--border-color)',
                    background: form.Sex !== 'f' ? 'var(--accent-cyan-light)' : 'var(--bg-secondary)',
                    color: form.Sex !== 'f' ? 'var(--accent-cyan-dark)' : 'var(--text-dim)',
                    cursor: 'pointer',
                  }}
                >
                  Male
                </button>
                <button
                  type="button"
                  onClick={() => handleChange('Sex', 'f')}
                  style={{
                    flex: 1,
                    padding: '8px 0',
                    fontSize: 12,
                    fontWeight: 700,
                    borderRadius: 6,
                    border: '1px solid var(--border-color)',
                    background: form.Sex === 'f' ? 'var(--accent-rose-light)' : 'var(--bg-secondary)',
                    color: form.Sex === 'f' ? 'var(--accent-rose-dark)' : 'var(--text-dim)',
                    cursor: 'pointer',
                  }}
                >
                  Female (f)
                </button>
              </div>
            </div>
          </div>

          {/* FIDE ID & Rating Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                <Award size={14} color="var(--accent-purple)" />
                FIDE ID:
              </label>
              <input
                type="text"
                value={form.Fide_No}
                onChange={e => handleChange('Fide_No', e.target.value)}
                placeholder="e.g. 9931234"
                className="cell-input font-mono"
                style={{ width: '100%', padding: '8px 10px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: 4 }}>
                FIDE Rating:
              </label>
              <input
                type="text"
                value={form.Rtg_Int}
                onChange={e => handleChange('Rtg_Int', e.target.value)}
                placeholder="e.g. 1450"
                className="cell-input font-mono"
                style={{ width: '100%', padding: '8px 10px' }}
              />
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '14px 20px',
          borderTop: '1px solid var(--border-color)',
          background: 'var(--bg-secondary)',
        }}>
          <button
            type="button"
            onClick={handleDelete}
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-rose-light)',
              color: 'var(--accent-rose-dark)',
              border: '1px solid var(--accent-rose-border)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Trash2 size={16} />
            Delete
          </button>

          <button
            type="button"
            onClick={handleSave}
            style={{
              flex: 1,
              padding: '10px 18px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
              color: '#ffffff',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              fontSize: 13,
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(217, 119, 6, 0.25)',
              cursor: 'pointer',
            }}
          >
            <Check size={16} strokeWidth={2.5} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
