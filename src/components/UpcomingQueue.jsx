import React, { useState } from 'react';
import { Users, Check, X, Play, Filter, Sparkles, Award } from 'lucide-react';

function getPlayerInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export default function UpcomingQueue({ 
  players, 
  currentPlayerId, 
  onSelectPlayer, 
  completedPlayersMap 
}) {
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [imgErrors, setImgErrors] = useState({});

  const filteredPlayers = roleFilter === 'ALL'
    ? players
    : players.filter((p) => p.role === roleFilter);

  const soldCount = Object.values(completedPlayersMap).filter(s => s === 'SOLD').length;
  const unsoldCount = Object.values(completedPlayersMap).filter(s => s === 'UNSOLD').length;
  const remainingCount = players.length - soldCount - unsoldCount;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem', width: '100%' }}>
      {/* Top Header Summary & Role Filter Bar */}
      <div 
        style={{ 
          background: 'rgba(255, 255, 255, 0.92)', 
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: '18px', 
          border: '1.5px solid rgba(230, 43, 52, 0.2)', 
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 8px 25px rgba(0,0,0,0.06)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ background: 'var(--primary-red)', color: '#FFFFFF', padding: '0.55rem', borderRadius: '12px', display: 'flex' }}>
            <Users size={22} />
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-subdisplay)', fontSize: '1.2rem', margin: 0, color: '#111111' }}>
              IPL AUCTION PLAYER QUEUE & SET DIRECTORY
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Total: {players.length} Players • Remaining: {remainingCount} • Sold: {soldCount} • Unsold: {unsoldCount}
            </span>
          </div>
        </div>

        {/* Role Filter Tabs (Exact Sequence: Batsmen -> Wicketkeepers -> All-Rounders -> Bowlers) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--bg-surface-secondary)', padding: '0.3rem', borderRadius: '14px' }}>
          {['ALL', 'Batsman', 'Wicketkeeper', 'All-Rounder', 'Bowler'].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              style={{
                padding: '0.35rem 0.8rem',
                borderRadius: '10px',
                border: 'none',
                fontSize: '0.78rem',
                fontWeight: 700,
                fontFamily: 'var(--font-subdisplay)',
                cursor: 'pointer',
                background: roleFilter === role ? 'var(--primary-red)' : 'transparent',
                color: roleFilter === role ? '#FFFFFF' : 'var(--text-dark)',
                transition: 'all 0.15s ease'
              }}
            >
              {role === 'Wicketkeeper' ? 'WK' : role === 'All-Rounder' ? 'AR' : role}
            </button>
          ))}
        </div>
      </div>

      {/* Player Queue Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {filteredPlayers.map((player, idx) => {
          const isCurrent = player.id === currentPlayerId;
          const completedState = completedPlayersMap[player.id];

          return (
            <div
              key={player.id}
              onClick={() => onSelectPlayer(player)}
              style={{
                background: isCurrent 
                  ? 'rgba(255, 255, 255, 0.98)' 
                  : 'rgba(255, 255, 255, 0.92)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                borderRadius: '18px',
                border: isCurrent 
                  ? '2.5px solid var(--primary-red)' 
                  : '1.5px solid rgba(230, 43, 52, 0.18)',
                padding: '1rem 1.15rem',
                boxShadow: isCurrent 
                  ? '0 10px 30px rgba(230, 43, 52, 0.25)' 
                  : '0 6px 20px rgba(0, 0, 0, 0.05)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
                position: 'relative'
              }}
            >
              {/* Card Header: Set Name & Status Badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, fontFamily: 'var(--font-subdisplay)', color: 'var(--primary-red)', letterSpacing: '0.5px' }}>
                  #{idx + 1} • {player.set || 'SET 1'}
                </span>

                {isCurrent && (
                  <span style={{ background: 'var(--primary-red)', color: '#FFFFFF', fontSize: '0.65rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Play size={10} fill="#FFFFFF" /> ON STAGE
                  </span>
                )}

                {completedState === 'SOLD' && (
                  <span style={{ background: '#10B981', color: '#FFFFFF', fontSize: '0.65rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <Check size={12} /> SOLD
                  </span>
                )}

                {completedState === 'UNSOLD' && (
                  <span style={{ background: '#EF4444', color: '#FFFFFF', fontSize: '0.65rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <X size={12} /> UNSOLD
                  </span>
                )}
              </div>

              {/* Player Avatar & Details */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div 
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: '12px',
                    border: '2px solid var(--primary-red)',
                    overflow: 'hidden',
                    flexShrink: 0,
                    background: 'rgba(230, 43, 52, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {(player.photoUrl || player.image) && !imgErrors[player.id] ? (
                    <img 
                      src={player.photoUrl || player.image} 
                      alt={player.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={() => setImgErrors(prev => ({ ...prev, [player.id]: true }))}
                    />
                  ) : (
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-red)', fontFamily: 'var(--font-subdisplay)' }}>
                      {getPlayerInitials(player.name)}
                    </span>
                  )}
                </div>

                <div>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', margin: 0, color: '#111111', lineHeight: 1 }}>
                    {player.name}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem' }}>
                    <span className={`role-tag ${player.role}`}>{player.role}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>• {player.country} {player.flag}</span>
                  </div>
                </div>
              </div>

              {/* Base Price & Stats Preview */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-surface-secondary)', padding: '0.45rem 0.75rem', borderRadius: '10px', marginTop: '0.2rem' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  BASE PRICE: <strong style={{ color: '#111111' }}>₹ {player.basePrice.toFixed(2)} CR</strong>
                </span>

                <span style={{ fontSize: '0.72rem', color: 'var(--primary-red)', fontWeight: 700 }}>
                  CLICK TO LOAD →
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
