import React from 'react';
import { Gavel, XCircle, ArrowRight, RotateCcw, Plus } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function ActionBar({ 
  onSold, 
  onUnsold, 
  onNextPlayer, 
  onUndoBid, 
  onManualIncrement,
  canSold,
  status 
}) {
  const handleSoldClick = () => {
    sounds.playSoldGavelSound();
    onSold();
  };

  const handleUnsoldClick = () => {
    sounds.playUnsoldBuzzerSound();
    onUnsold();
  };

  const handleNextClick = () => {
    sounds.playNextSound();
    onNextPlayer();
  };

  return (
    <div className="action-bar-container">
      {/* Bid Bumps & Increments */}
      <div className="bidding-increments">
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginRight: '0.25rem' }}>
          MANUAL BUMP:
        </span>
        <button className="increment-btn" onClick={() => onManualIncrement(0.20)}>
          +₹ 20L
        </button>
        <button className="increment-btn" onClick={() => onManualIncrement(0.50)}>
          +₹ 50L
        </button>
        <button className="increment-btn" onClick={() => onManualIncrement(1.00)}>
          +₹ 1.00 Cr
        </button>
        <button className="increment-btn" onClick={() => onManualIncrement(2.00)}>
          +₹ 2.00 Cr
        </button>

        <button 
          className="icon-btn" 
          onClick={onUndoBid}
          title="Undo Last Bid (Ctrl+Z)"
          style={{ marginLeft: '0.25rem' }}
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Primary Action Buttons */}
      <div className="primary-actions">
        {/* SOLD Button */}
        <button 
          className="btn-sold" 
          onClick={handleSoldClick}
          disabled={!canSold || status === 'SOLD'}
          style={{
            opacity: (!canSold || status === 'SOLD') ? 0.4 : 1,
            cursor: (!canSold || status === 'SOLD') ? 'not-allowed' : 'pointer'
          }}
          title="Mark Player as SOLD (Spacebar)"
        >
          <Gavel size={24} />
          <span>SOLD</span>
          <span style={{ fontSize: '0.65rem', opacity: 0.8, fontStyle: 'italic', marginLeft: '0.2rem' }}>
            [SPACE]
          </span>
        </button>

        {/* UNSOLD Button */}
        <button 
          className="btn-unsold" 
          onClick={handleUnsoldClick}
          disabled={status !== 'LIVE'}
          style={{
            opacity: status !== 'LIVE' ? 0.4 : 1,
            cursor: status !== 'LIVE' ? 'not-allowed' : 'pointer'
          }}
          title="Mark Player as UNSOLD (U Key)"
        >
          <XCircle size={18} style={{ marginRight: '0.3rem', display: 'inline' }} />
          <span>UNSOLD</span>
          <span style={{ fontSize: '0.65rem', opacity: 0.8, marginLeft: '0.2rem' }}>[U]</span>
        </button>

        {/* NEXT PLAYER Control */}
        <button 
          className="btn-next" 
          onClick={handleNextClick}
          title="Advance to Next Player (N Key)"
        >
          <span>NEXT PLAYER</span>
          <ArrowRight size={18} />
          <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>[N]</span>
        </button>
      </div>
    </div>
  );
}
