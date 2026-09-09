import React, { useState } from 'react';
import { Shield, Users, Lock, User, ArrowRight, AlertCircle, Sparkles, RotateCw } from 'lucide-react';
import { ADMIN_CREDENTIALS, INITIAL_TEAMS } from '../data/auctionData';

export default function LoginScreen({ onLoginSuccess, onRefresh, isRefreshing = false }) {
  const [loginMode, setLoginMode] = useState('bidder'); // 'admin' | 'bidder'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleModeSwitch = (mode) => {
    setLoginMode(mode);
    setUsername('');
    setPassword('');
    setErrorMsg('');
  };

  const handleQuickFillTeam = (team) => {
    setLoginMode('bidder');
    setUsername(team.username);
    setPassword('');
    setErrorMsg('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanUser = username.trim().toLowerCase();

    if (loginMode === 'admin') {
      if (
        cleanUser === ADMIN_CREDENTIALS.username.toLowerCase() &&
        password === ADMIN_CREDENTIALS.password
      ) {
        onLoginSuccess({ role: 'admin', user: 'Auction Admin' });
      } else {
        setErrorMsg('Invalid Admin credentials! Please check your username and password.');
      }
    } else {
      // Bidder login: find team by username or code or id
      const matchedTeam = INITIAL_TEAMS.find(
        (t) =>
          t.username.toLowerCase() === cleanUser ||
          t.id.toLowerCase() === cleanUser ||
          t.code.toLowerCase() === cleanUser
      );

      if (matchedTeam) {
        if (password === matchedTeam.password) {
          onLoginSuccess({
            role: 'bidder',
            teamId: matchedTeam.id,
            teamName: matchedTeam.name,
            teamCode: matchedTeam.code
          });
        } else {
          setErrorMsg(`Incorrect password for ${matchedTeam.name}! Try '${matchedTeam.username}@revibe'`);
        }
      } else {
        setErrorMsg('Team username not found! Use team code like csk, mi, kkr, rcb, etc.');
      }
    }
  };

  return (
    <div className="login-screen-overlay">
      <div className="revibe-bg-watermark"></div>

      <div className="login-card-container">
        {/* Brand Header */}
        <div className="login-brand-header">
          <div className="sgc-logo-badge">SGC</div>
          <div className="brand-text">
            <span className="brand-script">
              Revibe <span>'26</span>
            </span>
          </div>
        </div>

        <h2 className="login-title">IPL MEGA AUCTION PORTAL</h2>
        <p className="login-subtitle">Sign in to access your dashboard</p>

        {/* Live Sync Status & Refresh Button */}
        <div className="login-sync-bar">
          <div className="login-sync-indicator">
            <span className="sync-pulse-dot"></span>
            <span>Live Cloud Sync</span>
          </div>
          {onRefresh && (
            <button
              type="button"
              className={`login-refresh-btn ${isRefreshing ? 'refreshing' : ''}`}
              onClick={onRefresh}
              title="Refresh Live Auction Data"
            >
              <RotateCw size={13} className={isRefreshing ? 'spin-anim' : ''} />
              <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
            </button>
          )}
        </div>

        {/* Role Selector Tabs */}
        <div className="login-role-tabs">
          <button
            type="button"
            className={`role-tab-btn ${loginMode === 'bidder' ? 'active' : ''}`}
            onClick={() => handleModeSwitch('bidder')}
          >
            <Users size={18} />
            <span>Bidder Login</span>
          </button>
          <button
            type="button"
            className={`role-tab-btn ${loginMode === 'admin' ? 'active' : ''}`}
            onClick={() => handleModeSwitch('admin')}
          >
            <Shield size={18} />
            <span>Admin Login</span>
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {errorMsg && (
            <div className="login-error-banner">
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="login-username">
              <User size={15} />
              <span>{loginMode === 'admin' ? 'Admin Username' : 'Team Username (e.g. csk, mi, kkr)'}</span>
            </label>
            <input
              id="login-username"
              type="text"
              className="login-input"
              placeholder={loginMode === 'admin' ? 'revibe@admin' : 'csk'}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">
              <Lock size={15} />
              <span>Password</span>
            </label>
            <input
              id="login-password"
              type="password"
              className="login-input"
              placeholder={loginMode === 'admin' ? 'revibe@auction' : 'csk@revibe'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-submit-btn">
            <span>Access {loginMode === 'admin' ? 'Auction Management' : 'Bidder Dashboard'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Franchise Team Selectors */}
        <div className="quick-credentials-section">
          <div className="quick-cred-title">
            <Sparkles size={14} /> Quick Select Franchise Team
          </div>
          <div className="quick-cred-buttons">
            {INITIAL_TEAMS.slice(0, 5).map((team) => (
              <button
                key={team.id}
                type="button"
                className="quick-cred-chip team-chip"
                style={{ borderColor: team.primaryColor, color: '#FFF' }}
                onClick={() => handleQuickFillTeam(team)}
              >
                🏏 {team.code}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
