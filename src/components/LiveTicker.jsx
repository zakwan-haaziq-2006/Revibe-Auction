import React from 'react';
import { Activity, ShieldCheck, History } from 'lucide-react';

export default function LiveTicker({ bidLogs, teams, lastSoldPlayer }) {
  return (
    <div className="live-ticker-bar">
      {/* Ticker Icon */}
      <div className="ticker-label">
        <Activity size={14} className="ticker-pulse-icon" />
        <span>LIVE ACTIVITY</span>
      </div>

      {/* Scrolling / Running Ticker Info */}
      <div className="ticker-content-track">
        {bidLogs.length > 0 ? (
          <div className="ticker-log-item">
            <History size={12} />
            <span>
              LATEST BID: <strong>{bidLogs[bidLogs.length - 1].team.code}</strong> BID ₹ {bidLogs[bidLogs.length - 1].amount.toFixed(2)} CR
            </span>
          </div>
        ) : (
          <div className="ticker-log-item">
            <span>WAITING FOR OPENING BID...</span>
          </div>
        )}

        {lastSoldPlayer && (
          <div className="ticker-log-item sold-accent">
            <ShieldCheck size={12} />
            <span>
              LAST SALE: <strong>{lastSoldPlayer.name}</strong> SOLD TO <strong>{lastSoldPlayer.team.code}</strong> FOR ₹ {lastSoldPlayer.price.toFixed(2)} CR!
            </span>
          </div>
        )}

        {/* Quick Franchise Purse Ticker */}
        <div className="ticker-teams-inline">
          {teams.map((t) => (
            <span key={t.id} className="team-purse-tag">
              <strong style={{ color: t.primaryColor }}>{t.code}:</strong> ₹{t.purseRemaining.toFixed(1)}Cr
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
