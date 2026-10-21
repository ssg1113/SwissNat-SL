import React, { useState } from 'react';
import { ArrowLeftRight, Trash2, Plus, Search, Filter, Info, Download, Check, Layers, FileSpreadsheet, FolderTree, Hash, RefreshCw } from 'lucide-react';
import type { NatRecord } from '../../core/types';
import { downloadNatXls, downloadNatXlsx } from '../../core/natBuilder';
import { recalculateRecordFlags, getClubNumberForCategory } from '../../core/sanitizer';
import { cleanSchoolName } from '../../core/transliterate';
export interface WebNatTableProps {
  records: NatRecord[];
  onRecordsChange: (updated: NatRecord[]) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onNotify?: (msg: string) => void;
}

export const WebNatTable: React.FC<WebNatTableProps> = ({
  records,
  onRecordsChange,
  selectedCategory,
  onSelectCategory,
  onNotify,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [groupByClub, setGroupByClub] = useState(false);

  // Extract unique categories/divisions
  const categories = Array.from(new Set(records.map(r => r.Category).filter(Boolean)));

  // Filter records
  const filtered = records.filter(r => {
    const matchesCategory = selectedCategory === 'all' || r.Category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesCategory;

    const matchesQuery =
      r.LastName.toLowerCase().includes(query) ||
      r.FirstName.toLowerCase().includes(query) ||
      r.ClubName.toLowerCase().includes(query) ||
      r.Fide_No.includes(query) ||
      r.ID_No.includes(query) ||
      r.Birthday.includes(query) ||
      r.rawName.toLowerCase().includes(query);

    return matchesCategory && matchesQuery;
  });

  // Display records with optional Club Number grouping and sorting
  const displayRecords = [...filtered];
  if (groupByClub) {
    displayRecords.sort((a, b) => {
      const numA = parseInt(a.Clubnumber || '999999', 10);
      const numB = parseInt(b.Clubnumber || '999999', 10);
      if (!isNaN(numA) && !isNaN(numB) && numA !== numB) {
        return numA - numB;
      }
      if (a.Clubnumber !== b.Clubnumber) {
        return (a.Clubnumber || '').localeCompare(b.Clubnumber || '');
      }
      return a.LastName.localeCompare(b.LastName);
    });
  }

  // Handle cell edit
  const handleCellChange = (id: string, field: keyof NatRecord, value: string) => {
    const updated = records.map(r => {
      if (r.id === id) {
        const modified = { ...r, [field]: value };
        // Recalculate flags whenever ANY field changes
        modified.flags = recalculateRecordFlags(modified);
        // Auto-update Club Number when Category or Sex changes
        if (field === 'Category') {
          const autoClub = getClubNumberForCategory(value, modified.Sex);
          if (autoClub) modified.Clubnumber = autoClub;
        } else if (field === 'Sex' && modified.Category) {
          const autoClub = getClubNumberForCategory(modified.Category, value);
          if (autoClub) modified.Clubnumber = autoClub;
        }
        return modified;
      }
      return r;
    });
    onRecordsChange(updated);
  };

  // Auto-sync Club Numbers based on Age Categories for all records
  const handleSyncClubNumbers = () => {
    let synced = 0;
    const updated = records.map(r => {
      const calc = getClubNumberForCategory(r.Category, r.Sex);
      if (calc && calc !== r.Clubnumber) {
        synced++;
        return { ...r, Clubnumber: calc };
      }
      return r;
    });
    onRecordsChange(updated);
    onNotify?.(`Updated Club Numbers for ${synced > 0 ? synced : 'all'} players according to Age Categories!`);
  };

  // Renumber players sequentially 1..N in current display order
  const handleRenumberIds = () => {
    const idMap = new Map<string, string>();
    displayRecords.forEach((r, idx) => {
      idMap.set(r.id, String(idx + 1));
    });
    const updated = records.map(r => ({
      ...r,
      ID_No: idMap.get(r.id) || r.ID_No,
    }));
    onRecordsChange(updated);
    onNotify?.(`Renumbered ${displayRecords.length} players sequentially (1 to ${displayRecords.length})!`);
  };

  // Swap Last Name and First Name for single row
  const handleSwapNames = (id: string) => {
    const updated = records.map(r => {
      if (r.id === id) {
        const swapped = {
          ...r,
          LastName: r.FirstName,
          FirstName: r.LastName,
        };
        swapped.flags = recalculateRecordFlags(swapped);
        return swapped;
      }
      return r;
    });
    onRecordsChange(updated);
  };

  // Batch swap names for all currently filtered records
  const handleBatchSwapFiltered = () => {
    if (filtered.length === 0) return;
    const confirmSwap = window.confirm(
      `Invert Last Name <-> First Name for all ${filtered.length} players currently shown?`
    );
    if (!confirmSwap) return;

    const filteredIds = new Set(filtered.map(r => r.id));
    const updated = records.map(r => {
      if (filteredIds.has(r.id)) {
        const swapped = {
          ...r,
          LastName: r.FirstName,
          FirstName: r.LastName,
        };
        swapped.flags = recalculateRecordFlags(swapped);
        return swapped;
      }
      return r;
    });
    onRecordsChange(updated);
  };

  // Delete row
  const handleDeleteRow = (id: string) => {
    const updated = records
      .filter(r => r.id !== id)
      .map((r, idx) => ({ ...r, ID_No: String(idx + 1) }));
    onRecordsChange(updated);
  };

  // Add new player row
  const handleAddPlayer = () => {
    const cat = selectedCategory !== 'all' ? selectedCategory : 'Under 06 Open';
    const clubNum = getClubNumberForCategory(cat, '');
    const newRecord: NatRecord = {
      id: `player_${Date.now()}`,
      ID_No: String(records.length + 1),
      LastName: 'New',
      FirstName: 'Player',
      Sex: '',
      Fed: 'SRI',
      Clubnumber: clubNum,
      ClubName: '',
      Birthday: '20180101',
      Rtg_Nat: '',
      Fide_No: '',
      Rtg_Int: '',
      Title: '',
      K: '',
      Category: cat,
      rawName: 'Manual Entry',
      rawSchool: '',
      flags: [],
    };
    onRecordsChange([...records, newRecord]);
  };

  // Download division specific file
  const handleDownloadDivision = () => {
    if (filtered.length === 0) return;
    try {
      const filename = `Nat_File_${selectedCategory.replace(/[^a-zA-Z0-9]/g, '_')}.xls`;
      downloadNatXls(filtered, filename);
      onNotify?.(`Exported division "${selectedCategory}" (${filtered.length} players) to ${filename}!`);
    } catch (err: any) {
      console.error('Export division error:', err);
      alert(`Export failed: ${err.message || 'Unknown error'}`);
    }
  };

  // Download all records as master NAT file
  const handleDownloadAllXls = () => {
    if (records.length === 0) return;
    try {
      downloadNatXls(records, 'Nat_File_Master.xls');
      onNotify?.(`Downloaded Master NAT file (${records.length} players) ready for Swiss-Manager!`);
    } catch (err: any) {
      console.error('Download master error:', err);
      alert(`Download failed: ${err.message || 'Unknown error'}`);
    }
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '20px 24px', width: '100%' }}>
      {/* Category Filter Chips & Search Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        marginBottom: 16,
      }}>
        {/* Category Chips */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginRight: 4, fontWeight: 600 }}>
            <Filter size={13} color="var(--accent-gold)" />
            Divisions:
          </span>
          <button
            onClick={() => onSelectCategory('all')}
            style={{
              padding: '5px 12px',
              fontSize: 12,
              fontWeight: 600,
              borderRadius: 'var(--radius-full)',
              background: selectedCategory === 'all' ? 'var(--accent-gold)' : 'var(--bg-secondary)',
              color: selectedCategory === 'all' ? '#ffffff' : 'var(--text-main)',
              border: '1px solid ' + (selectedCategory === 'all' ? 'var(--accent-gold)' : 'var(--border-color)'),
              boxShadow: selectedCategory === 'all' ? '0 1px 3px rgba(217, 119, 6, 0.25)' : 'none',
            }}
          >
            All Players ({records.length})
          </button>
          {categories.map(cat => {
            const count = records.filter(r => r.Category === cat).length;
            const isSelected = selectedCategory === cat;
            const clubNum = records.find(r => r.Category === cat && r.Clubnumber)?.Clubnumber || getClubNumberForCategory(cat);
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 12px',
                  fontSize: 12,
                  fontWeight: 600,
                  borderRadius: 'var(--radius-full)',
                  background: isSelected ? 'var(--accent-gold)' : 'var(--bg-secondary)',
                  color: isSelected ? '#ffffff' : 'var(--text-main)',
                  border: '1px solid ' + (isSelected ? 'var(--accent-gold)' : 'var(--border-color)'),
                  boxShadow: isSelected ? '0 1px 3px rgba(217, 119, 6, 0.25)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{cat}</span>
                {clubNum && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      padding: '1px 5px',
                      borderRadius: 4,
                      background: isSelected ? 'rgba(255, 255, 255, 0.28)' : '#fef3c7',
                      color: isSelected ? '#ffffff' : '#92400e',
                      border: isSelected ? '1px solid rgba(255, 255, 255, 0.4)' : '1px solid #fde68a',
                    }}
                    title={`Club Number: ${clubNum} for ${cat}`}
                  >
                    #{clubNum}
                  </span>
                )}
                <span style={{ fontSize: 11, opacity: isSelected ? 0.95 : 0.65 }}>
                  ({count})
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input & Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}>
            <Search size={15} color="var(--text-dim)" style={{ position: 'absolute', left: 10 }} />
            <input
              type="text"
              placeholder="Search player, school, Club#, FIDE ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '7px 12px 7px 32px',
                color: 'var(--text-main)',
                width: 240,
                boxShadow: 'var(--shadow-xs)',
              }}
            />
          </div>

          {/* Group by Club Number according to Age Categories */}
          <button
            onClick={() => setGroupByClub(!groupByClub)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 12px',
              fontSize: 12,
              fontWeight: 700,
              borderRadius: 'var(--radius-md)',
              background: groupByClub ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' : 'var(--bg-secondary)',
              color: groupByClub ? '#ffffff' : 'var(--text-main)',
              border: '1px solid ' + (groupByClub ? '#b45309' : 'var(--border-color)'),
              boxShadow: groupByClub ? '0 2px 6px rgba(217, 119, 6, 0.3)' : 'none',
              cursor: 'pointer',
            }}
            title="Group and sort players by Club Number according to Age Categories"
          >
            <FolderTree size={14} />
            {groupByClub ? 'Grouped by Club #' : 'Group by Club #'}
          </button>

          {/* Renumber IDs in current group order */}
          {groupByClub && displayRecords.length > 0 && (
            <button
              onClick={handleRenumberIds}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '7px 11px',
                fontSize: 12,
                fontWeight: 600,
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
              }}
              title="Renumber player ID_No (1 to N) sequentially based on current Club Number order"
            >
              <Hash size={13} color="var(--accent-gold)" />
              Renumber IDs
            </button>
          )}

          {/* Sync Club # Button */}
          {records.length > 0 && (
            <button
              onClick={handleSyncClubNumbers}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '7px 11px',
                fontSize: 12,
                fontWeight: 600,
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-muted)',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
              }}
              title="Ensure all players have the correct Club Number for their Age Category"
            >
              <RefreshCw size={13} />
              Sync Club #
            </button>
          )}

          {/* Batch Invert / Swap Names for Filtered */}
          {filtered.length > 0 && (
            <button
              onClick={handleBatchSwapFiltered}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 12px',
                fontSize: 12,
                fontWeight: 600,
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-muted)',
                border: '1px solid var(--border-color)',
              }}
              title="Invert Last Name <-> First Name for all shown players"
            >
              <Layers size={14} />
              Swap Names ({filtered.length})
            </button>
          )}

          {/* Division Export */}
          {selectedCategory !== 'all' && (
            <button
              onClick={handleDownloadDivision}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 12px',
                fontSize: 12,
                fontWeight: 600,
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent-emerald-light)',
                color: 'var(--accent-emerald-dark)',
                border: '1px solid var(--accent-emerald-border)',
                cursor: 'pointer',
              }}
              title={`Download only ${selectedCategory} players as .xls`}
            >
              <Download size={14} />
              Export {selectedCategory} ({filtered.length} .xls)
            </button>
          )}

          {/* Master Download All Players */}
          <button
            onClick={handleDownloadAllXls}
            disabled={records.length === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 14px',
              fontSize: 12,
              fontWeight: 700,
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
              color: '#ffffff',
              boxShadow: '0 2px 6px rgba(217, 119, 6, 0.25)',
              cursor: 'pointer',
            }}
            title="Download Master Swiss-Manager NAT file (.xls) with all players"
          >
            <Download size={14} strokeWidth={2.4} />
            Download Master .xls ({records.length})
          </button>

          {/* Add Player Row */}
          <button
            onClick={handleAddPlayer}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 12px',
              fontSize: 12,
              fontWeight: 600,
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-gold-light)',
              color: 'var(--accent-gold-dark)',
              border: '1px solid var(--accent-gold-border)',
            }}
          >
            <Plus size={14} />
            Add Row
          </button>
        </div>
      </div>

      {/* Strict 13-Column Swiss-Manager Table */}
      <div className="nat-table-container">
        <table className="nat-table">
          <thead>
            <tr>
              <th style={{ width: 45, textAlign: 'center' }}>#</th>
              <th style={{ width: 60 }}>ID_No</th>
              <th style={{ minWidth: 170 }}>Last Name</th>
              <th style={{ width: 40, textAlign: 'center' }}>⇄</th>
              <th style={{ minWidth: 200 }}>First Name</th>
              <th style={{ width: 45, textAlign: 'center' }}>Sex</th>
              <th style={{ width: 50, textAlign: 'center' }}>Fed</th>
              <th style={{ width: 65, textAlign: 'center', background: '#fef3c7', color: '#92400e' }} title="Club Number according to Age Category (Col 6)">Club#</th>
              <th style={{ minWidth: 220 }}>ClubName</th>
              <th style={{ width: 100 }}>Birthday</th>
              <th style={{ width: 70 }}>Rtg_Nat</th>
              <th style={{ width: 95 }}>Fide_No</th>
              <th style={{ width: 75 }}>Rtg_Int</th>
              <th style={{ width: 55 }}>Title</th>
              <th style={{ width: 45 }}>K</th>
              <th style={{ width: 140 }}>Sanitization Status</th>
              <th style={{ width: 45, textAlign: 'center' }}>Raw</th>
              <th style={{ width: 45, textAlign: 'center' }}>Del</th>
            </tr>
          </thead>
          <tbody>
            {displayRecords.length === 0 ? (
              <tr>
                <td colSpan={18} style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-dim)' }}>
                  No players found matching your search criteria. Clear your search or upload a registration file.
                </td>
              </tr>
            ) : (
              displayRecords.map((r, index) => {
                const isExpanded = expandedRowId === r.id;
                const prevRecord = index > 0 ? displayRecords[index - 1] : null;
                const isNewGroup = !prevRecord || (prevRecord.Clubnumber || '') !== (r.Clubnumber || '');
                const groupCount = groupByClub
                  ? displayRecords.filter(item => (item.Clubnumber || '') === (r.Clubnumber || '')).length
                  : 0;

                return (
                  <React.Fragment key={r.id}>
                    {groupByClub && isNewGroup && (
                      <tr key={`group-hdr-${r.Clubnumber || 'unknown'}-${index}`}>
                        <td
                          colSpan={18}
                          style={{
                            padding: '9px 16px',
                            background: 'linear-gradient(90deg, #fef3c7 0%, #fffbeb 50%, #ffffff 100%)',
                            borderTop: '2px solid var(--accent-gold)',
                            borderBottom: '1px solid #fde68a',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span
                                style={{
                                  background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                                  color: '#ffffff',
                                  fontWeight: 800,
                                  fontSize: 12,
                                  padding: '2px 8px',
                                  borderRadius: 4,
                                  letterSpacing: '0.04em',
                                  boxShadow: '0 1px 3px rgba(217, 119, 6, 0.3)',
                                }}
                              >
                                CLUB #{r.Clubnumber || '—'}
                              </span>
                              <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-main)' }}>
                                {r.Category || 'Age Category'}
                              </span>
                              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                                ({groupCount} {groupCount === 1 ? 'player' : 'players'})
                              </span>
                            </div>
                            <span style={{ fontSize: 11, color: '#92400e', fontWeight: 600 }}>
                              All players in {r.Category || 'this group'} share Club #{r.Clubnumber || '—'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    )}
                    {(() => {
                      const hasError = r.flags.some(f =>
                        f.includes('NIC') || f.includes('Invalid') || f.includes('Wrong') || f.includes('Rejected')
                      );
                      const hasWarning = !hasError && r.flags.some(f => f.includes('Typo'));
                      const rowClass = hasError ? 'has-flag has-flag-error' : (hasWarning ? 'has-flag has-flag-warning' : (r.flags.length > 0 ? 'has-flag' : ''));

                      const isBirthdayError = r.flags.some(f => f.includes('Invalid Birthday'));
                      const isFideError = r.flags.some(f => f.includes('NIC') || f.includes('Invalid FIDE'));
                      const isRatingError = r.flags.some(f => f.includes('Invalid Rating'));

                      return (
                        <tr className={rowClass}>
                          {/* Col 0: Index Number with error badge indicator */}
                          <td style={{ textAlign: 'center', color: hasError ? '#e11d48' : 'var(--text-dim)', fontSize: 11, fontWeight: 700 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                              {hasError && (
                                <span
                                  style={{
                                    width: 7,
                                    height: 7,
                                    borderRadius: '50%',
                                    background: '#e11d48',
                                    display: 'inline-block',
                                    boxShadow: '0 0 0 2px rgba(225, 29, 72, 0.25)',
                                    flexShrink: 0,
                                  }}
                                  title="Row contains wrong data (highlighted)"
                                />
                              )}
                              {index + 1}
                            </div>
                          </td>

                          {/* Col 1: ID_No */}
                          <td>
                            <input
                              type="text"
                              className="cell-input font-mono"
                              value={r.ID_No}
                              onChange={e => handleCellChange(r.id, 'ID_No', e.target.value)}
                              style={{ width: 50, textAlign: 'center', fontWeight: 600 }}
                            />
                          </td>

                          {/* Col 2: Last Name - All letters included */}
                          <td>
                            <input
                              type="text"
                              className="cell-input"
                              value={r.LastName}
                              onChange={e => handleCellChange(r.id, 'LastName', e.target.value)}
                              style={{ fontWeight: 700, color: 'var(--text-main)', width: '100%' }}
                            />
                          </td>

                          {/* Swap Button */}
                          <td style={{ textAlign: 'center' }}>
                            <button
                              onClick={() => handleSwapNames(r.id)}
                              style={{
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--border-color)',
                                padding: '4px 6px',
                                borderRadius: 'var(--radius-xs)',
                                color: 'var(--text-muted)',
                              }}
                              title="1-Tap Swap: Invert Last Name <-> First Name"
                            >
                              <ArrowLeftRight size={13} />
                            </button>
                          </td>

                          {/* Col 3: First Name - All letters included */}
                          <td>
                            <input
                              type="text"
                              className="cell-input"
                              value={r.FirstName}
                              onChange={e => handleCellChange(r.id, 'FirstName', e.target.value)}
                              style={{ color: 'var(--text-main)', width: '100%' }}
                            />
                          </td>

                          {/* Col 4: Sex */}
                          <td>
                            <input
                              type="text"
                              className="cell-input font-mono"
                              value={r.Sex}
                              onChange={e => handleCellChange(r.id, 'Sex', e.target.value.toLowerCase())}
                              style={{ width: 32, textAlign: 'center', fontWeight: 700, color: r.Sex === 'f' ? 'var(--accent-rose-dark)' : 'var(--text-main)' }}
                              placeholder=""
                            />
                          </td>

                          {/* Col 5: Fed */}
                          <td>
                            <input
                              type="text"
                              className="cell-input font-mono"
                              value={r.Fed}
                              onChange={e => handleCellChange(r.id, 'Fed', e.target.value.toUpperCase())}
                              style={{ width: 40, textAlign: 'center', fontWeight: 600 }}
                            />
                          </td>

                          {/* Col 6: Clubnumber */}
                          <td style={{ textAlign: 'center' }}>
                            <input
                              type="text"
                              className="cell-input font-mono"
                              value={r.Clubnumber}
                              onChange={e => handleCellChange(r.id, 'Clubnumber', e.target.value)}
                              style={{
                                width: 52,
                                textAlign: 'center',
                                fontWeight: 700,
                                color: 'var(--accent-gold-dark)',
                                background: '#fffbeb',
                                borderRadius: 'var(--radius-xs)',
                              }}
                              placeholder="—"
                              title={`Club Number: ${r.Clubnumber || 'Not assigned'} for ${r.Category || 'Age Category'}`}
                            />
                          </td>

                          {/* Col 7: ClubName - All letters included */}
                          <td>
                            <input
                              type="text"
                              className="cell-input"
                              value={r.ClubName}
                              onChange={e => handleCellChange(r.id, 'ClubName', e.target.value)}
                              onBlur={e => handleCellChange(r.id, 'ClubName', cleanSchoolName(e.target.value))}
                              style={{ color: 'var(--text-main)', width: '100%' }}
                            />
                          </td>

                          {/* Col 8: Birthday */}
                          <td>
                            <input
                              type="text"
                              className={`cell-input font-mono ${isBirthdayError ? 'cell-input-error' : ''}`}
                              value={r.Birthday}
                              onChange={e => handleCellChange(r.id, 'Birthday', e.target.value)}
                              style={{
                                width: 85,
                                color: isBirthdayError ? '#b91c1c' : 'var(--accent-cyan-dark)',
                                fontWeight: isBirthdayError ? 700 : 600,
                              }}
                              placeholder="YYYYMMDD"
                              title={isBirthdayError ? `Invalid Birthday: "${r.Birthday}". Required format: YYYYMMDD.` : undefined}
                            />
                          </td>

                          {/* Col 9: Rtg_Nat */}
                          <td>
                            <input
                              type="text"
                              className={`cell-input font-mono ${isRatingError && r.Rtg_Nat ? 'cell-input-error' : ''}`}
                              value={r.Rtg_Nat}
                              onChange={e => handleCellChange(r.id, 'Rtg_Nat', e.target.value)}
                              style={{ width: 55, textAlign: 'center' }}
                              placeholder=""
                              title={isRatingError && r.Rtg_Nat ? `Invalid National Rating: "${r.Rtg_Nat}".` : undefined}
                            />
                          </td>

                          {/* Col 10: Fide_No */}
                          <td>
                            <input
                              type="text"
                              className={`cell-input font-mono ${isFideError ? 'cell-input-error' : ''}`}
                              value={r.Fide_No}
                              onChange={e => handleCellChange(r.id, 'Fide_No', e.target.value)}
                              style={{
                                width: 80,
                                color: isFideError ? '#b91c1c' : 'var(--accent-emerald-dark)',
                                fontWeight: isFideError ? 700 : 600,
                              }}
                              placeholder=""
                              title={isFideError ? `Wrong data retained: "${r.Fide_No}". Arbiter can review and edit directly.` : undefined}
                            />
                          </td>

                          {/* Col 11: Rtg_Int */}
                          <td>
                            <input
                              type="text"
                              className={`cell-input font-mono ${isRatingError && r.Rtg_Int ? 'cell-input-error' : ''}`}
                              value={r.Rtg_Int}
                              onChange={e => handleCellChange(r.id, 'Rtg_Int', e.target.value)}
                              style={{
                                width: 60,
                                textAlign: 'center',
                                color: isRatingError && r.Rtg_Int ? '#b91c1c' : 'var(--accent-gold-dark)',
                                fontWeight: 700,
                              }}
                              placeholder=""
                              title={isRatingError && r.Rtg_Int ? `Invalid FIDE Rating: "${r.Rtg_Int}".` : undefined}
                            />
                          </td>

                          {/* Col 12: Title */}
                          <td>
                            <input
                              type="text"
                              className="cell-input font-mono"
                              value={r.Title}
                              onChange={e => handleCellChange(r.id, 'Title', e.target.value.toUpperCase())}
                              style={{ width: 45, textAlign: 'center', fontWeight: 700 }}
                              placeholder=""
                            />
                          </td>

                          {/* Col 13: K */}
                          <td>
                            <input
                              type="text"
                              className="cell-input font-mono"
                              value={r.K}
                              onChange={e => handleCellChange(r.id, 'K', e.target.value)}
                              style={{ width: 35, textAlign: 'center' }}
                              placeholder=""
                            />
                          </td>

                          {/* Sanitization Flags */}
                          <td>
                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                              {r.flags.length === 0 ? (
                                <span className="badge badge-emerald" style={{ fontSize: 10 }}>
                                  <Check size={10} /> Clean
                                </span>
                              ) : (
                                r.flags.map(f => {
                                  const isErr = f.includes('NIC') || f.includes('Invalid') || f.includes('Rejected');
                                  return (
                                    <span
                                      key={f}
                                      className={`badge ${isErr ? 'badge-rose' : 'badge-gold'}`}
                                      style={{ fontSize: 10, fontWeight: isErr ? 700 : 600 }}
                                      title={isErr ? `Wrong data retained: "${f}". Row highlighted.` : f}
                                    >
                                      {isErr ? '⚠️ ' : ''}{f}
                                    </span>
                                  );
                                })
                              )}
                            </div>
                          </td>

                          {/* Raw Details Toggle */}
                          <td style={{ textAlign: 'center' }}>
                            <button
                              onClick={() => setExpandedRowId(isExpanded ? null : r.id)}
                              style={{
                                background: isExpanded ? 'var(--accent-gold)' : 'var(--bg-secondary)',
                                color: isExpanded ? '#ffffff' : 'var(--text-muted)',
                                padding: '4px 6px',
                                borderRadius: 'var(--radius-xs)',
                                border: '1px solid var(--border-color)',
                              }}
                              title="View raw Google Form inputs"
                            >
                              <Info size={13} />
                            </button>
                          </td>

                          {/* Delete */}
                          <td style={{ textAlign: 'center' }}>
                            <button
                              onClick={() => handleDeleteRow(r.id)}
                              style={{
                                background: 'var(--accent-rose-light)',
                                color: 'var(--accent-rose-dark)',
                                padding: '4px 6px',
                                borderRadius: 'var(--radius-xs)',
                                border: '1px solid var(--accent-rose-border)',
                              }}
                              title="Remove row"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      );
                    })()}

                    {/* Expandable Raw Data Drawer (Zero Data Loss) */}
                    {isExpanded && (
                      <tr style={{ background: 'var(--bg-card-subtle)' }}>
                        <td colSpan={18} style={{ padding: '12px 18px', borderBottom: '1px solid var(--border-color)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 24, fontSize: 12, flexWrap: 'wrap' }}>
                            <div>
                              <span style={{ color: 'var(--text-dim)', fontWeight: 600 }}>Raw Form Name: </span>
                              <span style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{r.rawName || '(Empty)'}</span>
                            </div>
                            <div>
                              <span style={{ color: 'var(--text-dim)', fontWeight: 600 }}>Raw School/Club: </span>
                              <span style={{ color: 'var(--text-main)' }}>{r.rawSchool || '(Empty)'}</span>
                            </div>
                            <div>
                              <span style={{ color: 'var(--text-dim)', fontWeight: 600 }}>Division / Category: </span>
                              <span style={{ color: 'var(--accent-gold-dark)', fontWeight: 600 }}>{r.Category || 'Not specified'}</span>
                            </div>
                            <div>
                              <span style={{ color: 'var(--text-dim)', fontWeight: 600 }}>Club Number (Col 6): </span>
                              <span style={{ color: '#92400e', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{r.Clubnumber ? `#${r.Clubnumber}` : '(None)'}</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'var(--text-muted)', flexWrap: 'wrap', gap: 8 }}>
        <div>
          Showing {filtered.length} of {records.length} players. Click any cell to edit directly before exporting.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-emerald)' }}></span>
            Green: Clean Format
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-cyan)' }}></span>
            Cyan: Auto-Corrected
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-rose)' }}></span>
            Rose: NIC Rejected
          </span>
        </div>
      </div>
    </div>
  );
};
