import React, { useState, useEffect } from 'react';
import { User, Gavel, CheckCircle2, AlertCircle } from 'lucide-react';

function getPlayerInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export default function PlayerStage({ player, status, leadingTeam, currentBid }) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [player?.id]);
  if (!player) {
    return (
      <div className="auction-stage-box">
        <div style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF' }}>
          <h3>No Player Loaded</h3>
        </div>
      </div>
    );
  }

  // Format price into ₹ Crore / Lakh display format
  const formatPrice = (amount) => {
    if (amount >= 1.0) {
      return `₹ ${amount.toFixed(2)} CR`;
    }
    const lakhs = Math.round(amount * 100);
    return `₹ ${lakhs} LAKH`;
  };

  return (
    <div className="auction-stage-box">
      {/* Background Stadium Spotlight & Gavel Watermark */}
      <div className="stage-spotlight"></div>
      <Gavel className="stage-gavel-icon" />

      {/* Sold / Unsold Notification Banner (Only shows when SOLD or UNSOLD) */}
      {status !== 'LIVE' && (
        <div className={`status-banner ${status}`}>
          <span className={`status-dot ${status.toLowerCase()}`}></span>
          {status === 'SOLD' && (
            <>
              <CheckCircle2 size={18} />
              SOLD TO {leadingTeam ? leadingTeam.code : 'FRANCHISE'} FOR {formatPrice(currentBid)}!
            </>
          )}
          {status === 'UNSOLD' && (
            <>
              <AlertCircle size={18} />
              PLAYER UNSOLD — PASSED TO ACCELERATED ROUND
            </>
          )}
        </div>
      )}

      {/* Centered Gold-Trimmed Marquee Player Card */}
      <div className="marquee-player-card">
        <div className="marquee-card-inner">
          {/* Player Avatar / Photo Card */}
          <div className="player-avatar-wrapper">
            {/* Capped / Uncapped Tag */}
            <span className="player-capped-badge">
              {player.status || 'Capped'}
            </span>

            {/* Country Badge */}
            <span className="player-country-badge" title={player.country}>
              {player.flag ? `${player.flag} ` : ''}{player.country || 'INDIA'}
            </span>

            {(player.photoUrl || player.image) && !imgError ? (
              <img 
                src={player.photoUrl || player.image} 
                alt={player.name} 
                className="player-avatar-img"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="player-avatar-initials">{getPlayerInitials(player.name)}</div>
            )}
          </div>

          {/* Player Name */}
          <h2 className="player-name-display">{player.name}</h2>

          {/* Role & Country Strip */}
          <div className="player-role-country-strip">
            <span className={`role-tag ${player.role}`}>{player.role}</span>
            <span>|</span>
            <span>{player.country}</span>
            {player.isOverseas && <span title="Overseas Slot">✈️</span>}
          </div>
        </div>
      </div>

      {/* Bottom Console: Large Current Bid + Leading Franchise Card */}
      <div className="stage-bidding-console">
        {/* Current Bid Display Card */}
        <div className="bid-box-card">
          <span className="bid-box-label">CURRENT BID</span>
          <div className="bid-amount-value">
            {formatPrice(currentBid)}
          </div>
          <span className="base-price-tag">
            BASE PRICE: {formatPrice(player.basePrice)}
          </span>
        </div>

        {/* Leading Franchise Card */}
        <div className={`leading-team-card ${leadingTeam ? 'active-leader' : ''}`}>
          <span className="bid-box-label">
            {leadingTeam ? 'LEADING BIDDER' : 'WAITING FOR FIRST BID'}
          </span>

          {leadingTeam ? (
            <div 
              style={{ 
                backgroundColor: leadingTeam.primaryColor,
                color: leadingTeam.textColor || '#FFFFFF',
                boxShadow: `0 4px 18px ${leadingTeam.primaryColor}66`,
                padding: '0.25rem 1.25rem',
                borderRadius: '12px',
                fontFamily: 'var(--font-display)',
                fontSize: '2.1rem',
                letterSpacing: '1px',
                marginTop: '0.2rem',
                lineHeight: 1
              }}
            >
              {leadingTeam.code}
            </div>
          ) : (
            <div style={{ color: '#6B7280', fontSize: '0.82rem', marginTop: '0.4rem', fontWeight: 600 }}>
              PRESS TEAM KEY TO BID
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
