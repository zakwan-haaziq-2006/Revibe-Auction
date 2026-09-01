import React from 'react';
import { X, BookOpen, ShieldAlert, CheckCircle } from 'lucide-react';
import { SGC_AUCTION_RULES } from '../data/auctionData';

export default function RulesModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-card" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '680px', padding: '1.75rem', borderRadius: '24px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div className="modal-header" style={{ borderBottom: '2px solid var(--primary-red)', paddingBottom: '0.85rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'var(--primary-red)', color: '#FFFFFF', padding: '0.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center' }}>
              <BookOpen size={22} />
            </div>
            <div>
              <h3 className="modal-title" style={{ fontSize: '1.25rem', margin: 0, color: '#111111' }}>
                SGC SYMPOSIUM 2026 — IPL AUCTION RULES
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--primary-red)', fontWeight: 700, letterSpacing: '1px' }}>
                OFFICIAL GUIDELINES & SQUAD CONSTRAINTS (₹80 CR PURSE • EXACT 18 PLAYERS)
              </span>
            </div>
          </div>

          <button className="icon-btn" onClick={onClose} style={{ width: 32, height: 32 }}>
            <X size={18} />
          </button>
        </div>

        {/* Rules Highlights Banner */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem', marginBottom: '1rem' }}>
          <div className="stat-box" style={{ background: '#111111', padding: '0.6rem' }}>
            <span className="stat-label" style={{ color: '#9CA3AF' }}>TOTAL PURSE</span>
            <div className="stat-val" style={{ color: '#10B981', fontSize: '1.2rem' }}>₹ 80.00 Cr</div>
          </div>
          <div className="stat-box" style={{ background: '#111111', padding: '0.6rem' }}>
            <span className="stat-label" style={{ color: '#9CA3AF' }}>EXACT SQUAD</span>
            <div className="stat-val" style={{ color: '#FFFFFF', fontSize: '1.2rem' }}>18 Players</div>
          </div>
          <div className="stat-box" style={{ background: '#111111', padding: '0.6rem' }}>
            <span className="stat-label" style={{ color: '#9CA3AF' }}>MANDATORY ROLES</span>
            <div className="stat-val" style={{ color: 'var(--primary-red)', fontSize: '0.9rem', marginTop: '0.2rem' }}>5 Bat • 5 Bowl • 3 AR • 2 WK</div>
          </div>
        </div>

        {/* 14 Official Rules Scroll List */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {SGC_AUCTION_RULES.map((rule) => (
            <div 
              key={rule.id}
              style={{
                background: 'var(--bg-surface-secondary)',
                borderRadius: '12px',
                padding: '0.85rem 1rem',
                borderLeft: '4px solid var(--primary-red)',
                display: 'flex',
                gap: '0.85rem',
                alignItems: 'flex-start'
              }}
            >
              <div 
                style={{
                  background: '#111111',
                  color: 'var(--primary-red)',
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '0.78rem',
                  flexShrink: 0,
                  marginTop: '0.1rem'
                }}
              >
                {rule.id}
              </div>
              <div>
                <h4 style={{ fontFamily: 'var(--font-subdisplay)', fontSize: '0.92rem', margin: '0 0 0.2rem 0', color: '#111111' }}>
                  {rule.title}
                </h4>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#4B5563', lineHeight: 1.45 }}>
                  {rule.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
