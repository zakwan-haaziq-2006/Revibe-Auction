import React, { useState, useEffect } from 'react';
import { Play, Trophy } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function IntroScreen({ onStartAuction, onClose, categoryName }) {
  const [countdown, setCountdown] = useState(null); // null = intro screen, number = countdown state

  const handleStartClick = () => {
    sounds.playCountdownMusic();
    setCountdown(5);
  };

  useEffect(() => {
    return () => {
      sounds.stopAllAudio();
    };
  }, []);

  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      sounds.stopAllAudio();
      sounds.playBidSound();
      onStartAuction();
    }
  }, [countdown]);

  return (
    <div className="intro-screen-overlay">
      <div className="revibe-bg-watermark"></div>

      {onClose && (
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.5rem',
            background: 'rgba(0, 0, 0, 0.55)',
            border: '1.5px solid rgba(255, 255, 255, 0.25)',
            color: '#FFFFFF',
            padding: '0.45rem 0.95rem',
            borderRadius: '20px',
            fontFamily: 'var(--font-subdisplay)',
            fontSize: '0.82rem',
            fontWeight: 800,
            cursor: 'pointer',
            zIndex: 100,
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
          title="Dismiss Intro and Return to Stage"
        >
          <span>✕ SKIP INTRO</span>
        </button>
      )}

      {countdown === null ? (
        /* --- FULL SCREEN MINIMAL INTRO --- */
        <div className="intro-fullscreen-content">
          <div className="brand-header-group" style={{ marginBottom: '0.8rem' }}>
            <div className="sgc-logo-badge" style={{ width: '48px', height: '48px', fontSize: '1.1rem' }}>
              SGC
            </div>
            <div className="brand-text">
              <span className="brand-script" style={{ fontSize: '4.2rem' }}>
                Revibe <span>'26</span>
              </span>
            </div>
          </div>

          <div className="intro-badge">
            <Trophy size={16} /> IPL MEGA AUCTION 2026
          </div>

          <h1 className="intro-minimal-heading">
            FIGHT FOR YOUR <span className="crimson-gold-text">DREAM TEAM</span>
          </h1>

          <p className="intro-minimal-subtext">
            10 Franchises • ₹80 Crore Purse • 160+ Star Cricketers
          </p>

          <button className="intro-start-btn" onClick={handleStartClick} style={{ marginTop: '1.8rem' }}>
            <Play size={22} fill="currentColor" />
            <span>START AUCTION</span>
          </button>
        </div>
      ) : (
        /* --- FULL SCREEN MINIMAL 10-SECOND COUNTDOWN --- */
        <div className="intro-fullscreen-content">
          <div className="brand-header-group" style={{ marginBottom: '0.5rem' }}>
            <span className="brand-script" style={{ fontSize: '3.2rem' }}>
              Revibe <span>'26</span>
            </span>
          </div>

          <span className="countdown-category-label">GET READY FOR</span>
          <h2 className="countdown-category-title">{categoryName || 'BATSMEN CATEGORY'}</h2>

          <div className="countdown-timer-circle">
            <svg className="countdown-svg" viewBox="0 0 100 100">
              <circle className="circle-bg" cx="50" cy="50" r="44"></circle>
              <circle 
                className="circle-progress" 
                cx="50" 
                cy="50" 
                r="44"
                style={{ strokeDashoffset: `${(44 * 2 * Math.PI) * (1 - countdown / 5)}px` }}
              ></circle>
            </svg>
            <span className="countdown-number-display">
              {countdown > 0 ? countdown : 'GO!'}
            </span>
          </div>

          <p className="countdown-footer-text">
            {countdown > 0 ? 'Auction starting in...' : 'Launching Auction Stage!'}
          </p>
        </div>
      )}
    </div>
  );
}
