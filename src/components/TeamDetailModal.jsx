import React, { useState } from 'react';
import { X, Shield, DollarSign, Users, Award, Filter, PieChart } from 'lucide-react';

export default function TeamDetailModal({ team, onClose }) {
  const [roleFilter, setRoleFilter] = useState('ALL');

  if (!team) return null;

  const purseSpent = team.purseTotal - team.purseRemaining;
  const spentPercent = ((purseSpent / team.purseTotal) * 100).toFixed(1);
  const avgPrice = team.acquiredPlayers.length > 0 
    ? (purseSpent / team.acquiredPlayers.length).toFixed(2)
    : '0.00';

  const filteredPlayers = roleFilter === 'ALL'
    ? team.acquiredPlayers
    : team.acquiredPlayers.filter(p => p.role === roleFilter);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px', padding: '1.75rem', borderRadius: '24px' }}>
        {/* Header Ribbon */}
        <div className="modal-header" style={{ borderBottom: `2px solid ${team.primaryColor}`, paddingBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div 
              style={{
                width: 46,
                height: 46,
                borderRadius: '50%',
                backgroundColor: team.primaryColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: team.textColor || '#FFFFFF',
                fontWeight: 900,
                fontFamily: 'var(--font-display)',
                fontSize: '1.3rem',
                boxShadow: `0 4px 15px ${team.primaryColor}66`
              }}
            >
              {team.code}
            </div>
            <div>
              <h3 className="modal-title" style={{ fontSize: '1.3rem', margin: 0 }}>
                {team.name}
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                COMPLETE SQUAD & PURSE BREAKDOWN
              </span>
            </div>
          </div>

          <button 
            className="icon-btn" 
            onClick={onClose}
            style={{ width: 32, height: 32 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Macro Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem', margin: '1rem 0' }}>
          <div className="stat-box" style={{ background: '#111111', padding: '0.6rem 0.4rem' }}>
            <span className="stat-label" style={{ color: '#9CA3AF' }}>REMAINING</span>
            <div className="stat-val" style={{ color: '#10B981', fontSize: '1.1rem' }}>
              ₹ {team.purseRemaining.toFixed(2)} Cr
            </div>
          </div>

          <div className="stat-box" style={{ background: '#111111', padding: '0.6rem 0.4rem' }}>
            <span className="stat-label" style={{ color: '#9CA3AF' }}>SPENT PURSE</span>
            <div className="stat-val" style={{ color: 'var(--primary-red)', fontSize: '1.1rem' }}>
              ₹ {purseSpent.toFixed(2)} Cr
            </div>
          </div>

          <div className="stat-box" style={{ background: '#111111', padding: '0.6rem 0.4rem' }}>
            <span className="stat-label" style={{ color: '#9CA3AF' }}>AVG / PLAYER</span>
            <div className="stat-val" style={{ color: '#F59E0B', fontSize: '1.1rem' }}>
              ₹ {avgPrice} Cr
            </div>
          </div>

          <div className="stat-box" style={{ background: '#111111', padding: '0.6rem 0.4rem' }}>
            <span className="stat-label" style={{ color: '#9CA3AF' }}>SQUAD SIZE</span>
            <div className="stat-val" style={{ color: '#FFFFFF', fontSize: '1.1rem' }}>
              {team.squadCount} / {team.squadMax}
            </div>
            <span style={{ fontSize: '0.62rem', color: '#10B981', display: 'block', marginTop: '0.1rem' }}>
              {team.squadCount >= 15 ? '✓ Mandatory Met' : '15 Mandatory + 3 Flex'}
            </span>
          </div>
        </div>

        {/* Role Composition Progress Grid */}
        <h4 style={{ fontFamily: 'var(--font-subdisplay)', fontSize: '0.85rem', letterSpacing: '1px', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
          ROLE TARGETS PROGRESS (15 MANDATORY + 3 FLEX EXTRA SLOTS)
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <div style={{ background: 'var(--bg-surface-secondary)', padding: '0.45rem', borderRadius: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', fontWeight: 700 }}>
              <span>BATSMEN</span>
              <span>{team.squadRoleCounts.Batsman || 0}/{team.squadTargets.Batsman}</span>
            </div>
            <div style={{ width: '100%', height: '4px', background: 'rgba(0,0,0,0.1)', borderRadius: '2px', marginTop: '0.3rem' }}>
              <div style={{ width: `${Math.min(100, ((team.squadRoleCounts.Batsman || 0) / team.squadTargets.Batsman) * 100)}%`, height: '100%', background: '#3B82F6', borderRadius: '2px' }} />
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface-secondary)', padding: '0.45rem', borderRadius: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', fontWeight: 700 }}>
              <span>BOWLERS</span>
              <span>{team.squadRoleCounts.Bowler || 0}/{team.squadTargets.Bowler}</span>
            </div>
            <div style={{ width: '100%', height: '4px', background: 'rgba(0,0,0,0.1)', borderRadius: '2px', marginTop: '0.3rem' }}>
              <div style={{ width: `${Math.min(100, ((team.squadRoleCounts.Bowler || 0) / team.squadTargets.Bowler) * 100)}%`, height: '100%', background: '#EF4444', borderRadius: '2px' }} />
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface-secondary)', padding: '0.45rem', borderRadius: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', fontWeight: 700 }}>
              <span>ALL-ROUND</span>
              <span>{team.squadRoleCounts['All-Rounder'] || 0}/{team.squadTargets['All-Rounder']}</span>
            </div>
            <div style={{ width: '100%', height: '4px', background: 'rgba(0,0,0,0.1)', borderRadius: '2px', marginTop: '0.3rem' }}>
              <div style={{ width: `${Math.min(100, ((team.squadRoleCounts['All-Rounder'] || 0) / team.squadTargets['All-Rounder']) * 100)}%`, height: '100%', background: '#10B981', borderRadius: '2px' }} />
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface-secondary)', padding: '0.45rem', borderRadius: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', fontWeight: 700 }}>
              <span>KEEPERS</span>
              <span>{team.squadRoleCounts.Wicketkeeper || 0}/{team.squadTargets.Wicketkeeper}</span>
            </div>
            <div style={{ width: '100%', height: '4px', background: 'rgba(0,0,0,0.1)', borderRadius: '2px', marginTop: '0.3rem' }}>
              <div style={{ width: `${Math.min(100, ((team.squadRoleCounts.Wicketkeeper || 0) / team.squadTargets.Wicketkeeper) * 100)}%`, height: '100%', background: '#F59E0B', borderRadius: '2px' }} />
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface-secondary)', padding: '0.45rem', borderRadius: '10px', border: '1px solid rgba(212, 175, 55, 0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', fontWeight: 700, color: 'var(--gold-accent)' }}>
              <span>FLEX EXTRA</span>
              <span>{Math.max(0, team.squadCount - Math.min(5, team.squadRoleCounts.Batsman || 0) - Math.min(5, team.squadRoleCounts.Bowler || 0) - Math.min(3, team.squadRoleCounts['All-Rounder'] || 0) - Math.min(2, team.squadRoleCounts.Wicketkeeper || 0))}/3</span>
            </div>
            <div style={{ width: '100%', height: '4px', background: 'rgba(0,0,0,0.1)', borderRadius: '2px', marginTop: '0.3rem' }}>
              <div style={{ width: `${Math.min(100, (Math.max(0, team.squadCount - Math.min(5, team.squadRoleCounts.Batsman || 0) - Math.min(5, team.squadRoleCounts.Bowler || 0) - Math.min(3, team.squadRoleCounts['All-Rounder'] || 0) - Math.min(2, team.squadRoleCounts.Wicketkeeper || 0)) / 3) * 100)}%`, height: '100%', background: 'var(--gold-accent)', borderRadius: '2px' }} />
            </div>
          </div>
        </div>

        {/* Filter Pills & Acquired Players Roster */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
          <h4 style={{ fontFamily: 'var(--font-subdisplay)', fontSize: '0.85rem', letterSpacing: '1px', margin: 0 }}>
            ACQUIRED PLAYERS ROSTER ({filteredPlayers.length})
          </h4>

          {/* Role Filter Selector */}
          <div style={{ display: 'flex', gap: '0.3rem' }}>
            {['ALL', 'Batsman', 'Wicketkeeper', 'All-Rounder', 'Bowler'].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                style={{
                  padding: '0.2rem 0.5rem',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: roleFilter === role ? 'var(--primary-red)' : 'var(--bg-surface-secondary)',
                  color: roleFilter === role ? '#FFFFFF' : 'var(--text-dark)'
                }}
              >
                {role === 'Wicketkeeper' ? 'WK' : role === 'All-Rounder' ? 'AR' : role}
              </button>
            ))}
          </div>
        </div>

        {/* Players Roster Table */}
        <div style={{ maxHeight: '240px', overflowY: 'auto', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: '#111111', color: 'white', textAlign: 'left' }}>
                <th style={{ padding: '0.55rem 0.85rem' }}>PLAYER</th>
                <th style={{ padding: '0.55rem 0.85rem' }}>ROLE</th>
                <th style={{ padding: '0.55rem 0.85rem', textAlign: 'right' }}>PRICE</th>
                <th style={{ padding: '0.55rem 0.85rem', textAlign: 'right' }}>% PURSE</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.map((player, idx) => {
                const playerPurseShare = ((player.price / team.purseTotal) * 100).toFixed(1);

                return (
                  <tr 
                    key={idx} 
                    style={{ 
                      borderBottom: '1px solid rgba(0,0,0,0.05)',
                      background: idx % 2 === 0 ? '#FFFFFF' : 'var(--bg-surface-secondary)' 
                    }}
                  >
                    <td style={{ padding: '0.5rem 0.85rem', fontWeight: 600 }}>{player.name}</td>
                    <td style={{ padding: '0.5rem 0.85rem' }}>
                      <span className={`role-tag ${player.role}`}>{player.role}</span>
                    </td>
                    <td style={{ padding: '0.5rem 0.85rem', textAlign: 'right', fontWeight: 700, color: 'var(--primary-red)' }}>
                      ₹ {player.price.toFixed(2)} Cr
                    </td>
                    <td style={{ padding: '0.5rem 0.85rem', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      {playerPurseShare}%
                    </td>
                  </tr>
                );
              })}
              {filteredPlayers.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '1.5rem', textAlign: 'center', color: '#9CA3AF' }}>
                    No players matching filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
