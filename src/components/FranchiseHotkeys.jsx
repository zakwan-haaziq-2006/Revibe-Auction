import React from 'react';
import { sounds } from '../utils/soundEffects';

export default function FranchiseHotkeys({ 
  teams, 
  leadingTeamId, 
  onPlaceBid, 
  disabled 
}) {
  const handleTeamClick = (team) => {
    if (disabled) return;
    sounds.playBidSound();
    onPlaceBid(team);
  };

  return (
    <div className="franchise-hotkey-panel">
      <div className="panel-header-title">
        <span>OFFICIAL FRANCHISE BIDDING HOTKEYS</span>
        <span>PRESS LETTER KEYS (C=CSK, R=RCB, M=MI, K=KKR, S=SRH, G=GT, L=LSG, D=DC, P=PBKS, J=RR, T=KTK, H=DCG) OR CLICK</span>
      </div>

      <div className="teams-grid">
        {teams.map((team) => {
          const isLeading = team.id === leadingTeamId;

          return (
            <button
              key={team.id}
              className={`team-hotkey-btn ${isLeading ? 'leading' : ''}`}
              onClick={() => handleTeamClick(team)}
              disabled={disabled}
              style={{
                borderColor: isLeading ? 'var(--gold-accent)' : 'transparent',
              }}
            >
              {/* Hotkey Letter Badge */}
              <span className="hotkey-badge">[{team.letterKey}]</span>

              {/* Team Short Code Pill */}
              <div 
                className="team-code-pill"
                style={{
                  color: team.primaryColor,
                  textShadow: team.id === 'csk' ? 'none' : `0 0 10px ${team.primaryColor}40`
                }}
              >
                {team.code}
              </div>

              {/* Purse Remaining */}
              <div className="team-purse-mini">
                ₹ {team.purseRemaining.toFixed(2)} Cr
              </div>

              {/* Squad Count */}
              <div className="team-squad-mini">
                Squad: {team.squadCount}/{team.squadMax} ({team.overseasCount} OS)
              </div>

              {/* Leading Indicator Ribbon */}
              {isLeading && (
                <span className="leading-indicator-tag">
                  ★ LEADING
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
