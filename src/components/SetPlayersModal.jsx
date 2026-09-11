import React, { useState } from 'react';
import { X, Check, Play, Zap, ChevronLeft } from 'lucide-react';

export default function SetPlayersModal({
  setName,
  players,
  completedPlayersMap,
  currentPlayerId,
  onSelectPlayer,
  onClose,
  isUnsoldSet,
  selectedPlayerIds,
  onToggleSelect,
  onSelectAll,
  onDeselectAll,
  onStartReAuction
}) {
  const [roleFilter, setRoleFilter] = useState('ALL');

  const filteredPlayers = roleFilter === 'ALL'
    ? players
    : players.filter((p) => p.role === roleFilter);

  const soldCount = players.filter((p) => completedPlayersMap[p.id] === 'SOLD').length;
  const unsoldCount = players.filter((p) => completedPlayersMap[p.id] === 'UNSOLD').length;
  const remainingCount = players.length - soldCount - unsoldCount;

  return (
    <div className="set-players-modal-overlay" onClick={onClose}>
      <div className="set-players-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="set-players-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(0,0,0,0.06)',
                border: 'none',
                borderRadius: '10px',
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-dark)'
              }}
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h3 style={{ fontFamily: 'var(--font-subdisplay)', fontSize: '1.2rem', fontWeight: 900, color: '#111', margin: 0, letterSpacing: '0.5px' }}>
                {isUnsoldSet ? 'UNSOLD PLAYERS' : setName}
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {players.length} Players &bull; Sold: {soldCount} &bull; Unsold: {unsoldCount} &bull; Remaining: {remainingCount}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {isUnsoldSet && (
              <>
                <button
                  onClick={onSelectAll}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    background: 'rgba(245, 158, 11, 0.08)',
                    color: '#D97706',
                    fontFamily: 'var(--font-subdisplay)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  SELECT ALL
                </button>
                <button
                  onClick={onDeselectAll}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(0,0,0,0.1)',
                    background: 'transparent',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-subdisplay)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  DESELECT
                </button>
              </>
            )}

            <button
              onClick={onClose}
              style={{
                background: 'rgba(0,0,0,0.06)',
                border: 'none',
                borderRadius: '10px',
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-dark)'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Role Filter */}
        <div className="set-players-role-filter">
          {['ALL', 'Batsman', 'Wicketkeeper', 'All-Rounder', 'Bowler'].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`set-players-role-btn ${roleFilter === role ? 'active' : ''}`}
            >
              {role === 'Wicketkeeper' ? 'WK' : role === 'All-Rounder' ? 'AR' : role}
            </button>
          ))}
        </div>

        {/* Players Grid */}
        <div className="set-players-grid">
          {filteredPlayers.map((player, idx) => {
            const isCurrent = player.id === currentPlayerId;
            const completedState = completedPlayersMap[player.id];
            const isSelected = isUnsoldSet && selectedPlayerIds?.has(player.id);

            return (
              <div
                key={player.id}
                onClick={() => isUnsoldSet ? onToggleSelect(player.id) : onSelectPlayer(player)}
                className={`set-player-card ${isCurrent ? 'current' : ''} ${isSelected ? 'selected' : ''}`}
              >
                {isUnsoldSet && (
                  <div className={`set-player-checkbox ${isSelected ? 'checked' : ''}`}>
                    {isSelected && <Check size={14} color="#FFF" />}
                  </div>
                )}

                <div className="set-player-info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, fontFamily: 'var(--font-subdisplay)', color: 'var(--text-muted)' }}>
                      #{idx + 1}
                    </span>
                    {isCurrent && (
                      <span style={{ background: 'var(--primary-red)', color: '#FFF', fontSize: '0.6rem', fontWeight: 800, padding: '0.15rem 0.45rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Play size={8} fill="#FFF" /> ON STAGE
                      </span>
                    )}
                    {completedState === 'SOLD' && (
                      <span style={{ background: '#10B981', color: '#FFF', fontSize: '0.6rem', fontWeight: 800, padding: '0.15rem 0.45rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                        <Check size={9} /> SOLD
                      </span>
                    )}
                    {completedState === 'UNSOLD' && (
                      <span style={{ background: '#EF4444', color: '#FFF', fontSize: '0.6rem', fontWeight: 800, padding: '0.15rem 0.45rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                        <X size={9} /> UNSOLD
                      </span>
                    )}
                  </div>

                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: '#111', margin: 0, lineHeight: 1.1 }}>
                    {player.name}
                  </h4>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span className={`role-tag ${player.role}`}>{player.role}</span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      {player.country} {player.flag}
                    </span>
                  </div>
                </div>

                <div className="set-player-price">
                  <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#111', fontFamily: 'var(--font-display)' }}>
                    ₹{player.basePrice.toFixed(2)}
                  </span>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600 }}>CR</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Re-Auction Footer (Unsold Set Only) */}
        {isUnsoldSet && selectedPlayerIds && selectedPlayerIds.size > 0 && (
          <div className="set-players-reauction-footer">
            <span style={{ fontFamily: 'var(--font-subdisplay)', fontSize: '0.85rem', fontWeight: 800, color: '#D97706' }}>
              {selectedPlayerIds.size} Players Selected
            </span>
            <button className="set-players-reauction-btn" onClick={onStartReAuction}>
              <Zap size={16} />
              <span>START RE-AUCTION</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
