import React, { useState, useMemo } from 'react';
import { Play, Eye, Check, Trophy, Zap } from 'lucide-react';
import { AUCTION_SETS } from '../data/auctionData';
import SetPlayersModal from './SetPlayersModal';

export default function SetsView({
  players,
  currentPlayerId,
  onSelectPlayer,
  completedPlayersMap,
  onStartSet,
  onStartReAuction
}) {
  const [viewingSet, setViewingSet] = useState(null);
  const [selectedUnsoldIds, setSelectedUnsoldIds] = useState(new Set());

  const setGroups = useMemo(() => {
    const groups = {};
    AUCTION_SETS.forEach((setName) => { groups[setName] = []; });
    players.forEach((p) => {
      if (groups[p.set]) groups[p.set].push(p);
    });
    return groups;
  }, [players]);

  const unsoldPlayers = useMemo(() => {
    return players.filter((p) => completedPlayersMap[p.id] === 'UNSOLD');
  }, [players, completedPlayersMap]);

  const getSetStats = (setName) => {
    const setPlayers = setGroups[setName] || [];
    const sold = setPlayers.filter((p) => completedPlayersMap[p.id] === 'SOLD').length;
    const unsold = setPlayers.filter((p) => completedPlayersMap[p.id] === 'UNSOLD').length;
    const remaining = setPlayers.length - sold - unsold;
    const isComplete = remaining === 0 && setPlayers.length > 0;
    return { total: setPlayers.length, sold, unsold, remaining, isComplete };
  };

  const getOverallStats = () => {
    const total = players.length;
    const sold = Object.values(completedPlayersMap).filter((s) => s === 'SOLD').length;
    const unsold = Object.values(completedPlayersMap).filter((s) => s === 'UNSOLD').length;
    return { total, sold, unsold, remaining: total - sold - unsold };
  };

  const handleToggleUnsold = (playerId) => {
    setSelectedUnsoldIds((prev) => {
      const next = new Set(prev);
      if (next.has(playerId)) next.delete(playerId);
      else next.add(playerId);
      return next;
    });
  };

  const handleSelectAllUnsold = () => {
    setSelectedUnsoldIds(new Set(unsoldPlayers.map((p) => p.id)));
  };

  const handleDeselectAll = () => {
    setSelectedUnsoldIds(new Set());
  };

  const handleStartReAuction = () => {
    if (selectedUnsoldIds.size === 0) return;
    const selectedPlayers = unsoldPlayers.filter((p) => selectedUnsoldIds.has(p.id));
    onStartReAuction(selectedPlayers);
  };

  const overall = getOverallStats();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem', width: '100%', height: '100%' }}>
      {/* Header */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(12px)',
          borderRadius: '18px',
          border: '1.5px solid rgba(230, 43, 52, 0.2)',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 8px 25px rgba(0,0,0,0.06)',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ background: 'var(--primary-red)', color: '#FFFFFF', padding: '0.55rem', borderRadius: '12px', display: 'flex' }}>
            <Trophy size={22} />
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-subdisplay)', fontSize: '1.2rem', margin: 0, color: '#111111' }}>
              SELECT SETS
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {AUCTION_SETS.length} Sets &bull; {overall.total} Players &bull; Sold: {overall.sold} &bull; Remaining: {overall.remaining}
            </span>
          </div>
        </div>
      </div>

      {/* Sets Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.85rem', overflowY: 'auto', flex: 1, paddingBottom: '0.5rem' }}>
        {AUCTION_SETS.map((setName) => {
          const stats = getSetStats(setName);
          const progressPct = stats.total > 0 ? ((stats.sold + stats.unsold) / stats.total) * 100 : 0;

          return (
            <div
              key={setName}
              style={{
                background: stats.isComplete
                  ? 'rgba(16, 185, 129, 0.06)'
                  : 'rgba(255, 255, 255, 0.92)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                border: stats.isComplete
                  ? '2px solid rgba(16, 185, 129, 0.35)'
                  : '1.5px solid rgba(230, 43, 52, 0.15)',
                padding: '1rem 1.15rem',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem',
                transition: 'all 0.2s ease'
              }}
            >
              {/* Set Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h4 style={{ fontFamily: 'var(--font-subdisplay)', fontSize: '0.95rem', fontWeight: 800, color: '#111', margin: 0, letterSpacing: '0.3px' }}>
                  {setName}
                </h4>
                {stats.isComplete && (
                  <span style={{ background: '#10B981', color: '#FFF', fontSize: '0.65rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <Check size={10} /> DONE
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              <div style={{ width: '100%', height: '4px', background: 'rgba(0,0,0,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${progressPct}%`, height: '100%', background: stats.isComplete ? '#10B981' : 'var(--primary-red)', borderRadius: '4px', transition: 'width 0.3s ease' }} />
              </div>

              {/* Stats Row */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-subdisplay)' }}>
                  {stats.total} Players
                </span>
                {stats.sold > 0 && (
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#10B981', fontFamily: 'var(--font-subdisplay)' }}>
                    {stats.sold} Sold
                  </span>
                )}
                {stats.unsold > 0 && (
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#EF4444', fontFamily: 'var(--font-subdisplay)' }}>
                    {stats.unsold} Unsold
                  </span>
                )}
                {stats.remaining > 0 && (
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#F59E0B', fontFamily: 'var(--font-subdisplay)' }}>
                    {stats.remaining} Left
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.15rem' }}>
                <button
                  onClick={() => setViewingSet(setName)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '10px',
                    border: '1.5px solid rgba(230, 43, 52, 0.3)',
                    background: 'rgba(255,255,255,0.9)',
                    color: 'var(--primary-red)',
                    fontFamily: 'var(--font-subdisplay)',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    letterSpacing: '0.3px'
                  }}
                >
                  <Eye size={14} />
                  VIEW PLAYERS
                </button>

                <button
                  onClick={() => onStartSet(setName)}
                  disabled={stats.remaining === 0}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '10px',
                    border: 'none',
                    background: stats.remaining === 0
                      ? 'rgba(0,0,0,0.1)'
                      : 'linear-gradient(135deg, var(--primary-red) 0%, #B81820 100%)',
                    color: stats.remaining === 0 ? 'var(--text-muted)' : '#FFFFFF',
                    fontFamily: 'var(--font-subdisplay)',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: stats.remaining === 0 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s ease',
                    letterSpacing: '0.3px',
                    boxShadow: stats.remaining === 0 ? 'none' : '0 4px 12px rgba(230, 43, 52, 0.3)'
                  }}
                >
                  <Play size={14} fill="currentColor" />
                  START AUCTION
                </button>
              </div>
            </div>
          );
        })}

        {/* Unsold Players Card */}
        {unsoldPlayers.length > 0 && (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: '2px dashed rgba(245, 158, 11, 0.4)',
              padding: '1rem 1.15rem',
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h4 style={{ fontFamily: 'var(--font-subdisplay)', fontSize: '0.95rem', fontWeight: 800, color: '#D97706', margin: 0 }}>
                Unsold Players
              </h4>
              <span style={{ background: '#F59E0B', color: '#FFF', fontSize: '0.65rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: '10px' }}>
                {unsoldPlayers.length} Players
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setViewingSet('__UNSOLD__')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '10px',
                  border: '1.5px solid rgba(245, 158, 11, 0.4)',
                  background: 'rgba(255,255,255,0.9)',
                  color: '#D97706',
                  fontFamily: 'var(--font-subdisplay)',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Eye size={14} />
                VIEW &amp; SELECT
              </button>

              <button
                onClick={handleStartReAuction}
                disabled={selectedUnsoldIds.size === 0}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: selectedUnsoldIds.size === 0
                    ? 'rgba(0,0,0,0.1)'
                    : 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  color: selectedUnsoldIds.size === 0 ? 'var(--text-muted)' : '#FFFFFF',
                  fontFamily: 'var(--font-subdisplay)',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: selectedUnsoldIds.size === 0 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: selectedUnsoldIds.size === 0 ? 'none' : '0 4px 12px rgba(245, 158, 11, 0.3)'
                }}
              >
                <Zap size={14} />
                RE-AUCTION ({selectedUnsoldIds.size})
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Set Players Modal */}
      {viewingSet && (
        <SetPlayersModal
          setName={viewingSet}
          players={viewingSet === '__UNSOLD__' ? unsoldPlayers : (setGroups[viewingSet] || [])}
          completedPlayersMap={completedPlayersMap}
          currentPlayerId={currentPlayerId}
          onSelectPlayer={onSelectPlayer}
          onClose={() => setViewingSet(null)}
          isUnsoldSet={viewingSet === '__UNSOLD__'}
          selectedPlayerIds={selectedUnsoldIds}
          onToggleSelect={handleToggleUnsold}
          onSelectAll={handleSelectAllUnsold}
          onDeselectAll={handleDeselectAll}
          onStartReAuction={handleStartReAuction}
        />
      )}
    </div>
  );
}
