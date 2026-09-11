import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import Header from './components/Header';
import PlayerStage from './components/PlayerStage';
import ActionBar from './components/ActionBar';
import SetsView from './components/SetsView';
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
  loadAuctionStateFromCloud,
  subscribeToAuctionState, 
  clearAuctionState 
} from './utils/auctionSync';

export default function App() {
  // Enforce mandatory Login Screen on initial load
  const [currentUser, setCurrentUser] = useState(null);

  // Clear any legacy auth keys and old test data from browser storage on mount
  useEffect(() => {
    try {
      localStorage.removeItem('revibe_auth_user');
      sessionStorage.removeItem('revibe_auth_user');
      localStorage.removeItem('revibe_auction_state_v1');
      localStorage.removeItem('revibe_auction_state_v2');
      localStorage.removeItem('revibe_auction_state_v3');
    } catch (err) {
      // ignore
    }
  }, []);

  // Load initial state from persistent storage or fall back to SGC default data
  const initialSyncState = loadAuctionState();

  const [teams, setTeams] = useState(initialSyncState?.teams || INITIAL_TEAMS);
  const [players, setPlayers] = useState(initialSyncState?.players || INITIAL_PLAYERS);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(initialSyncState?.currentPlayerIndex ?? 0);
  const [activeTab, setActiveTab] = useState('sets'); // 'bidding' | 'teams' | 'sets'
  
  const currentPlayer = players[currentPlayerIndex] || players[0];
  
  const [currentBid, setCurrentBid] = useState(initialSyncState?.currentBid ?? (currentPlayer?.basePrice || 2.00));
  const [leadingTeam, setLeadingTeam] = useState(initialSyncState?.leadingTeam || null);
  const [status, setStatus] = useState(initialSyncState?.status || 'LIVE'); // 'LIVE' | 'SOLD' | 'UNSOUND'
  
  const [completedPlayersMap, setCompletedPlayersMap] = useState(initialSyncState?.completedPlayersMap || {});
  const [bidHistory, setBidHistory] = useState(initialSyncState?.bidHistory || []);
  const [redoHistory, setRedoHistory] = useState([]);
  const [bidLogs, setBidLogs] = useState(initialSyncState?.bidLogs || []);
  const [lastSoldPlayer, setLastSoldPlayer] = useState(initialSyncState?.lastSoldPlayer || null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [inspectedTeam, setInspectedTeam] = useState(null);
  const [celebrationActive, setCelebrationActive] = useState(false);
  
  // Set-based auction flow
  const [activeSetName, setActiveSetName] = useState(null);
  const [reauctionPlayerIds, setReauctionPlayerIds] = useState(null);
  const pendingStartIdxRef = useRef(0);

  // Intro & Category Transition States
  const [showIntro, setShowIntro] = useState(initialSyncState?.showIntro ?? false);
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

  // Real-time Cloud SSE, multi-tab BroadcastChannel & storage event subscription
  useEffect(() => {
    // 1. Initial hydration: load from local storage, then immediately check cloud for latest cross-device state
    const local = loadAuctionState();
    if (local) {
      applyRemoteState(local);
    }
    loadAuctionStateFromCloud().then((cloudState) => {
      if (cloudState) {
        applyRemoteState(cloudState);
      }
    });

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

  // Resilient fallback sync for non-admin sessions (mobile phones, bidder portals)
  useEffect(() => {
    if (currentUser && currentUser.role === 'admin') return;

    const syncState = () => {
      const latest = loadAuctionState();
      if (latest) {
        applyRemoteState(latest);
      }
    };

    // Continuous 1-second local storage poll
    const interval = setInterval(syncState, 1000);
    window.addEventListener('focus', syncState);

    // Periodic cloud poll every 2.5 seconds to guarantee phones catch up even if locked/asleep
    const cloudPollInterval = setInterval(() => {
      loadAuctionStateFromCloud().then((cloudState) => {
        if (cloudState) {
          applyRemoteState(cloudState);
        }
      });
    }, 2500);

    return () => {
      window.removeEventListener('focus', syncState);
      clearInterval(interval);
      clearInterval(cloudPollInterval);
    };
  }, [currentUser, applyRemoteState]);

  // Manual refresh handler for Bidder Dashboard and Login Screen
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(Date.now());

  const handleManualRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const cloudState = await loadAuctionStateFromCloud();
      if (cloudState) {
        applyRemoteState(cloudState);
        setLastSyncTime(Date.now());
        return true;
      } else {
        const local = loadAuctionState();
        if (local) {
          applyRemoteState(local);
          setLastSyncTime(Date.now());
          return true;
        }
      }
    } catch (err) {
      console.warn('Manual refresh failed:', err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
    return false;
  }, [applyRemoteState]);

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
      { leadingTeam, currentBid, status, teamsState: teams, completedMap: completedPlayersMap }
    ]);
    setRedoHistory([]);

    setBidLogs((prev) => [
      ...prev,
      { team, amount: nextBidAmount, time: new Date().toLocaleTimeString() }
    ]);

    setLeadingTeam(team);
    setCurrentBid(nextBidAmount);
    sounds.playBidSound();
  }, [status, showIntro, showCategoryTransition, leadingTeam, currentBid, teams, completedPlayersMap]);

  // Handle SOLD button click
  const handleSold = useCallback(() => {
    if (!leadingTeam || status !== 'LIVE' || showIntro || showCategoryTransition) return;

    setBidHistory((prev) => [
      ...prev,
      { leadingTeam, currentBid, status: 'LIVE', teamsState: teams, completedMap: completedPlayersMap }
    ]);
    setRedoHistory([]);

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
  }, [leadingTeam, status, showIntro, showCategoryTransition, currentPlayer, currentBid, teams, completedPlayersMap]);

  // Handle UNSOLD button click
  const handleUnsold = useCallback(() => {
    if (status !== 'LIVE' || showIntro || showCategoryTransition) return;
    setBidHistory((prev) => [
      ...prev,
      { leadingTeam, currentBid, status: 'LIVE', teamsState: teams, completedMap: completedPlayersMap }
    ]);
    setRedoHistory([]);
    setStatus('UNSOLD');
    setCompletedPlayersMap((prev) => ({ ...prev, [currentPlayer.id]: 'UNSOLD' }));
  }, [status, showIntro, showCategoryTransition, currentPlayer, leadingTeam, currentBid, teams, completedPlayersMap]);

  // Set-based auction: Get next unsold player in current set
  const getNextInSet = useCallback((setName, fromIdx) => {
    for (let i = fromIdx + 1; i < players.length; i++) {
      if (players[i].set === setName && !completedPlayersMap[players[i].id]) return i;
    }
    return -1;
  }, [players, completedPlayersMap]);

  // Set-based auction: Get next reauction player
  const getNextReauction = useCallback((fromIdx) => {
    if (!reauctionPlayerIds) return -1;
    for (let i = fromIdx + 1; i < players.length; i++) {
      if (reauctionPlayerIds.has(players[i].id) && !completedPlayersMap[players[i].id]) return i;
    }
    return -1;
  }, [players, reauctionPlayerIds, completedPlayersMap]);

  // Handle NEXT PLAYER (Arrow Right / N Key) — set-based
  const handleNextPlayer = useCallback(() => {
    if (showIntro || showCategoryTransition) return;

    let nextIdx = -1;
    if (reauctionPlayerIds) {
      nextIdx = getNextReauction(currentPlayerIndex);
    } else if (activeSetName) {
      nextIdx = getNextInSet(activeSetName, currentPlayerIndex);
    }

    if (nextIdx === -1) {
      // Set/Reauction complete
      setCategoryTransitionInfo({
        completedCategory: reauctionPlayerIds ? 'RE-AUCTION' : activeSetName,
        nextCategory: null,
        nextPlayerCount: 0,
        nextIdx: -1,
        isSetComplete: true
      });
      setShowCategoryTransition(true);
      return;
    }

    setCurrentPlayerIndex(nextIdx);
    setCurrentBid(players[nextIdx].basePrice);
    setLeadingTeam(null);
    setStatus('LIVE');
    setBidHistory([]);
    setRedoHistory([]);
  }, [currentPlayerIndex, players, showIntro, showCategoryTransition, activeSetName, reauctionPlayerIds, getNextInSet, getNextReauction]);

  // Handle PREVIOUS PLAYER (Arrow Left / P Key)
  const handlePreviousPlayer = useCallback(() => {
    if (showIntro || showCategoryTransition) return;

    const prevIdx = (currentPlayerIndex - 1 + players.length) % players.length;
    setCurrentPlayerIndex(prevIdx);
    setCurrentBid(players[prevIdx].basePrice);
    setLeadingTeam(null);
    setStatus('LIVE');
    setBidHistory([]);
    setRedoHistory([]);
  }, [currentPlayerIndex, players, showIntro, showCategoryTransition]);

  // Proceed to Next Category handler
  const handleProceedToNextCategory = () => {
    if (categoryTransitionInfo?.isSetComplete) {
      // Set complete — go back to sets view
      setActiveTab('sets');
      setActiveSetName(null);
      setReauctionPlayerIds(null);
      setShowCategoryTransition(false);
      setCategoryTransitionInfo(null);
      return;
    }
    if (categoryTransitionInfo) {
      const nextIdx = categoryTransitionInfo.nextIdx;
      const nextPlayer = players[nextIdx];
      setCurrentPlayerIndex(nextIdx);
      setCurrentBid(nextPlayer.basePrice);
      setLeadingTeam(null);
      setStatus('LIVE');
      setBidHistory([]);
      setRedoHistory([]);
    }
    setShowCategoryTransition(false);
    setCategoryTransitionInfo(null);
  };

  // Start Auction handler from Intro
  const handleStartAuction = useCallback(() => {
    const idx = pendingStartIdxRef.current;
    setShowIntro(false);
    setCurrentPlayerIndex(idx);
    setCurrentBid(players[idx].basePrice);
    setLeadingTeam(null);
    setStatus('LIVE');
    setBidHistory([]);
    setRedoHistory([]);
    setActiveTab('bidding');
  }, [players]);

  // Start Auction for a specific set (triggers countdown)
  const handleStartSet = (setName) => {
    setActiveSetName(setName);
    setReauctionPlayerIds(null);
    // Eagerly compute the first unsold player in this set
    let firstIdx = 0;
    for (let i = 0; i < players.length; i++) {
      if (players[i].set === setName && !completedPlayersMap[players[i].id]) {
        firstIdx = i;
        break;
      }
    }
    pendingStartIdxRef.current = firstIdx;
    setShowIntro(true);
  };

  // Start Re-Auction with selected unsold players
  const handleStartReAuction = (selectedPlayers) => {
    const ids = new Set(selectedPlayers.map((p) => p.id));
    setReauctionPlayerIds(ids);
    setActiveSetName('__REAUCTION__');
    // Eagerly compute the first unsold reauction player
    let firstIdx = 0;
    for (let i = 0; i < players.length; i++) {
      if (ids.has(players[i].id) && !completedPlayersMap[players[i].id]) {
        firstIdx = i;
        break;
      }
    }
    pendingStartIdxRef.current = firstIdx;
    setShowIntro(true);
  };

  // Back to Sets View from bidding
  const handleBackToSets = () => {
    setActiveTab('sets');
    setActiveSetName(null);
    setReauctionPlayerIds(null);
  };

  // Manual Increments
  const handleManualIncrement = (amount) => {
    if (status !== 'LIVE' || showIntro || showCategoryTransition) return;
    setBidHistory((prev) => [
      ...prev,
      { leadingTeam, currentBid, status, teamsState: teams, completedMap: completedPlayersMap }
    ]);
    setRedoHistory([]);
    setCurrentBid((prev) => +(prev + amount).toFixed(2));
    sounds.playBidSound();
  };

  // Undo Last Action / Mistaken Bid
  const handleUndoBid = useCallback(() => {
    if (bidHistory.length === 0 || showIntro || showCategoryTransition) return;
    const lastState = bidHistory[bidHistory.length - 1];

    setRedoHistory((prev) => [
      ...prev,
      {
        leadingTeam,
        currentBid,
        status,
        teamsState: teams,
        completedMap: completedPlayersMap
      }
    ]);

    setLeadingTeam(lastState.leadingTeam);
    setCurrentBid(lastState.currentBid);
    if (lastState.status) setStatus(lastState.status);
    if (lastState.teamsState) setTeams(lastState.teamsState);
    if (lastState.completedMap) setCompletedPlayersMap(lastState.completedMap);

    setBidHistory((prev) => prev.slice(0, -1));
    sounds.playBidSound();
  }, [bidHistory, leadingTeam, currentBid, status, teams, completedPlayersMap, showIntro, showCategoryTransition]);

  // Redo Undone Action / Bid
  const handleRedoBid = useCallback(() => {
    if (redoHistory.length === 0 || showIntro || showCategoryTransition) return;
    const nextState = redoHistory[redoHistory.length - 1];

    setBidHistory((prev) => [
      ...prev,
      {
        leadingTeam,
        currentBid,
        status,
        teamsState: teams,
        completedMap: completedPlayersMap
      }
    ]);

    setLeadingTeam(nextState.leadingTeam);
    setCurrentBid(nextState.currentBid);
    if (nextState.status) setStatus(nextState.status);
    if (nextState.teamsState) setTeams(nextState.teamsState);
    if (nextState.completedMap) setCompletedPlayersMap(nextState.completedMap);

    setRedoHistory((prev) => prev.slice(0, -1));
    sounds.playBidSound();
  }, [redoHistory, leadingTeam, currentBid, status, teams, completedPlayersMap, showIntro, showCategoryTransition]);

  const handleSelectPlayerFromQueue = (player) => {
    const idx = players.findIndex((p) => p.id === player.id);
    if (idx !== -1) {
      setCurrentPlayerIndex(idx);
      setCurrentBid(player.basePrice);
      setLeadingTeam(null);
      setStatus('LIVE');
      setBidHistory([]);
      setRedoHistory([]);
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
      setActiveSetName(null);
      setReauctionPlayerIds(null);
    }
  };

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    // Immediately hydrate state from local storage and cloud upon login
    const latestState = loadAuctionState();
    if (latestState) {
      applyRemoteState(latestState);
    }
    loadAuctionStateFromCloud().then((cloudState) => {
      if (cloudState) {
        applyRemoteState(cloudState);
      }
    });
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

      // Undo (Direct 'Z' key or Ctrl+Z) and Redo (Direct 'Y' key, Ctrl+Y, or Shift+Z)
      if (key === 'Z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedoBid();
        } else {
          handleUndoBid();
        }
        return;
      } else if (key === 'Y' || (e.ctrlKey && key === 'Y')) {
        e.preventDefault();
        handleRedoBid();
        return;
      }

      // Player Navigation (ArrowRight / N, ArrowLeft / P)
      if (e.key === 'ArrowRight' || key === 'N') {
        e.preventDefault();
        handleNextPlayer();
        return;
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePreviousPlayer();
        return;
      }

      // Sold & Unsold shortcuts
      if (e.code === 'Space' || key === 'ENTER') {
        e.preventDefault();
        handleSold();
        return;
      } else if (key === 'U') {
        e.preventDefault();
        handleUnsold();
        return;
      } else if (key === '?') {
        setShowShortcutsModal((prev) => !prev);
        return;
      }

      // Letter & Number Key mappings for Teams
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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentUser, teams, handlePlaceBid, handleSold, handleUnsold, handleNextPlayer, handlePreviousPlayer, handleUndoBid, handleRedoBid, showIntro, showCategoryTransition]);

  // 1. Not Authenticated Screen
  if (!currentUser) {
    return (
      <LoginScreen 
        onLoginSuccess={handleLoginSuccess} 
        onRefresh={handleManualRefresh}
        isRefreshing={isRefreshing}
      />
    );
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
        onRefresh={handleManualRefresh}
        isRefreshing={isRefreshing}
        lastSyncTime={lastSyncTime}
      />
    );
  }

  // 3. Admin Auction Management Console
  return (
    <div className="admin-app">
      <div className="revibe-bg-watermark"></div>
      
      {/* Intro Animation & 10-Second Countdown Screen */}
      {showIntro && (
        <IntroScreen 
          onStartAuction={handleStartAuction} 
          onClose={() => setShowIntro(false)}
          categoryName={reauctionPlayerIds ? 'RE-AUCTION' : activeSetName}
        />
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
          isSetComplete={categoryTransitionInfo?.isSetComplete}
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
        onOpenIntro={() => setShowIntro(true)}
        onResetData={handleResetData}
        onLogout={handleLogout}
      />

      {/* Main Tabbed Views */}
      {activeTab === 'bidding' && (
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.65rem', overflow: 'hidden' }}>
          {activeSetName && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 0.25rem', flexShrink: 0 }}>
              <button
                onClick={handleBackToSets}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '10px',
                  border: '1.5px solid rgba(230, 43, 52, 0.3)',
                  background: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(10px)',
                  color: 'var(--primary-red)',
                  fontFamily: 'var(--font-subdisplay)',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                ← BACK TO SETS
              </button>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-subdisplay)', letterSpacing: '0.5px' }}>
                {reauctionPlayerIds ? 'RE-AUCTION' : activeSetName}
              </span>
            </div>
          )}
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
              onPreviousPlayer={handlePreviousPlayer}
              onUndoBid={handleUndoBid}
              onRedoBid={handleRedoBid}
              canUndo={bidHistory.length > 0}
              canRedo={redoHistory.length > 0}
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

      {activeTab === 'sets' && (
        <main style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
          <SetsView
            players={players}
            currentPlayerId={currentPlayer?.id}
            onSelectPlayer={handleSelectPlayerFromQueue}
            completedPlayersMap={completedPlayersMap}
            onStartSet={handleStartSet}
            onStartReAuction={handleStartReAuction}
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
