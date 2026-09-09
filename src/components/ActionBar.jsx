import React from 'react';
import { Gavel, XCircle, ArrowRight, ArrowLeft, RotateCcw, RotateCw } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function ActionBar({ 
  onSold, 
  onUnsold, 
  onNextPlayer, 
  onPreviousPlayer,
  onUndoBid, 
  onRedoBid,
  canUndo = true,
  canRedo = false,
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

  const handlePrevClick = () => {
    if (onPreviousPlayer) {
      sounds.playNextSound();
      onPreviousPlayer();
    }
  };

  return (
    <div className="action-bar-container">
      {/* Bid Bumps & Increments + Undo / Redo */}
      <div className="bidding-increments">
        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#D4AF37', letterSpacing: '0.5px', marginRight: '0.2rem' }}>
          BUMP:
        </span>
        <button className="increment-btn" onClick={() => onManualIncrement(0.20)} title="Bump Bid by ₹ 20 Lakh">
          +20L
        </button>
        <button className="increment-btn" onClick={() => onManualIncrement(0.50)} title="Bump Bid by ₹ 50 Lakh">
          +50L
        </button>
        <button className="increment-btn" onClick={() => onManualIncrement(1.00)} title="Bump Bid by ₹ 1.00 Crore">
          +1.00 Cr
        </button>
        <button className="increment-btn" onClick={() => onManualIncrement(2.00)} title="Bump Bid by ₹ 2.00 Crore">
          +2.00 Cr
        </button>

        {/* Dedicated Undo Button */}
        <button 
          className="action-undo-btn" 
          onClick={onUndoBid}
          disabled={!canUndo}
          title="Undo Last Action / Mistaken Bid (Ctrl+Z)"
        >
          <RotateCcw size={15} />
          <span>UNDO</span>
        </button>

        {/* Dedicated Redo Button */}
        {onRedoBid && (
          <button 
            className="action-undo-btn" 
            onClick={onRedoBid}
            disabled={!canRedo}
            title="Redo Undone Bid (Ctrl+Y)"
            style={{ opacity: canRedo ? 1 : 0.4 }}
          >
            <RotateCw size={15} />
            <span>REDO</span>
          </button>
        )}
      </div>

      {/* Primary Action Buttons (Prev, SOLD, UNSOLD, Next) */}
      <div className="primary-actions">
        {/* PREVIOUS PLAYER (Arrow Left) */}
        <button 
          className="btn-nav btn-prev" 
          onClick={handlePrevClick}
          title="Previous Player (Left Arrow [←] or P Key)"
        >
          <ArrowLeft size={18} />
          <span>PREV</span>
          <span className="key-hint">[←]</span>
        </button>

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
          <Gavel size={22} />
          <span>SOLD</span>
          <span className="key-hint">[SPACE]</span>
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
          <XCircle size={18} />
          <span>UNSOLD</span>
          <span className="key-hint">[U]</span>
        </button>

        {/* NEXT PLAYER Control (Arrow Right) */}
        <button 
          className="btn-nav btn-next" 
          onClick={handleNextClick}
          title="Advance to Next Player (Right Arrow [→] or N Key)"
        >
          <span>NEXT</span>
          <ArrowRight size={18} />
          <span className="key-hint">[→]</span>
        </button>
      </div>
    </div>
  );
}
