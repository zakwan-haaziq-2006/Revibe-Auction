import React from 'react';
import { X, Keyboard } from 'lucide-react';

export default function ShortcutsModal({ onClose }) {
  const shortcuts = [
    { key: 'C', description: 'Bid for Chennai Super Kings (CSK)' },
    { key: 'M', description: 'Bid for Mumbai Indians (MI)' },
    { key: 'R', description: 'Bid for Royal Challengers Bengaluru (RCB)' },
    { key: 'K', description: 'Bid for Kolkata Knight Riders (KKR)' },
    { key: 'S', description: 'Bid for Sunrisers Hyderabad (SRH)' },
    { key: 'G', description: 'Bid for Gujarat Titans (GT)' },
    { key: 'L', description: 'Bid for Lucknow Super Giants (LSG)' },
    { key: 'D', description: 'Bid for Delhi Capitals (DC)' },
    { key: 'P', description: 'Bid for Punjab Kings (PBKS)' },
    { key: 'J', description: 'Bid for Rajasthan Royals (RR)' },
    { key: 'SPACE / ENTER', description: 'Mark current player as SOLD to leading team' },
    { key: 'U', description: 'Mark current player as UNSOLD' },
    { key: 'N', description: 'Advance to NEXT player in queue' },
    { key: 'Ctrl + Z', description: 'Undo last bid' }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Keyboard size={20} style={{ color: 'var(--primary-red)' }} />
            <h3 className="modal-title">OFFICIAL OPERATOR KEYBOARD SHORTCUTS</h3>
          </div>
          <button 
            className="icon-btn" 
            onClick={onClose}
            style={{ width: 28, height: 28 }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', maxHeight: '340px', overflowY: 'auto' }}>
          {shortcuts.map((sc, index) => (
            <div key={index} className="shortcut-row">
              <span style={{ fontSize: '0.82rem', color: 'var(--text-dark)' }}>
                {sc.description}
              </span>
              <span className="kbd-badge">{sc.key}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '1rem', textAlign: 'right' }}>
          <button 
            className="btn-next" 
            onClick={onClose} 
            style={{ display: 'inline-flex', padding: '0.4rem 1rem' }}
          >
            GOT IT
          </button>
        </div>
      </div>
    </div>
  );
}
