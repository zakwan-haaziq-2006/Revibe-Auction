import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import Header from './components/Header';
import PlayerStage from './components/PlayerStage';
import ActionBar from './components/ActionBar';
import UpcomingQueue from './components/UpcomingQueue';
import SidebarTeams from './components/SidebarTeams';
import ShortcutsModal from './components/ShortcutsModal';
import TeamDetailModal from './components/TeamDetailModal';
import RulesModal from './components/RulesModal';
import IntroScreen from './components/IntroScreen';
import CategoryTransitionModal from './components/CategoryTransitionModal';
import LoginScreen from './components/LoginScreen';
import BidderDashboard from './components/BidderDashboard';
import { INITIAL_TEAMS, INITIAL_PLAYERS } from './data/auctionData';
import { sounds } from './utils/soundEffects';
import { 
  saveAuctionState, 
  loadAuctionState, 
  subscribeToAuctionState, 
  clearAuctionState 
} from './utils/auctionSync';

export default function App() {
  // Enforce mandatory Login Screen on initial load
  const [currentUser, setCurrentUser] = useState(null);

  // Clear any legacy auth keys from browser storage on mount
  useEffect(() => {
    try {
      localStorage.removeItem('revibe_auth_user');
      sessionStorage.removeItem('revibe_auth_user');
    } catch (err) {
      // ignore
    }
  }, []);

  // Load initial state from persistent storage or fall back to SGC default data
  const initialSyncState = loadAuctionState();

  const [teams, setTeams] = useState(initialSyncState?.teams || INITIAL_TEAMS);
  const [players, setPlayers] = useState(initialSyncState?.players || INITIAL_PLAYERS);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(initialSyncState?.currentPlayerIndex ?? 0);
  const [activeTab, setActiveTab] = useState('bidding'); // 'bidding' | 'teams' | 'queue'
  
  const currentPlayer = players[currentPlayerIndex] || players[0];
  
  const [currentBid, setCurrentBid] = useState(initialSyncState?.currentBid ?? (currentPlayer?.basePrice || 2.00));
  const [leadingTeam, setLeadingTeam] = useState(initialSyncState?.leadingTeam || null);
  const [status, setStatus] = useState(initialSyncState?.status || 'LIVE'); // 'LIVE' | 'SOLD' | 'UNSOUND'
  
  const [completedPlayersMap, setCompletedPlayersMap] = useState(initialSyncState?.completedPlayersMap || {});
  const [bidHistory, setBidHistory] = useState(initialSyncState?.bidHistory || []);
  const [bidLogs, setBidLogs] = useState(initialSyncState?.bidLogs || []);
  const [lastSoldPlayer, setLastSoldPlayer] = useState(initialSyncState?.lastSoldPlayer || null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [inspectedTeam, setInspectedTeam] = useState(null);
  const [celebrationActive, setCelebrationActive] = useState(false);

  // Intro & Category Transition States
  const [showIntro, setShowIntro] = useState(initialSyncState?.showIntro ?? true);
  const [showCategoryTransition, setShowCategoryTransition] = useState(false);
  const [categoryTransitionInfo, setCategoryTransitionInfo] = useState(null);

  // Ref to prevent feedback loop when receiving remoteBroadcast state
  const isReceivingRemoteSync = useRef(false);

  // Helper to apply incoming remote sync state safely
  const applyRemoteState = useCallback((newState) => {
    if (!newState) return;
    isReceivingRemoteSync.current = true;
    if (newState.teams) setTeams(newState.teams);
    if (newState.players) setPlayers(newState.players);
    if (typeof newState.currentPlayerIndex === 'number') setCurrentPlayerIndex(newState.currentPlayerIndex);
    if (typeof newState.currentBid === 'number') setCurrentBid(newState.currentBid);
    setLeadingTeam(newState.leadingTeam || null);
    if (newState.status) setStatus(newState.status);
    if (newState.completedPlayersMap) setCompletedPlayersMap(newState.completedPlayersMap);
    if (newState.bidHistory) setBidHistory(newState.bidHistory);
    if (newState.bidLogs) setBidLogs(newState.bidLogs);
    if (newState.lastSoldPlayer !== undefined) setLastSoldPlayer(newState.lastSoldPlayer);
    if (typeof newState.showIntro === 'boolean') setShowIntro(newState.showIntro);
  }, []);

  // Real-time multi-tab BroadcastChannel & storage event subscription
  useEffect(() => {
    const unsubscribe = subscribeToAuctionState(
      (newState) => {
        applyRemoteState(newState);
      },
      () => {
        isReceivingRemoteSync.current = true;
        setTeams(INITIAL_TEAMS);
        setPlayers(INITIAL_PLAYERS);
        setCurrentPlayerIndex(0);
        setCurrentBid(INITIAL_PLAYERS[0]?.basePrice || 2.00);
        setLeadingTeam(null);
        setStatus('LIVE');
        setCompletedPlayersMap({});
        setBidHistory([]);
        setBidLogs([]);
        setLastSoldPlayer(null);
        setShowIntro(true);
      }
    );

    return () => unsubscribe();
  }, [applyRemoteState]);

  // Resilient fallback sync for non-admin sessions (bidders & login screen)
  useEffect(() => {
    if (currentUser && currentUser.role === 'admin') return;

    const syncFromStorage = () => {
      const latest = loadAuctionState();
      if (latest) {
        applyRemoteState(latest);
      }
    };

    // Sync on window focus
    window.addEventListener('focus', syncFromStorage);

    // Continuous 1-second interval to guarantee user side reflects live auction without delay
    const interval = setInterval(syncFromStorage, 1000);

    return () => {
      window.removeEventListener('focus', syncFromStorage);
      clearInterval(interval);
    };
  }, [currentUser, applyRemoteState]);

  // Save to localStorage & broadcast whenever local state changes — STRICTLY ADMIN ONLY!
  useEffect(() => {
    // Only Admin can write and broadcast auction state to prevent bidder tabs from overwriting live data
    if (!currentUser || currentUser.role !== 'admin') {
      return;
    }

    if (isReceivingRemoteSync.current) {
      isReceivingRemoteSync.current = false;
      return;
    }

    saveAuctionState({
      teams,
      players,
      currentPlayerIndex,
      currentBid,
      leadingTeam,
      status,
      completedPlayersMap,
      bidHistory,
      bidLogs,
      lastSoldPlayer,
      showIntro
    });
  }, [
    currentUser,
    teams,
    players,
    currentPlayerIndex,
    currentBid,
    leadingTeam,
    status,
    completedPlayersMap,
    bidHistory,
    bidLogs,
    lastSoldPlayer,
    showIntro
  ]);

  // Dynamic IPL bid increment rule
  const calculateNextIncrement = (price) => {
    if (price < 1.0) return 0.10; // 10 Lakhs
    if (price < 2.0) return 0.10; // 10 Lakhs
    if (price < 5.0) return 0.20; // 20 Lakhs
    if (price < 10.0) return 0.50; // 50 Lakhs
    return 1.00; // 1 Crore
  };

  // Place Bid for a franchise (strictly enforces SGC rules)
  const handlePlaceBid = useCallback((team) => {
    if (status !== 'LIVE' || showIntro || showCategoryTransition) return;

    // Rule 12: 18-Player Squad Cap Check
    if (team.squadCount >= 18) {
      alert(`RULE 12 VIOLATION: ${team.name} (${team.code}) has completed its exact 18-player squad! No further bids permitted.`);
      return;
    }

    const increment = calculateNextIncrement(currentBid);
    const nextBidAmount = +(currentBid + increment).toFixed(2);

    // Rule 6: Available Purse Check
    if (team.purseRemaining < nextBidAmount) {
      alert(`RULE 6 ALERT: ${team.name} has insufficient purse (₹ ${team.purseRemaining.toFixed(2)} Cr) for ₹ ${nextBidAmount.toFixed(2)} Cr bid! Bidding beyond available purse is disqualified.`);
      return;
    }

    setBidHistory((prev) => [
      ...prev,
      { leadingTeam, currentBid }
    ]);

    setBidLogs((prev) => [
      ...prev,
      { team, amount: nextBidAmount, time: new Date().toLocaleTimeString() }
    ]);

    setLeadingTeam(team);
    setCurrentBid(nextBidAmount);
    sounds.playBidSound();
  }, [status, showIntro, showCategoryTransition, leadingTeam, currentBid]);

  // Handle SOLD button click
  const handleSold = useCallback(() => {
    if (!leadingTeam || status !== 'LIVE' || showIntro || showCategoryTransition) return;

    setStatus('SOLD');
    setCompletedPlayersMap((prev) => ({ ...prev, [currentPlayer.id]: 'SOLD' }));
    setLastSoldPlayer({ name: currentPlayer.name, team: leadingTeam, price: currentBid });

    setCelebrationActive(true);
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: [leadingTeam.primaryColor, '#D4AF37', '#E62B34', '#FFFFFF']
    });

    setTeams((prevTeams) =>
      prevTeams.map((t) => {
        if (t.id === leadingTeam.id) {
          const newRoleCounts = { ...t.squadRoleCounts };
          newRoleCounts[currentPlayer.role] = (newRoleCounts[currentPlayer.role] || 0) + 1;

          return {
            ...t,
            purseRemaining: +(t.purseRemaining - currentBid).toFixed(2),
            squadCount: t.squadCount + 1,
            overseasCount: currentPlayer.isOverseas ? t.overseasCount + 1 : t.overseasCount,
            squadRoleCounts: newRoleCounts,
            acquiredPlayers: [
              ...t.acquiredPlayers,
              { 
                id: currentPlayer.id,
                name: currentPlayer.name, 
                price: currentBid, 
                bidAmount: currentBid,
                role: currentPlayer.role,
                isOverseas: currentPlayer.isOverseas,
                country: currentPlayer.country || 'India',
                image: currentPlayer.image
              }
            ]
          };
        }
        return t;
      })
    );

    setTimeout(() => {
      setCelebrationActive(false);
    }, 1000);
  }, [leadingTeam, status, showIntro, showCategoryTransition, currentPlayer, currentBid]);

  // Handle UNSOLD button click
  const handleUnsold = useCallback(() => {
    if (status !== 'LIVE' || showIntro || showCategoryTransition) return;
    setStatus('UNSOLD');
    setCompletedPlayersMap((prev) => ({ ...prev, [currentPlayer.id]: 'UNSOLD' }));
  }, [status, showIntro, showCategoryTransition, currentPlayer]);

  // Handle NEXT PLAYER (With Category Completion Detection)
  const handleNextPlayer = useCallback(() => {
    if (showIntro || showCategoryTransition) return;

    const nextIdx = (currentPlayerIndex + 1) % players.length;
    const currentSet = players[currentPlayerIndex]?.set;
    const nextSet = players[nextIdx]?.set;

    // Check if transitioning to a new Category Set
    if (currentSet && nextSet && currentSet !== nextSet) {
      const nextCategoryPlayers = players.filter((p) => p.set === nextSet);
      setCategoryTransitionInfo({
        completedCategory: currentSet,
        nextCategory: nextSet,
        nextPlayerCount: nextCategoryPlayers.length,
        nextIdx: nextIdx
      });
      setShowCategoryTransition(true);
      return;
    }

    setCurrentPlayerIndex(nextIdx);
    setCurrentBid(players[nextIdx].basePrice);
    setLeadingTeam(null);
    setStatus('LIVE');
    setBidHistory([]);
  }, [currentPlayerIndex, players, showIntro, showCategoryTransition]);

  // Proceed to Next Category handler
  const handleProceedToNextCategory = () => {
    if (categoryTransitionInfo) {
      const nextIdx = categoryTransitionInfo.nextIdx;
      const nextPlayer = players[nextIdx];
      setCurrentPlayerIndex(nextIdx);
      setCurrentBid(nextPlayer.basePrice);
      setLeadingTeam(null);
      setStatus('LIVE');
      setBidHistory([]);
    }
    setShowCategoryTransition(false);
    setCategoryTransitionInfo(null);
  };

  // Start Auction handler from Intro
  const handleStartAuction = () => {
    setShowIntro(false);
    setCurrentPlayerIndex(0);
    setCurrentBid(players[0].basePrice);
    setLeadingTeam(null);
    setStatus('LIVE');
  };

  // Manual Increments
  const handleManualIncrement = (amount) => {
    if (status !== 'LIVE' || showIntro || showCategoryTransition) return;
    setBidHistory((prev) => [...prev, { leadingTeam, currentBid }]);
    setCurrentBid((prev) => +(prev + amount).toFixed(2));
    sounds.playBidSound();
  };

  // Undo Last Bid
  const handleUndoBid = useCallback(() => {
    if (bidHistory.length === 0 || status !== 'LIVE' || showIntro || showCategoryTransition) return;
    const lastState = bidHistory[bidHistory.length - 1];
    setLeadingTeam(lastState.leadingTeam);
    setCurrentBid(lastState.currentBid);
    setBidHistory((prev) => prev.slice(0, -1));
  }, [bidHistory, status, showIntro, showCategoryTransition]);

  const handleSelectPlayerFromQueue = (player) => {
    const idx = players.findIndex((p) => p.id === player.id);
    if (idx !== -1) {
      setCurrentPlayerIndex(idx);
      setCurrentBid(player.basePrice);
      setLeadingTeam(null);
      setStatus('LIVE');
      setBidHistory([]);
      setActiveTab('bidding');
    }
  };

  const handleResetData = () => {
    if (window.confirm('Reset all IPL Auction data to initial SGC ₹80 Cr purse state?')) {
      clearAuctionState();
      setTeams(INITIAL_TEAMS);
      setPlayers(INITIAL_PLAYERS);
      setCurrentPlayerIndex(0);
      setCurrentBid(INITIAL_PLAYERS[0].basePrice);
      setLeadingTeam(null);
      setStatus('LIVE');
      setCompletedPlayersMap({});
      setBidHistory([]);
      setBidLogs([]);
      setLastSoldPlayer(null);
      setShowIntro(true);
    }
  };

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    // Immediately hydrate state from localStorage upon login to show the active live player
    const latestState = loadAuctionState();
    if (latestState) {
      applyRemoteState(latestState);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      sessionStorage.removeItem('revibe_auth_user');
      localStorage.removeItem('revibe_auth_user');
    } catch (err) {
      console.warn('Failed to clear auth user:', err);
    }
  };

  // Keyboard Event Listener (Admin Only)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!currentUser || currentUser.role !== 'admin') return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (showIntro || showCategoryTransition) return;

      const key = e.key.toUpperCase();

      // Letter & Number Key mappings
      const teamHotkeyMap = {
        'C': 'csk', '1': 'csk',
        'M': 'mi',  '2': 'mi',
        'R': 'rcb', '3': 'rcb',
        'K': 'kkr', '4': 'kkr',
        'J': 'rr',  '5': 'rr',
        'S': 'srh', '6': 'srh',
        'G': 'gt',  '7': 'gt',
        'L': 'lsg', '8': 'lsg',
        'D': 'dc',  '9': 'dc',
        'P': 'pbks','0': 'pbks'
      };

      if (teamHotkeyMap[key]) {
        const targetTeam = teams.find((t) => t.id === teamHotkeyMap[key]);
        if (targetTeam) {
          handlePlaceBid(targetTeam);
        }
      } else if (e.code === 'Space' || key === 'ENTER') {
        e.preventDefault();
        handleSold();
      } else if (key === 'U') {
        handleUnsold();
      } else if (key === 'N') {
        handleNextPlayer();
      } else if (key === '?') {
        setShowShortcutsModal((prev) => !prev);
      } else if (e.ctrlKey && key === 'Z') {
        handleUndoBid();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentUser, teams, handlePlaceBid, handleSold, handleUnsold, handleNextPlayer, handleUndoBid, showIntro, showCategoryTransition]);

  // 1. Not Authenticated Screen
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // 2. Bidder / Franchise Dashboard View
  if (currentUser.role === 'bidder') {
    const bidderTeam = teams.find((t) => t.id === currentUser.teamId) || teams[0];
    return (
      <BidderDashboard
        team={bidderTeam}
        teams={teams}
        currentPlayer={currentPlayer}
        currentBid={currentBid}
        leadingTeam={leadingTeam}
        status={status}
        bidLogs={bidLogs}
        lastSoldPlayer={lastSoldPlayer}
        showIntro={showIntro}
        onLogout={handleLogout}
      />
    );
  }

  // 3. Admin Auction Management Console
  return (
    <div className="admin-app">
      <div className="revibe-bg-watermark"></div>
      
      {/* Intro Animation & 10-Second Countdown Screen */}
      {showIntro && (
        <IntroScreen onStartAuction={handleStartAuction} />
      )}

      {/* Category Completion Transition Modal */}
      {showCategoryTransition && (
        <CategoryTransitionModal
          completedCategory={categoryTransitionInfo?.completedCategory}
          nextCategory={categoryTransitionInfo?.nextCategory}
          nextPlayerCount={categoryTransitionInfo?.nextPlayerCount}
          teams={teams}
          onInspectTeam={(team) => setInspectedTeam(team)}
          onProceed={handleProceedToNextCategory}
        />
      )}

      {celebrationActive && <div className="sold-celebration-overlay"></div>}

      {/* Top Header */}
      <Header
        currentSet={currentPlayer?.set}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenHelp={() => setShowShortcutsModal(true)}
        onOpenRules={() => setShowRulesModal(true)}
        onResetData={handleResetData}
        onLogout={handleLogout}
      />

      {/* Main Tabbed Views */}
      {activeTab === 'bidding' && (
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.65rem', overflow: 'hidden' }}>
          <div className="center-stage-container" style={{ flex: 1 }}>
            <PlayerStage
              player={currentPlayer}
              status={status}
              leadingTeam={leadingTeam}
              currentBid={currentBid}
            />

            <ActionBar
              onSold={handleSold}
              onUnsold={handleUnsold}
              onNextPlayer={handleNextPlayer}
              onUndoBid={handleUndoBid}
              onManualIncrement={handleManualIncrement}
              canSold={!!leadingTeam}
              status={status}
            />
          </div>
        </main>
      )}

      {activeTab === 'teams' && (
        <main style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
          <SidebarTeams
            teams={teams}
            onInspectTeam={(team) => setInspectedTeam(team)}
          />
        </main>
      )}

      {activeTab === 'queue' && (
        <main style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
          <UpcomingQueue
            players={players}
            currentPlayerId={currentPlayer?.id}
            onSelectPlayer={handleSelectPlayerFromQueue}
            completedPlayersMap={completedPlayersMap}
          />
        </main>
      )}

      {/* Modals */}
      {showShortcutsModal && (
        <ShortcutsModal onClose={() => setShowShortcutsModal(false)} />
      )}

      {showRulesModal && (
        <RulesModal onClose={() => setShowRulesModal(false)} />
      )}

      {inspectedTeam && (
        <TeamDetailModal
          team={inspectedTeam}
          onClose={() => setInspectedTeam(null)}
        />
      )}
    </div>
  );
}
