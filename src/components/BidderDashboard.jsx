import React, { useState } from 'react';
import { 
  LogOut, Wallet, TrendingUp, CreditCard, Shield, Users, 
  Search, Award, UserCheck, AlertCircle, Radio, Sparkles, Gavel 
} from 'lucide-react';

export default function BidderDashboard({ 
  team, 
  currentPlayer, 
  currentBid, 
  leadingTeam, 
  status, 
  onLogout,
  onPlaceBid
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL'); // 'ALL' | 'Batsman' | 'Bowler' | 'All-Rounder' | 'Wicketkeeper'

  if (!team) {
    return (
      <div className="bidder-dashboard-empty">
        <h2>Team Not Found</h2>
        <button onClick={onLogout} className="logout-btn">Return to Login</button>
      </div>
    );
  }

  // Purse metrics calculations
  const totalPurse = team.purseTotal || 80.0;
  const purseRemaining = team.purseRemaining ?? 80.0;
  const purseSpent = +(totalPurse - purseRemaining).toFixed(2);
  const acquiredPlayers = team.acquiredPlayers || [];

  // Calculate next bid increment for IPL rules
  const calculateNextIncrement = (price) => {
    if (price < 1.0) return 0.10;
    if (price < 2.0) return 0.10;
    if (price < 5.0) return 0.20;
    if (price < 10.0) return 0.50;
    return 1.00;
  };

  const nextBidAmount = +(currentBid + calculateNextIncrement(currentBid)).toFixed(2);
  const isLeading = leadingTeam?.id === team.id;
  const canBid = status === 'LIVE' && !isLeading && onPlaceBid && team.squadCount < 18 && purseRemaining >= nextBidAmount;

  // Filter acquired players
  const filteredPlayers = acquiredPlayers.filter((player) => {
    const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || player.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="bidder-dashboard-container">
      {/* Dynamic Franchise Header Bar */}
      <header className="bidder-header" style={{ borderTop: `4px solid ${team.primaryColor}` }}>
        <div className="bidder-header-left">
          <div 
            className="bidder-team-badge"
            style={{ 
              backgroundColor: team.primaryColor, 
              color: team.textColor || '#FFF',
              boxShadow: `0 0 15px ${team.primaryColor}66`
            }}
          >
            {team.code}
          </div>
          <div className="bidder-team-info">
            <h1 className="bidder-team-name">{team.name}</h1>
            <div className="bidder-role-tag">
              <Shield size={13} />
              <span>FRANCHISE BIDDER PORTAL</span>
            </div>
          </div>
        </div>

        <div className="bidder-header-right">
          <div className="live-status-pill">
            <Radio size={14} className="pulse-icon" />
            <span>AUCTION {status}</span>
          </div>
          <button className="bidder-logout-btn" onClick={onLogout} title="Log Out">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <main className="bidder-content">
        {/* TOP SUMMARY CARDS (Total Purse, Purse Spent, Purse Remaining) */}
        <section className="purse-cards-grid">
          {/* Card 1: Total Purse */}
          <div className="purse-card total-purse-card">
            <div className="purse-card-icon" style={{ background: 'rgba(212, 175, 55, 0.15)', color: '#D4AF37' }}>
              <Wallet size={24} />
            </div>
            <div className="purse-card-details">
              <span className="purse-card-label">Total Purse</span>
              <div className="purse-card-value">
                <span className="currency-symbol">₹</span>
                {totalPurse.toFixed(2)}
                <span className="unit-label">Cr</span>
              </div>
              <span className="purse-card-subtext">Initial SGC Franchise Purse</span>
            </div>
          </div>

          {/* Card 2: Purse Spent */}
          <div className="purse-card spent-purse-card">
            <div className="purse-card-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' }}>
              <TrendingUp size={24} />
            </div>
            <div className="purse-card-details">
              <span className="purse-card-label">Purse Spent</span>
              <div className="purse-card-value" style={{ color: '#EF4444' }}>
                <span className="currency-symbol">₹</span>
                {purseSpent.toFixed(2)}
                <span className="unit-label">Cr</span>
              </div>
              <span className="purse-card-subtext">Spent across {acquiredPlayers.length} acquisitions</span>
            </div>
          </div>

          {/* Card 3: Purse Remaining */}
          <div className="purse-card remaining-purse-card">
            <div className="purse-card-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>
              <CreditCard size={24} />
            </div>
            <div className="purse-card-details">
              <span className="purse-card-label">Purse Remaining</span>
              <div className="purse-card-value" style={{ color: purseRemaining < 10 ? '#EF4444' : '#10B981' }}>
                <span className="currency-symbol">₹</span>
                {purseRemaining.toFixed(2)}
                <span className="unit-label">Cr</span>
              </div>
              <span className="purse-card-subtext">Available for future bids</span>
            </div>
          </div>
        </section>

        {/* SECONDARY STATS & SQUAD COMPOSITION BAR */}
        <section className="squad-metrics-bar">
          <div className="metric-chip">
            <Users size={16} />
            <span>Squad: <strong>{team.squadCount || 0} / {team.squadMax || 18}</strong></span>
          </div>

          <div className="metric-chip">
            <Award size={16} />
            <span>Overseas: <strong>{team.overseasCount || 0} / {team.overseasMax || 8}</strong></span>
          </div>

          {/* Role Counts */}
          <div className="role-distribution-group">
            {Object.entries(team.squadRoleCounts || {}).map(([role, count]) => (
              <span key={role} className="role-pill">
                {role}: <strong>{count}</strong>
              </span>
            ))}
          </div>
        </section>

        {/* LIVE STAGE COMPACT MONITOR */}
        {currentPlayer && (
          <section className="live-stage-monitor-banner">
            <div className="monitor-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={16} style={{ color: '#D4AF37' }} />
                <span>LIVE AUCTION MONITOR</span>
              </div>
              {isLeading && (
                <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '12px', background: '#10B98122', color: '#10B981', fontWeight: 700, border: '1px solid #10B98144' }}>
                  YOUR TEAM IS CURRENTLY LEADING
                </span>
              )}
            </div>
            <div className="monitor-body" style={{ alignItems: 'center' }}>
              <div className="monitor-player-info">
                <span className="monitor-player-role">{currentPlayer.role} • {currentPlayer.country || 'India'}</span>
                <h3 className="monitor-player-name">{currentPlayer.name}</h3>
              </div>

              <div className="monitor-bid-info">
                <span className="monitor-bid-label">Current Bid</span>
                <span className="monitor-bid-amount">₹ {currentBid.toFixed(2)} Cr</span>
              </div>

              <div className="monitor-leading-info">
                <span className="monitor-bid-label">Leading Team</span>
                <span className="monitor-leading-team">
                  {leadingTeam ? leadingTeam.name : 'No bids yet'}
                </span>
              </div>

              {/* Direct Franchise Place Bid Action */}
              {onPlaceBid && (
                <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
                  <button
                    onClick={() => onPlaceBid(team)}
                    disabled={!canBid}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.6rem 1.25rem',
                      borderRadius: '12px',
                      border: 'none',
                      background: canBid ? `linear-gradient(135deg, ${team.primaryColor}, #111)` : 'rgba(255,255,255,0.1)',
                      color: canBid ? '#FFF' : 'rgba(255,255,255,0.4)',
                      fontFamily: 'var(--font-subdisplay)',
                      fontSize: '0.9rem',
                      fontWeight: 800,
                      cursor: canBid ? 'pointer' : 'not-allowed',
                      boxShadow: canBid ? `0 4px 15px ${team.primaryColor}88` : 'none',
                      transition: 'all 0.2s ease'
                    }}
                    title={
                      isLeading
                        ? 'Your team is already the highest bidder'
                        : status !== 'LIVE'
                        ? 'Auction is not live'
                        : team.squadCount >= 18
                        ? 'Squad cap reached (18 players)'
                        : purseRemaining < nextBidAmount
                        ? 'Insufficient purse'
                        : `Place bid of ₹ ${nextBidAmount.toFixed(2)} Cr`
                    }
                  >
                    <Gavel size={16} />
                    <span>{isLeading ? 'CURRENT LEADER' : `BID ₹ ${nextBidAmount.toFixed(2)} Cr`}</span>
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ACQUIRED PLAYERS SECTION */}
        <section className="acquired-players-section">
          <div className="section-header-row">
            <div className="section-title-group">
              <UserCheck size={20} style={{ color: '#D4AF37' }} />
              <h2>Acquired Squad Players ({acquiredPlayers.length})</h2>
            </div>

            {/* Filter & Search Controls */}
            <div className="controls-group">
              <div className="search-input-wrapper">
                <Search size={15} />
                <input
                  type="text"
                  placeholder="Search player name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <select
                className="role-select-filter"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="ALL">All Roles</option>
                <option value="Batsman">Batsmen</option>
                <option value="Bowler">Bowlers</option>
                <option value="All-Rounder">All-Rounders</option>
                <option value="Wicketkeeper">Wicketkeepers</option>
              </select>
            </div>
          </div>

          {/* Player List Grid */}
          {filteredPlayers.length > 0 ? (
            <div className="acquired-players-grid">
              {filteredPlayers.map((player, idx) => (
                <div key={player.id || idx} className="acquired-player-card">
                  <div className="player-card-badge" style={{ backgroundColor: team.primaryColor }}>
                    {idx + 1}
                  </div>
                  <div className="player-card-main">
                    <h3 className="player-name">{player.name}</h3>
                    <div className="player-meta-tags">
                      <span className="meta-tag role-tag">{player.role}</span>
                      {(player.isOverseas || (player.country && player.country !== 'India')) && (
                        <span className="meta-tag overseas-tag">✈️ {player.country || 'Overseas'}</span>
                      )}
                    </div>
                  </div>
                  <div className="player-card-price">
                    <span className="price-label">Purse Spent</span>
                    <span className="price-value">₹ {(player.price || player.bidAmount || 0).toFixed(2)} Cr</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-acquired-players-box">
              <AlertCircle size={32} style={{ color: 'var(--text-muted)' }} />
              <h3>{searchQuery || roleFilter !== 'ALL' ? 'No matching players found' : 'No players acquired yet'}</h3>
              <p>
                {acquiredPlayers.length === 0
                  ? `Bids won by ${team.name} during the live auction stage will automatically populate here in real-time.`
                  : 'Try clearing your search or role filter.'}
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

