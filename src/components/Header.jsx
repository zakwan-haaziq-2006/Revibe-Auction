import React, { useState } from 'react';
import { Volume2, VolumeX, Maximize, HelpCircle, RefreshCw, Gavel, Users, Shield, Menu, X, BookOpen, LogOut } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function Header({ 
  currentSet, 
  soundEnabled, 
  setSoundEnabled, 
  activeTab,
  setActiveTab,
  onOpenHelp, 
  onOpenRules,
  onResetData,
  onLogout
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    sounds.setEnabled(nextState);
    if (nextState) sounds.playBidSound();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn('Error attempting to enable fullscreen:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleTabSelect = (tab) => {
    setActiveTab(tab);
    setMenuOpen(false);
  };

  return (
    <header className="header-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 1000, position: 'relative' }}>
      {/* Admin Role Badge Indicator */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {onLogout && (
          <button
            onClick={onLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.4rem 0.75rem',
              borderRadius: '10px',
              border: '1px solid rgba(0,0,0,0.15)',
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(10px)',
              color: '#EF4444',
              fontFamily: 'var(--font-subdisplay)',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}
            title="Log out of Admin console"
          >
            <LogOut size={14} />
            <span>LOGOUT</span>
          </button>
        )}
      </div>

      {/* Set indicator tag in center */}
      <div style={{ fontSize: '0.8rem', fontFamily: 'var(--font-subdisplay)', letterSpacing: '1px', color: 'var(--primary-red)', fontWeight: 700, background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(10px)', padding: '0.35rem 1rem', borderRadius: '20px', border: '1px solid rgba(230, 43, 52, 0.2)', boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}>
        {currentSet || 'SET 1 — MARQUEE PLAYERS'}
      </div>

      {/* Right Controls + Expandable Toggle Bar Button */}
      <div className="header-controls" style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem', position: 'relative' }}>
        <button
          onClick={onOpenRules}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.45rem 0.85rem',
            borderRadius: '12px',
            border: '1.5px solid var(--primary-red)',
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(10px)',
            color: 'var(--primary-red)',
            fontFamily: 'var(--font-subdisplay)',
            fontSize: '0.82rem',
            fontWeight: 800,
            cursor: 'pointer',
            letterSpacing: '0.5px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
          }}
          title="View Official SGC Auction Rules"
        >
          <BookOpen size={15} />
          <span>RULES</span>
        </button>

        <button 
          className="icon-btn" 
          onClick={toggleSound} 
          title={soundEnabled ? "Mute Audio FX" : "Enable Audio FX"}
          style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)' }}
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>

        <button 
          className="icon-btn" 
          onClick={toggleFullscreen} 
          title="Toggle Fullscreen Mode"
          style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)' }}
        >
          <Maximize size={18} />
        </button>

        <button 
          className="icon-btn" 
          onClick={onOpenHelp} 
          title="Keyboard Hotkey Guide (?)"
          style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)' }}
        >
          <HelpCircle size={18} />
        </button>

        <button 
          className="icon-btn" 
          onClick={onResetData} 
          title="Reset Auction Demo Data"
          style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)' }}
        >
          <RefreshCw size={18} />
        </button>

        {/* Right Side Expandable Toggle Menu Button */}
        <button 
          className="icon-btn"
          onClick={() => setMenuOpen((prev) => !prev)}
          style={{
            background: menuOpen ? 'var(--primary-red)' : 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(10px)',
            color: menuOpen ? '#FFFFFF' : 'var(--primary-red)',
            borderColor: 'var(--primary-red)',
            boxShadow: '0 4px 15px rgba(230, 43, 52, 0.3)',
            width: 40,
            height: 40,
            borderRadius: '12px'
          }}
          title="Expand Navigation Menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Floating Expandable Dropdown Drawer */}
        {menuOpen && (
          <div 
            style={{
              position: 'absolute',
              top: '50px',
              right: 0,
              background: 'rgba(255, 255, 255, 0.96)',
              backdropFilter: 'blur(15px)',
              WebkitBackdropFilter: 'blur(15px)',
              borderRadius: '18px',
              boxShadow: '0 12px 35px rgba(0,0,0,0.22)',
              border: '2px solid rgba(230, 43, 52, 0.25)',
              padding: '0.65rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
              zIndex: 9999,
              minWidth: '220px'
            }}
          >
            <button
              onClick={() => handleTabSelect('bidding')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.65rem 0.95rem',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === 'bidding' ? 'var(--primary-red)' : 'rgba(0,0,0,0.03)',
                color: activeTab === 'bidding' ? '#FFFFFF' : '#111111',
                fontFamily: 'var(--font-subdisplay)',
                fontSize: '0.9rem',
                fontWeight: 800,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <Gavel size={17} />
              <span>BIDDING CONSOLE</span>
            </button>

            <button
              onClick={() => handleTabSelect('teams')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.65rem 0.95rem',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === 'teams' ? 'var(--primary-red)' : 'rgba(0,0,0,0.03)',
                color: activeTab === 'teams' ? '#FFFFFF' : '#111111',
                fontFamily: 'var(--font-subdisplay)',
                fontSize: '0.9rem',
                fontWeight: 800,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <Shield size={17} />
              <span>LIVE TEAM OVERVIEW</span>
            </button>

            <button
              onClick={() => handleTabSelect('queue')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.65rem 0.95rem',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === 'queue' ? 'var(--primary-red)' : 'rgba(0,0,0,0.03)',
                color: activeTab === 'queue' ? '#FFFFFF' : '#111111',
                fontFamily: 'var(--font-subdisplay)',
                fontSize: '0.9rem',
                fontWeight: 800,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <Users size={17} />
              <span>AUCTION QUEUE</span>
            </button>

            <div style={{ height: '1px', background: 'rgba(0,0,0,0.08)', margin: '0.2rem 0' }} />

            <button
              onClick={() => {
                onOpenRules();
                setMenuOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.65rem 0.95rem',
                borderRadius: '12px',
                border: 'none',
                background: 'rgba(230, 43, 52, 0.08)',
                color: 'var(--primary-red)',
                fontFamily: 'var(--font-subdisplay)',
                fontSize: '0.9rem',
                fontWeight: 800,
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <BookOpen size={17} />
              <span>SGC AUCTION RULES</span>
            </button>

            {onLogout && (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onLogout();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.65rem 0.95rem',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#EF4444',
                  fontFamily: 'var(--font-subdisplay)',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <LogOut size={17} />
                <span>LOGOUT ADMIN</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
