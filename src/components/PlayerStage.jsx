import React, { useState, useEffect } from 'react';
import { User, Gavel, Award, ShieldAlert, CheckCircle2, AlertCircle, Timer, RotateCcw } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function PlayerStage({ player, status, leadingTeam, currentBid }) {
  const [timerSeconds, setTimerSeconds] = useState(15);
  const [timerRunning, setTimerRunning] = useState(true);

  // Auto-reset bid countdown timer whenever a new bid or player arrives
  useEffect(() => {
    setTimerSeconds(15);
    setTimerRunning(true);
  }, [currentBid, player?.id]);

  // Tick countdown timer
  useEffect(() => {
    if (!timerRunning || status !== 'LIVE') return;
    if (timerSeconds <= 0) return;

    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev === 4) {
          sounds.playBidSound();
        }
        return Math.max(0, prev - 1);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds, status]);

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

      {/* Sold / Unsold Notification Banner */}
      {status !== 'LIVE' ? (
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
      ) : (
        /* Live Stage Bid Countdown Timer Banner */
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: '0.35rem 1.1rem',
            borderRadius: '20px',
            background: timerSeconds <= 5 
              ? 'rgba(239, 68, 68, 0.2)' 
              : 'rgba(17, 17, 17, 0.85)',
            border: timerSeconds <= 5 
              ? '1.5px solid #EF4444' 
              : '1.5px solid rgba(212, 175, 55, 0.5)',
            boxShadow: timerSeconds <= 5 
              ? '0 0 20px rgba(239, 68, 68, 0.5)' 
              : '0 4px 15px rgba(0, 0, 0, 0.3)',
            marginBottom: '0.35rem',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)'
          }}
        >
          <Timer 
            size={16} 
            className={timerSeconds <= 5 ? 'pulse-icon' : ''} 
            style={{ color: timerSeconds <= 5 ? '#EF4444' : '#D4AF37' }} 
          />
          <span 
            style={{ 
              fontFamily: 'var(--font-subdisplay)', 
              fontSize: '0.88rem', 
              fontWeight: 800, 
              color: timerSeconds <= 5 ? '#EF4444' : '#FFF',
              letterSpacing: '1px'
            }}
          >
            BID CLOCK: {timerSeconds > 0 ? `00:${timerSeconds < 10 ? '0' : ''}${timerSeconds}` : 'GOING ONCE, TWICE... SOLD!'}
          </span>
          <button
            onClick={() => setTimerSeconds(15)}
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              border: 'none',
              color: '#D4AF37',
              fontSize: '0.68rem',
              fontWeight: 800,
              padding: '0.15rem 0.45rem',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.2rem'
            }}
            title="Reset 15s Timer"
          >
            <RotateCcw size={10} />
            <span>15s</span>
          </button>
        </div>
      )}

      {/* Centered Gold-Trimmed Marquee Player Card (Matching Image 1 Reference) */}
      <div className="marquee-player-card">
        <div className="marquee-card-inner">
          {/* Capped / Uncapped Tag */}
          <span className="player-capped-badge">
            {player.status || 'Capped'}
          </span>

          {/* Country Flag */}
          <span className="player-country-flag" title={player.country}>
            {player.flag || '🇮🇳'}
          </span>

          {/* Player Avatar / Photo */}
          <div className="player-avatar-wrapper">
            {(player.photoUrl || player.image) ? (
              <img 
                src={player.photoUrl || player.image} 
                alt={player.name} 
                className="player-avatar-img"
              />
            ) : (
              <User className="player-avatar-svg" />
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
