import React from 'react';
import { Shield, DollarSign, Users, Award, ExternalLink, TrendingUp, PieChart } from 'lucide-react';

export default function SidebarTeams({ teams, onInspectTeam }) {
  // Aggregate overall auction stats
  const totalPurseAll = teams.reduce((acc, t) => acc + t.purseTotal, 0);
  const remainingPurseAll = teams.reduce((acc, t) => acc + t.purseRemaining, 0);
  const spentPurseAll = totalPurseAll - remainingPurseAll;
  const totalPlayersBought = teams.reduce((acc, t) => acc + t.squadCount, 0);
  const totalOverseasBought = teams.reduce((acc, t) => acc + t.overseasCount, 0);

  return (
    <div className="team-dashboard-container" style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Overview Macro Summary Cards Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.85rem' }}>
        <div className="stat-box" style={{ background: '#FFFFFF', border: '1px solid rgba(230, 43, 52, 0.2)', padding: '0.85rem 1rem', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span className="stat-label" style={{ color: 'var(--text-muted)', fontWeight: 700 }}>REMAINING PURSE</span>
            <DollarSign size={16} style={{ color: '#10B981' }} />
          </div>
          <div className="stat-val" style={{ color: '#10B981', fontSize: '1.6rem' }}>
            ₹ {remainingPurseAll.toFixed(2)} Cr
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Spent: ₹ {spentPurseAll.toFixed(2)} Cr ({((spentPurseAll / totalPurseAll) * 100).toFixed(1)}%)
          </span>
        </div>

        <div className="stat-box" style={{ background: '#FFFFFF', border: '1px solid rgba(230, 43, 52, 0.2)', padding: '0.85rem 1rem', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span className="stat-label" style={{ color: 'var(--text-muted)', fontWeight: 700 }}>TOTAL SPENT</span>
            <TrendingUp size={16} style={{ color: 'var(--primary-red)' }} />
          </div>
          <div className="stat-val" style={{ color: 'var(--primary-red)', fontSize: '1.6rem' }}>
            ₹ {spentPurseAll.toFixed(2)} Cr
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Out of ₹ {totalPurseAll.toFixed(2)} Cr Pool
          </span>
        </div>

        <div className="stat-box" style={{ background: '#FFFFFF', border: '1px solid rgba(230, 43, 52, 0.2)', padding: '0.85rem 1rem', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span className="stat-label" style={{ color: 'var(--text-muted)', fontWeight: 700 }}>PLAYERS BOUGHT</span>
            <Users size={16} style={{ color: '#111111' }} />
          </div>
          <div className="stat-val" style={{ color: '#111111', fontSize: '1.6rem' }}>
            {totalPlayersBought} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/ 250</span>
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Across 12 Franchises
          </span>
        </div>

        <div className="stat-box" style={{ background: '#FFFFFF', border: '1px solid rgba(230, 43, 52, 0.2)', padding: '0.85rem 1rem', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span className="stat-label" style={{ color: 'var(--text-muted)', fontWeight: 700 }}>OVERSEAS SLOTS</span>
            <PieChart size={16} style={{ color: '#3B82F6' }} />
          </div>
          <div className="stat-val" style={{ color: '#3B82F6', fontSize: '1.6rem' }}>
            {totalOverseasBought} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/ 80</span>
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Max 8 per team
          </span>
        </div>
      </div>

      {/* 12 Team Cards Grid */}
      <h3 style={{ fontFamily: 'var(--font-subdisplay)', letterSpacing: '1px', fontSize: '1.1rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Shield size={18} style={{ color: 'var(--primary-red)' }} />
        <span>FRANCHISE PURSE & SQUAD ANALYSIS</span>
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        {teams.map((team) => {
          const purseSpent = team.purseTotal - team.purseRemaining;
          const spentPercent = Math.min(100, (purseSpent / team.purseTotal) * 100);

          // Find top purchase player
          const topBuy = team.acquiredPlayers.length > 0
            ? [...team.acquiredPlayers].sort((a, b) => b.price - a.price)[0]
            : null;

          return (
            <div
              key={team.id}
              onClick={() => onInspectTeam(team)}
              style={{
                background: '#FFFFFF',
                borderRadius: '18px',
                border: `2px solid ${team.primaryColor}`,
                padding: '1.1rem',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.05)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                position: 'relative',
                overflow: 'hidden'
              }}
              className="team-dashboard-card"
            >
              {/* Top Accent Ribbon */}
              <div 
                style={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  right: 0, 
                  height: '6px', 
                  backgroundColor: team.primaryColor 
                }} 
              />

              {/* Card Header: Code Badge + Full Name + Purse */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: '50%',
                      backgroundColor: team.primaryColor,
                      color: team.textColor || '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.2rem',
                      boxShadow: `0 3px 10px ${team.primaryColor}55`
                    }}
                  >
                    {team.code}
                  </div>
                  <div>
                    <h4 style={{ fontFamily: 'var(--font-subdisplay)', fontSize: '1.05rem', margin: 0 }}>
                      {team.name}
                    </h4>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Squad: {team.squadCount} / 18 (15 Mandatory) • OS: {team.overseasCount} / 8
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: '#111111', lineHeight: 1 }}>
                    ₹ {team.purseRemaining.toFixed(2)} Cr
                  </div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    REMAINING PURSE
                  </span>
                </div>
              </div>

              {/* Purse Progress Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  <span>Spent: ₹ {purseSpent.toFixed(2)} Cr ({spentPercent.toFixed(1)}%)</span>
                  <span>Total: ₹ {team.purseTotal.toFixed(2)} Cr</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      height: '100%', 
                      width: `${spentPercent}%`, 
                      backgroundColor: team.primaryColor,
                      borderRadius: '4px',
                      transition: 'width 0.4s ease'
                    }}
                  />
                </div>
              </div>

              {/* Squad Composition Metrics (5 columns: 15 Mandatory + 3 Flex) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.35rem' }}>
                <div className="stat-box" style={{ background: '#111111', padding: '0.35rem 0.2rem' }}>
                  <span className="stat-label" style={{ color: '#9CA3AF', fontSize: '0.55rem' }}>BAT</span>
                  <div className="stat-val" style={{ color: '#FFFFFF', fontSize: '0.9rem' }}>
                    {team.squadRoleCounts.Batsman || 0}/5
                  </div>
                </div>
                <div className="stat-box" style={{ background: '#111111', padding: '0.35rem 0.2rem' }}>
                  <span className="stat-label" style={{ color: '#9CA3AF', fontSize: '0.55rem' }}>BOWL</span>
                  <div className="stat-val" style={{ color: '#FFFFFF', fontSize: '0.9rem' }}>
                    {team.squadRoleCounts.Bowler || 0}/5
                  </div>
                </div>
                <div className="stat-box" style={{ background: '#111111', padding: '0.35rem 0.2rem' }}>
                  <span className="stat-label" style={{ color: '#9CA3AF', fontSize: '0.55rem' }}>AR</span>
                  <div className="stat-val" style={{ color: '#FFFFFF', fontSize: '0.9rem' }}>
                    {team.squadRoleCounts['All-Rounder'] || 0}/3
                  </div>
                </div>
                <div className="stat-box" style={{ background: '#111111', padding: '0.35rem 0.2rem' }}>
                  <span className="stat-label" style={{ color: '#9CA3AF', fontSize: '0.55rem' }}>WK</span>
                  <div className="stat-val" style={{ color: '#FFFFFF', fontSize: '0.9rem' }}>
                    {team.squadRoleCounts.Wicketkeeper || 0}/2
                  </div>
                </div>
                <div className="stat-box" style={{ background: '#111111', border: '1px solid rgba(212, 175, 55, 0.4)', padding: '0.35rem 0.2rem' }}>
                  <span className="stat-label" style={{ color: 'var(--gold-accent)', fontSize: '0.55rem' }}>FLEX</span>
                  <div className="stat-val" style={{ color: 'var(--gold-accent)', fontSize: '0.9rem' }}>
                    {Math.max(0, team.squadCount - Math.min(5, team.squadRoleCounts.Batsman || 0) - Math.min(5, team.squadRoleCounts.Bowler || 0) - Math.min(3, team.squadRoleCounts['All-Rounder'] || 0) - Math.min(2, team.squadRoleCounts.Wicketkeeper || 0))}/3
                  </div>
                </div>
              </div>

              {/* Top Buy Highlight & Action */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-surface-secondary)', padding: '0.5rem 0.75rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.75rem' }}>
                  {topBuy ? (
                    <span>
                      🌟 <strong>Highest Buy:</strong> {topBuy.name} (<span style={{ color: 'var(--primary-red)', fontWeight: 700 }}>₹ {topBuy.price.toFixed(2)} Cr</span>)
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>No players acquired yet</span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--primary-red)', fontWeight: 700, fontSize: '0.75rem' }}>
                  <span>ANALYZE</span>
                  <ExternalLink size={14} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
