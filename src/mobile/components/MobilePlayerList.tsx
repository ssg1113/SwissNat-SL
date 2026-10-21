import React, { useState } from 'react';
import { Search, Plus, ArrowLeftRight, School, Calendar, Award, ChevronRight, UserPlus, AlertCircle } from 'lucide-react';
import type { NatRecord } from '../../core/types';
import { MobilePlayerModal } from './MobilePlayerModal';
import { recalculateRecordFlags } from '../../core/sanitizer';

interface MobilePlayerListProps {
  records: NatRecord[];
  onRecordsChange: (records: NatRecord[]) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onNotify?: (msg: string) => void;
}

export const MobilePlayerList: React.FC<MobilePlayerListProps> = ({
  records,
  onRecordsChange,
  selectedCategory,
  onSelectCategory,
  onNotify,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPlayer, setEditingPlayer] = useState<NatRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const categories = Array.from(new Set(records.map(r => r.Category).filter(Boolean)));

  const filtered = records.filter(r => {
    const matchesCat = selectedCategory === 'all' || r.Category === selectedCategory;
    if (!searchQuery.trim()) return matchesCat;
    const q = searchQuery.toLowerCase().trim();
    return matchesCat && (
      r.LastName.toLowerCase().includes(q) ||
      r.FirstName.toLowerCase().includes(q) ||
      r.ClubName.toLowerCase().includes(q) ||
      r.Fide_No.includes(q) ||
      r.ID_No.includes(q)
    );
  });

  const handleCardClick = (player: NatRecord) => {
    setEditingPlayer(player);
    setModalOpen(true);
  };

  const handleSavePlayer = (updated: NatRecord) => {
    onRecordsChange(records.map(r => r.id === updated.id ? updated : r));
    onNotify?.(`Updated player "${updated.LastName}, ${updated.FirstName}"`);
  };

  const handleDeletePlayer = (id: string) => {
    onRecordsChange(records.filter(r => r.id !== id));
    onNotify?.('Player deleted');
  };

  const handleQuickSwap = (e: React.MouseEvent, record: NatRecord) => {
    e.stopPropagation();
    const updated = recalculateRecordFlags({
      ...record,
      LastName: record.FirstName,
      FirstName: record.LastName,
    });
    onRecordsChange(records.map(r => r.id === record.id ? updated : r));
    onNotify?.(`Swapped names: ${updated.LastName}, ${updated.FirstName}`);
  };

  const handleAddNewPlayer = () => {
    const newId = String(records.length + 1);
    const newRecord: NatRecord = {
      id: `new_${Date.now()}`,
      ID_No: newId,
      LastName: 'NEW',
      FirstName: 'Player',
      Sex: '',
      Fed: 'SRI',
      Clubnumber: '',
      ClubName: '',
      Birthday: '',
      Rtg_Nat: '',
      Fide_No: '',
      Rtg_Int: '',
      Title: '',
      K: '',
      Category: selectedCategory === 'all' ? (categories[0] || 'Open') : selectedCategory,
      rawName: 'NEW Player',
      rawSchool: '',
      flags: [],
    };
    onRecordsChange([newRecord, ...records]);
    setEditingPlayer(newRecord);
    setModalOpen(true);
  };

  return (
    <div style={{ padding: '12px 14px 80px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Search Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '8px 12px',
        gap: 8,
      }}>
        <Search size={16} color="var(--text-muted)" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search by name, school, FIDE ID..."
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-main)',
            fontSize: 13,
            width: '100%',
          }}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-dim)',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Horizontal Category Chips */}
      {categories.length > 0 && (
        <div style={{
          display: 'flex',
          gap: 6,
          overflowX: 'auto',
          paddingBottom: 4,
          scrollbarWidth: 'none',
        }}>
          <button
            type="button"
            onClick={() => onSelectCategory('all')}
            style={{
              padding: '6px 12px',
              borderRadius: 16,
              fontSize: 12,
              fontWeight: 700,
              whiteSpace: 'nowrap',
              border: '1px solid ' + (selectedCategory === 'all' ? 'var(--accent-gold)' : 'var(--border-color)'),
              background: selectedCategory === 'all' ? 'var(--accent-gold)' : 'var(--bg-secondary)',
              color: selectedCategory === 'all' ? '#ffffff' : 'var(--text-main)',
              cursor: 'pointer',
            }}
          >
            All ({records.length})
          </button>

          {categories.map(cat => {
            const count = records.filter(r => r.Category === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onSelectCategory(cat)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 16,
                  fontSize: 12,
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  border: '1px solid ' + (isSelected ? 'var(--accent-gold)' : 'var(--border-color)'),
                  background: isSelected ? 'var(--accent-gold)' : 'var(--bg-secondary)',
                  color: isSelected ? '#ffffff' : 'var(--text-main)',
                  cursor: 'pointer',
                }}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Top Status & Add Player Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 4px' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>
          Showing {filtered.length} of {records.length} players
        </span>

        <button
          type="button"
          onClick={handleAddNewPlayer}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '6px 12px',
            fontSize: 12,
            fontWeight: 700,
            borderRadius: 'var(--radius-sm)',
            background: 'var(--accent-gold-light)',
            color: 'var(--accent-gold-dark)',
            border: '1px solid var(--accent-gold-border)',
            cursor: 'pointer',
          }}
        >
          <UserPlus size={14} />
          Add Player
        </button>
      </div>

      {/* Player Cards List */}
      {filtered.length === 0 ? (
        <div className="glass-panel" style={{ padding: '36px 20px', textAlign: 'center' }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-main)', margin: '0 0 6px' }}>
            No players found
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
            Try adjusting your search query or division filter.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(record => (
            <div
              key={record.id}
              onClick={() => handleCardClick(record)}
              className="glass-panel"
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
            >
              {/* Card Top Row: ID, Name, Quick Swap */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                  <span style={{
                    width: 26,
                    height: 26,
                    borderRadius: 6,
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--text-dim)',
                    fontFamily: 'monospace',
                    flexShrink: 0,
                  }}>
                    {record.ID_No}
                  </span>

                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.3 }}>
                      <span style={{ color: 'var(--accent-gold-dark)' }}>{record.LastName}</span>
                      {record.FirstName ? `, ${record.FirstName}` : ''}
                    </div>
                    {record.Category && (
                      <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                        {record.Category}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    type="button"
                    onClick={(e) => handleQuickSwap(e, record)}
                    title="Quick swap Last and First name"
                    style={{
                      padding: '4px 6px',
                      borderRadius: 6,
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                      fontSize: 10,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <ArrowLeftRight size={11} />
                    Swap
                  </button>
                  <ChevronRight size={16} color="var(--text-dim)" />
                </div>
              </div>

              {/* Card Mid Row: School & Birthday/FIDE */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, fontSize: 11.5 }}>
                {record.ClubName && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    color: 'var(--text-muted)',
                  }}>
                    <School size={12} color="var(--accent-emerald)" />
                    {record.ClubName}
                  </span>
                )}

                {record.Birthday && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    color: 'var(--text-muted)',
                    fontFamily: 'monospace',
                  }}>
                    <Calendar size={12} color="var(--accent-cyan)" />
                    {record.Birthday}
                  </span>
                )}

                {record.Sex === 'f' && (
                  <span className="badge badge-rose" style={{ fontSize: 10, padding: '1px 6px' }}>
                    Girl (f)
                  </span>
                )}

                {record.Fide_No && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    color: 'var(--accent-purple)',
                    fontWeight: 600,
                  }}>
                    <Award size={12} />
                    FIDE: {record.Fide_No} {record.Rtg_Int ? `(${record.Rtg_Int})` : ''}
                  </span>
                )}
              </div>

              {/* Card Warning Badges if any */}
              {record.flags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 2 }}>
                  {record.flags.map(f => (
                    <span
                      key={f}
                      style={{
                        fontSize: 9.5,
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: 4,
                        background: f.includes('NIC') ? 'var(--accent-rose-light)' : 'var(--accent-gold-light)',
                        color: f.includes('NIC') ? 'var(--accent-rose-dark)' : 'var(--accent-gold-dark)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3,
                      }}
                    >
                      <AlertCircle size={10} />
                      {f}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Edit Player Modal Sheet */}
      <MobilePlayerModal
        player={editingPlayer}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingPlayer(null);
        }}
        onSave={handleSavePlayer}
        onDelete={handleDeletePlayer}
      />
    </div>
  );
};
