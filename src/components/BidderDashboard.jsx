import React, { useState, useEffect } from 'react';
import { 
  LogOut, Wallet, TrendingUp, CreditCard, Shield, Users, 
  Search, Award, UserCheck, AlertCircle, Radio, Sparkles, User,
  CheckCircle2, Clock, Activity, Flame, RotateCw
} from 'lucide-react';

function getPlayerInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export default function BidderDashboard({ 
  team, 
  teams = [],
  currentPlayer, 
  currentBid, 
  leadingTeam, 
  status = 'LIVE', 
  bidLogs = [],
  lastSoldPlayer = null,
  showIntro = false,
  onLogout,
  onRefresh,
  isRefreshing = false,
  lastSyncTime = null
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [localRefreshing, setLocalRefreshing] = useState(false);
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [currentPlayer?.id]);

  const isSpinning = isRefreshing || localRefreshing;

  const handleRefreshClick = async () => {
    if (isSpinning) return;
    setLocalRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      }
      setShowSyncSuccess(true);
      setTimeout(() => setShowSyncSuccess(false), 2000);
    } catch (err) {
      console.warn('Error refreshing live data:', err);
    } finally {
      setTimeout(() => setLocalRefreshing(false), 400);
    }
  };

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

  const isLeading = leadingTeam?.id === team.id;

  // Format price into ₹ Crore / Lakh display format
  const formatPrice = (amount) => {
    if (!amount && amount !== 0) return '₹ 0.00 CR';
    if (amount >= 1.0) {
      return `₹ ${amount.toFixed(2)} CR`;
    }
    const lakhs = Math.round(amount * 100);
    return `₹ ${lakhs} LAKH`;
  };

  // Filter acquired players
  const filteredPlayers = acquiredPlayers.filter((player) => {
    const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || player.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Recent bid logs for ticker
  const recentLogs = bidLogs.slice(-3).reverse();

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
          {/* Prominent Live Refresh Button */}
          <button 
            type="button"
            className={`bidder-refresh-btn ${isSpinning ? 'refreshing' : ''} ${showSyncSuccess ? 'synced' : ''}`}
            onClick={handleRefreshClick}
            title="Refresh Live Auction Stage from Admin Console"
          >
            <RotateCw size={15} className={isSpinning ? 'spin-anim' : ''} />
            <span>{isSpinning ? 'Syncing...' : showSyncSuccess ? '✓ Synced' : 'Refresh'}</span>
          </button>

          <div className={`live-status-pill ${status.toLowerCase()}`}>
            <Radio size={14} className="pulse-icon" />
            <span>AUCTION {showIntro ? 'STANDBY' : status}</span>
          </div>

          <button className="bidder-logout-btn" onClick={onLogout} title="Log Out">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <main className="bidder-content">
        {/* HERO: PROMINENT LIVE AUCTION ARENA */}
        {currentPlayer ? (
          <section className="bidder-live-arena">
            <div className="live-arena-header">
              <div className="arena-title">
                <Sparkles size={16} className="sparkle-gold" />
                <span>LIVE AUCTION STAGE</span>
                <span className={`arena-live-indicator ${status.toLowerCase()}`}>
                  <span className="pulsing-circle"></span>
                  {status === 'LIVE' ? 'LIVE NOW' : status}
                </span>

                <button 
                  type="button" 
                  className="arena-quick-refresh-btn" 
                  onClick={handleRefreshClick}
                  title="Pull latest live auction data"
                >
                  <RotateCw size={12} className={isSpinning ? 'spin-anim' : ''} />
                  <span>{isSpinning ? 'Syncing...' : 'Sync'}</span>
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                {isLeading && (
                  <div className="arena-leader-alert">
                    <Flame size={16} />
                    <span>YOUR FRANCHISE IS CURRENTLY WINNING THIS BID!</span>
                  </div>
                )}
                {lastSoldPlayer && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: '#9CA3AF', background: 'rgba(255,255,255,0.06)', padding: '0.25rem 0.65rem', borderRadius: '12px' }}>
                    <span>LAST SALE:</span>
                    <strong style={{ color: '#FFF' }}>{lastSoldPlayer.name}</strong>
                    <span>➔</span>
                    <span style={{ color: lastSoldPlayer.team?.primaryColor || '#D4AF37', fontWeight: 800 }}>{lastSoldPlayer.team?.code}</span>
                    <span>({formatPrice(lastSoldPlayer.price)})</span>
                  </div>
                )}
              </div>
            </div>

            <div className="live-arena-grid">
              {/* Left Column: Player Spotlight Card */}
              <div className="arena-player-card">
                <div className="arena-player-avatar-box">
                  {currentPlayer.photoUrl || currentPlayer.image ? (
                    <img 
                      src={currentPlayer.photoUrl || currentPlayer.image} 
                      alt={currentPlayer.name} 
                      className="arena-player-img"
                      onError={() => setImgError(true)}
                    />
                  ) : null}
                  {(!currentPlayer.photoUrl && !currentPlayer.image) || imgError ? (
                    <div className="player-avatar-initials" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800, color: 'var(--primary-red)' }}>
                      {getPlayerInitials(currentPlayer.name)}
                    </div>
                  ) : null}
                  <span className="arena-capped-badge">
                    {currentPlayer.status || 'Capped'}
                  </span>
                </div>

                <div className="arena-player-meta">
                  <div className="arena-player-role-flag">
                    <span className={`role-badge ${currentPlayer.role}`}>{currentPlayer.role}</span>
                    <span className="arena-country">
                      {currentPlayer.flag || '🇮🇳'} {currentPlayer.country || 'India'}
                      {currentPlayer.isOverseas && <span title="Overseas Slot"> ✈️</span>}
                    </span>
                  </div>
                  <h2 className="arena-player-name">{currentPlayer.name}</h2>
                  <div className="arena-base-price">
                    BASE PRICE: <strong>{formatPrice(currentPlayer.basePrice)}</strong>
                  </div>
                </div>
              </div>

              {/* Center Column: Current Bid Box */}
              <div className="arena-bid-center">
                <div className="arena-bid-box">
                  <span className="arena-bid-title">CURRENT HIGHEST BID</span>
                  <div className="arena-bid-amount">
                    {formatPrice(currentBid)}
                  </div>

                  {status !== 'LIVE' && (
                    <div className={`arena-status-announcement ${status.toLowerCase()}`}>
                      {status === 'SOLD' && (
                        <>
                          <CheckCircle2 size={16} />
                          <span>SOLD TO {leadingTeam?.code || 'FRANCHISE'}</span>
                        </>
                      )}
                      {status === 'UNSOLD' && (
                        <>
                          <AlertCircle size={16} />
                          <span>PLAYER PASSED (UNSOLD)</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Mini Bid History Stream */}
                {recentLogs.length > 0 && (
                  <div className="arena-recent-logs">
                    <div className="logs-header">
                      <Activity size={12} />
                      <span>RECENT BIDS</span>
                    </div>
                    <div className="logs-items">
                      {recentLogs.map((log, index) => (
                        <div key={index} className="log-chip">
                          <span 
                            className="log-team-tag" 
                            style={{ 
                              backgroundColor: log.team?.primaryColor || '#444',
                              color: log.team?.textColor || '#FFF'
                            }}
                          >
                            {log.team?.code}
                          </span>
                          <span className="log-amount">{formatPrice(log.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Leading Team Showcase Card */}
              <div className={`arena-leading-showcase ${leadingTeam ? 'has-leader' : 'waiting'}`}>
                <span className="leading-showcase-label">
                  {leadingTeam ? 'HOLDING HIGHEST BID' : 'WAITING FOR OPENING BID'}
                </span>

                {leadingTeam ? (
                  <div className="leading-team-profile">
                    <div 
                      className="leading-team-avatar"
                      style={{ 
                        backgroundColor: leadingTeam.primaryColor,
                        color: leadingTeam.textColor || '#FFF',
                        boxShadow: `0 0 20px ${leadingTeam.primaryColor}88`
                      }}
                    >
                      {leadingTeam.code}
                    </div>
                    <h3 className="leading-team-fullname">{leadingTeam.name}</h3>
                    <div 
                      className={`leading-tag ${isLeading ? 'own-team' : 'rival-team'}`}
                      style={!isLeading ? { borderColor: leadingTeam.primaryColor, color: '#FFF' } : {}}
                    >
                      {isLeading ? '👑 YOUR TEAM' : `BID FROM ${leadingTeam.code}`}
                    </div>
                  </div>
                ) : (
                  <div className="awaiting-bid-notice">
                    <AlertCircle size={24} style={{ color: '#6B7280' }} />
                    <p>No bids placed yet</p>
                    <span className="awaiting-sub">Bids placed by franchises will appear here in real-time</span>
                  </div>
                )}
              </div>
            </div>
          </section>
        ) : (
          <section className="bidder-live-arena awaiting-stage">
            <div className="awaiting-stage-card">
              <Sparkles size={32} className="sparkle-gold" />
              <h3>Auction Floor Connected</h3>
              <p>Waiting for the Auctioneer to spotlight the next player on stage.</p>
              <button 
                type="button"
                className="bidder-refresh-btn" 
                onClick={handleRefreshClick}
                style={{ margin: '1rem auto 0 auto' }}
              >
                <RotateCw size={15} className={isSpinning ? 'spin-anim' : ''} />
                <span>{isSpinning ? 'Syncing with Admin...' : 'Check Live Stage'}</span>
              </button>
            </div>
          </section>
        )}

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
                  <div className="player-card-badge" style={{ backgroundColor: team.primaryColor, color: team.textColor || '#FFF' }}>
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
                  ? `Players acquired by ${team.name} during the live auction stage will automatically populate here in real-time.`
                  : 'Try clearing your search or role filter.'}
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
