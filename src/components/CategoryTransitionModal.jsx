import React, { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle, UserCheck, Shield, X, BarChart2 } from 'lucide-react';
import SidebarTeams from './SidebarTeams';
import { sounds } from '../utils/soundEffects';

export default function CategoryTransitionModal({ 
  completedCategory, 
  nextCategory, 
  nextPlayerCount, 
  teams = [],
  onInspectTeam,
  onProceed 
}) {
  const [showOverview, setShowOverview] = useState(false);

  useEffect(() => {
    sounds.playCategorySound();
    return () => {
      sounds.stopAllAudio();
    };
  }, []);

  const handleProceedClick = () => {
    sounds.stopAllAudio();
    sounds.playBidSound();
    onProceed();
  };

  return (
    <div className="category-transition-overlay">
      <div className="revibe-bg-watermark"></div>

      {!showOverview ? (
        /* --- MINIMAL CATEGORY TRANSITION SCREEN --- */
        <div className="intro-fullscreen-content">
          <div className="brand-header-group" style={{ marginBottom: '0.5rem' }}>
            <span className="brand-script" style={{ fontSize: '3.2rem' }}>
              Revibe <span>'26</span>
            </span>
          </div>

          <div className="completed-badge">
            <CheckCircle size={18} /> CATEGORY COMPLETED
          </div>

          <h2 className="completed-title">
            {completedCategory || 'BATSMEN'} <span className="crimson-gold-text">FINISHED</span>
          </h2>

          <div className="next-category-minimal">
            <span className="next-tag">UPCOMING CATEGORY</span>
            <h1 className="next-category-title">{nextCategory || 'WICKETKEEPERS'}</h1>
            <p className="next-category-desc">
              <UserCheck size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
              {nextPlayerCount ? `${nextPlayerCount} Players` : 'Next Set'} Ready for Auction Bidding
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', maxWidth: '380px', marginTop: '1.2rem' }}>
            <button className="view-overview-btn" onClick={() => setShowOverview(true)}>
              <BarChart2 size={18} />
              <span>LIVE TEAM OVERVIEW</span>
            </button>

            <button className="proceed-category-btn" onClick={handleProceedClick}>
              <span>PROCEED TO {nextCategory || 'NEXT CATEGORY'}</span>
              <ArrowRight size={22} />
            </button>
          </div>
        </div>
      ) : (
        /* --- EXACT LIVE TEAM OVERVIEW DASHBOARD --- */
        <div className="transition-overview-modal-fullscreen">
          <div className="transition-overview-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: 'var(--primary-red)', color: '#FFF', padding: '0.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center' }}>
                <Shield size={22} />
              </div>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', margin: 0, color: '#111111' }}>
                  FRANCHISE TEAM OVERVIEW ({completedCategory} FINISHED)
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Complete Squad Breakdown & Purse Analysis for All 12 Teams
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button className="proceed-category-btn" onClick={handleProceedClick} style={{ padding: '0.6rem 1.6rem', fontSize: '1rem', width: 'auto' }}>
                <span>PROCEED TO {nextCategory || 'NEXT CATEGORY'}</span>
                <ArrowRight size={18} />
              </button>

              <button className="icon-btn" onClick={() => setShowOverview(false)} style={{ width: 36, height: 36 }}>
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Render Full SidebarTeams Component */}
          <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.3rem' }}>
            <SidebarTeams teams={teams} onInspectTeam={onInspectTeam} />
          </div>
        </div>
      )}
    </div>
  );
}
