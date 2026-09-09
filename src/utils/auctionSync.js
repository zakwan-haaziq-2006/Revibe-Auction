// Real-time Auction Synchronization Engine (Cross-Device Cloud Sync + Local Multi-Tab)
// Automatically handles Laptop Admin <-> Mobile Phone Bidders over the internet.

import { INITIAL_TEAMS, INITIAL_PLAYERS } from '../data/auctionData.js';

const STORAGE_KEY = 'revibe_auction_state_v1';
const CHANNEL_NAME = 'revibe_auction_channel';

// Reliable, unblocked global cloud relay endpoints (works on all Indian ISPs and mobile networks)
const REST_PRIMARY_URL = 'https://api.restful-api.dev/objects/ff808181a067127101a086bb2f0f5983';
const REST_BACKUP_URL = 'https://api.restful-api.dev/objects/ff808181a067127101a086bc37f25984';

const CLOUD_TOPIC = 'revibe_auction_live_sgc_9948_sync';
const CLOUD_BASE_URL = `https://ntfy.sh/${CLOUD_TOPIC}`;

// Unique identifier for current browser tab/device session
export const CLIENT_TAB_ID = 'dev_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();

let broadcastChannel = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  }
} catch (err) {
  console.warn('BroadcastChannel initialization failed, falling back to cloud & storage:', err);
}

let lastProcessedTimestamp = 0;
let pendingCloudPush = null;
let cloudPushTimeout = null;

/**
 * Compress the entire auction state into a lightweight delta packet (< 500 bytes)
 * to guarantee instant global delivery without hitting cloud payload limits.
 */
export function compressAuctionState(state) {
  if (!state) return null;

  const teamPurses = {};
  const teamSquads = {};
  const acquiredList = [];

  if (Array.isArray(state.teams)) {
    state.teams.forEach((t) => {
      teamPurses[t.id] = t.purseRemaining;
      teamSquads[t.id] = t.squadCount;
      if (Array.isArray(t.acquiredPlayers) && t.acquiredPlayers.length > 0) {
        t.acquiredPlayers.forEach((p) => {
          acquiredList.push({ id: p.id, teamId: t.id, price: p.price, role: p.role });
        });
      }
    });
  }

  // Preserve up to 5 recent bid logs
  const logs = Array.isArray(state.bidLogs)
    ? state.bidLogs.slice(-5).map((l) => ({
        teamId: l.team?.id || l.teamId,
        teamCode: l.team?.code || l.teamCode,
        amount: l.amount,
        time: l.time || Date.now()
      }))
    : [];

  return {
    v: 2,
    idx: typeof state.currentPlayerIndex === 'number' ? state.currentPlayerIndex : 0,
    bid: typeof state.currentBid === 'number' ? state.currentBid : 2.0,
    teamId: state.leadingTeam?.id || null,
    status: state.status || 'LIVE',
    intro: !!state.showIntro,
    completed: state.completedPlayersMap || {},
    lastSold: state.lastSoldPlayer ? {
      name: state.lastSoldPlayer.name,
      teamId: state.lastSoldPlayer.team?.id || state.lastSoldPlayer.teamId || state.lastSoldPlayer.team?.code,
      teamCode: state.lastSoldPlayer.team?.code,
      price: state.lastSoldPlayer.price
    } : null,
    purses: teamPurses,
    squads: teamSquads,
    acquired: acquiredList,
    logs
  };
}

/**
 * Reconstruct the complete rich state object on phones/devices from the lightweight cloud delta
 */
export function decompressAuctionState(compact, baseTeams = INITIAL_TEAMS, basePlayers = INITIAL_PLAYERS) {
  if (!compact) return null;

  // If already full state (e.g. from same-machine tab)
  if (compact.teams && compact.players) {
    return compact;
  }

  const teams = (baseTeams || INITIAL_TEAMS).map((t) => {
    const updatedPurse = compact.purses && compact.purses[t.id] !== undefined 
      ? compact.purses[t.id] 
      : t.purseRemaining;
    const updatedSquad = compact.squads && compact.squads[t.id] !== undefined 
      ? compact.squads[t.id] 
      : t.squadCount;

    const teamAcquired = (compact.acquired || [])
      .filter((a) => a.teamId === t.id)
      .map((a) => {
        const fullPlayer = (basePlayers || INITIAL_PLAYERS).find((p) => p.id === a.id);
        return {
          id: a.id,
          name: fullPlayer?.name || 'Player',
          price: a.price,
          bidAmount: a.price,
          role: a.role || fullPlayer?.role || 'Batsman',
          isOverseas: fullPlayer?.isOverseas || false,
          country: fullPlayer?.country || 'India',
          image: fullPlayer?.image
        };
      });

    return {
      ...t,
      purseRemaining: updatedPurse,
      squadCount: updatedSquad,
      acquiredPlayers: teamAcquired
    };
  });

  const leadingTeam = compact.teamId 
    ? teams.find((t) => t.id === compact.teamId) || null 
    : null;

  const lastSoldPlayer = compact.lastSold ? {
    name: compact.lastSold.name,
    team: teams.find((t) => t.id === compact.lastSold.teamId || t.code === compact.lastSold.teamCode) || { code: compact.lastSold.teamCode, name: compact.lastSold.teamCode },
    price: compact.lastSold.price
  } : null;

  const bidLogs = (compact.logs || []).map((l) => ({
    team: teams.find((t) => t.id === l.teamId || t.code === l.teamCode) || { code: l.teamCode, name: l.teamCode, primaryColor: '#555', textColor: '#FFF' },
    amount: l.amount,
    time: l.time
  }));

  return {
    teams,
    players: basePlayers || INITIAL_PLAYERS,
    currentPlayerIndex: typeof compact.idx === 'number' ? compact.idx : 0,
    currentBid: typeof compact.bid === 'number' ? compact.bid : 2.0,
    leadingTeam,
    status: compact.status || 'LIVE',
    completedPlayersMap: compact.completed || {},
    bidLogs,
    lastSoldPlayer,
    showIntro: !!compact.intro
  };
}

/**
 * Debounced push to reliable cloud endpoints so rapid consecutive bids don't flood the network
 */
function pushStateToCloud(packet) {
  pendingCloudPush = packet;
  if (!cloudPushTimeout) {
    cloudPushTimeout = setTimeout(() => {
      cloudPushTimeout = null;
      if (pendingCloudPush && typeof fetch !== 'undefined') {
        const toSend = pendingCloudPush;
        pendingCloudPush = null;

        const bodyStr = JSON.stringify({
          name: 'revibe_auction_state',
          data: toSend
        });

        // 1. Push to Primary Unblocked REST Endpoint
        fetch(REST_PRIMARY_URL, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: bodyStr
        }).catch((err) => {
          console.warn('Cloud primary sync push error:', err);
        });

        // 2. Push to Secondary Backup REST Endpoint in parallel
        fetch(REST_BACKUP_URL, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: bodyStr
        }).catch(() => {});

        // 3. Optional fallback to ntfy.sh (if accessible)
        try {
          fetch(CLOUD_BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(toSend)
          }).catch(() => {});
        } catch (e) {}
      }
    }, 30);
  }
}

/**
 * Save current state locally and broadcast to cloud for cross-device visibility
 */
export function saveAuctionState(state) {
  try {
    const timestamp = Date.now();
    const compactPayload = compressAuctionState(state);

    const cloudPacket = {
      type: 'AUCTION_STATE_UPDATE',
      payload: compactPayload,
      senderId: CLIENT_TAB_ID,
      timestamp
    };

    // 1. Local Storage (Full state for immediate instant same-tab persistence)
    const localPacket = {
      type: 'AUCTION_STATE_UPDATE',
      state,
      payload: state,
      senderId: CLIENT_TAB_ID,
      timestamp
    };
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(localPacket));
      }
    } catch (e) {}

    // 2. Local BroadcastChannel (Instant multi-tab sync)
    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage(localPacket);
      } catch (e) {}
    }

    // 3. Global Cloud Push (Laptop Admin -> Mobile Phone Bidders in real-time)
    pushStateToCloud(cloudPacket);
  } catch (err) {
    console.error('Failed to save and broadcast auction state:', err);
  }
}

/**
 * Load persisted auction state from localStorage
 */
export function loadAuctionState() {
  try {
    if (typeof window !== 'undefined' && 'localStorage' in window) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          if ('payload' in parsed && parsed.payload) {
            return decompressAuctionState(parsed.payload);
          }
          if ('state' in parsed && 'timestamp' in parsed) {
            return decompressAuctionState(parsed.state);
          }
          return decompressAuctionState(parsed);
        }
      }
    }
  } catch (err) {
    console.error('Failed to load auction state from localStorage:', err);
  }
  return null;
}

/**
 * Fetch latest auction state from cloud (used on phones/new devices and manual refresh)
 */
export async function loadAuctionStateFromCloud() {
  try {
    if (typeof fetch === 'undefined') return null;

    // 1. Fetch from Primary REST Endpoint
    let res = null;
    try {
      res = await fetch(REST_PRIMARY_URL, { 
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
    } catch (e) {
      // Try backup
      try {
        res = await fetch(REST_BACKUP_URL, { 
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        });
      } catch (err2) {}
    }

    if (res && res.ok) {
      const json = await res.json();
      if (json && json.data) {
        const packet = json.data;
        const rawPayload = packet.payload || packet;
        const fullState = decompressAuctionState(rawPayload);

        if (fullState) {
          if (packet.timestamp && packet.timestamp > lastProcessedTimestamp) {
            lastProcessedTimestamp = packet.timestamp;
          }
          try {
            if (typeof window !== 'undefined' && 'localStorage' in window) {
              localStorage.setItem(STORAGE_KEY, JSON.stringify({
                state: fullState,
                senderId: packet.senderId || 'cloud',
                timestamp: packet.timestamp || Date.now()
              }));
            }
          } catch (e) {}
          return fullState;
        }
      }
    }
  } catch (err) {
    console.warn('Could not fetch initial state from REST cloud:', err);
  }

  // 2. Fallback to ntfy.sh in case REST is unavailable
  try {
    const res = await fetch(`${CLOUD_BASE_URL}/json?poll=1&since=24h`, { cache: 'no-store' });
    if (res.ok) {
      const text = await res.text();
      if (text) {
        const lines = text.trim().split('\n').filter(Boolean);
        for (let i = lines.length - 1; i >= 0; i--) {
          try {
            const item = JSON.parse(lines[i]);
            if (item.event === 'message' && item.message) {
              const data = JSON.parse(item.message);
              if (data.type === 'AUCTION_STATE_UPDATE' && data.payload) {
                const fullState = decompressAuctionState(data.payload);
                return fullState;
              }
            }
          } catch (e) {}
        }
      }
    }
  } catch (e) {}

  return null;
}

/**
 * Clear persisted auction state locally and in the cloud
 */
export function clearAuctionState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    const resetPacket = {
      type: 'AUCTION_STATE_RESET',
      senderId: CLIENT_TAB_ID,
      timestamp: Date.now()
    };

    if (broadcastChannel) {
      broadcastChannel.postMessage(resetPacket);
    }

    const bodyStr = JSON.stringify({
      name: 'revibe_auction_state',
      data: resetPacket
    });

    if (typeof fetch !== 'undefined') {
      fetch(REST_PRIMARY_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: bodyStr
      }).catch(() => {});

      fetch(REST_BACKUP_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: bodyStr
      }).catch(() => {});

      fetch(CLOUD_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resetPacket)
      }).catch(() => {});
    }
  } catch (err) {
    console.error('Failed to clear auction state:', err);
  }
}

/**
 * Subscribe to real-time state changes from Cloud (active poll + SSE) and Local (BroadcastChannel/Storage)
 * @param {Function} onUpdate Callback function when state changes on another device/tab
 * @param {Function} onReset Callback function when auction is reset on another device/tab
 * @returns {Function} Unsubscribe cleanup function
 */
export function subscribeToAuctionState(onUpdate, onReset) {
  if (typeof window === 'undefined') return () => {};

  const processIncomingPacket = (data) => {
    if (!data) return;
    if (data.senderId === CLIENT_TAB_ID) return; // Prevent echo

    if (data.type === 'AUCTION_STATE_UPDATE') {
      const rawPayload = data.payload || data.state;
      if (!rawPayload) return;

      if (data.timestamp && data.timestamp <= lastProcessedTimestamp) {
        return;
      }
      if (data.timestamp) {
        lastProcessedTimestamp = data.timestamp;
      }

      const fullState = decompressAuctionState(rawPayload);

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          state: fullState,
          senderId: data.senderId,
          timestamp: data.timestamp
        }));
      } catch (e) {}

      onUpdate(fullState);
    } else if (data.type === 'AUCTION_STATE_RESET') {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {}
      onReset();
    }
  };

  // 1. Local BroadcastChannel Listener (Same-device instant sync)
  const handleBroadcastMessage = (event) => {
    if (!event.data) return;
    processIncomingPacket(event.data);
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcastMessage);
  }

  // 2. Local Storage Event Listener (Cross-window fallback)
  const handleStorageChange = (e) => {
    if (e.key === STORAGE_KEY) {
      if (e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          processIncomingPacket(parsed);
        } catch (err) {
          console.error('Error parsing storage event payload:', err);
        }
      } else {
        onReset();
      }
    }
  };

  window.addEventListener('storage', handleStorageChange);

  // 3. Background Continuous Cloud Polling (Every 1800ms for seamless Phone <-> Laptop sync)
  let isPolling = false;
  const pollInterval = setInterval(async () => {
    if (isPolling) return;
    isPolling = true;
    try {
      const res = await fetch(REST_PRIMARY_URL, { 
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      }).catch(() => null);

      if (res && res.ok) {
        const json = await res.json();
        if (json && json.data) {
          const packet = json.data;
          if (packet.senderId === CLIENT_TAB_ID) {
            isPolling = false;
            return;
          }
          if (packet.timestamp && packet.timestamp > lastProcessedTimestamp) {
            lastProcessedTimestamp = packet.timestamp;
            const fullState = decompressAuctionState(packet.payload || packet);
            if (fullState) {
              try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify({
                  state: fullState,
                  senderId: packet.senderId,
                  timestamp: packet.timestamp
                }));
              } catch (e) {}
              onUpdate(fullState);
            }
          }
        }
      }
    } catch (e) {
      // Ignore network flutter during polling
    } finally {
      isPolling = false;
    }
  }, 1800);

  // 4. Cloud SSE (Server-Sent Events) Stream fallback
  let eventSource = null;
  try {
    if ('EventSource' in window) {
      eventSource = new EventSource(`${CLOUD_BASE_URL}/sse`);
      
      eventSource.onmessage = (event) => {
        try {
          if (!event.data) return;
          const ntfyEvent = JSON.parse(event.data);
          if (ntfyEvent.event !== 'message' || !ntfyEvent.message) return;

          const data = JSON.parse(ntfyEvent.message);
          processIncomingPacket(data);
        } catch (err) {}
      };
    }
  } catch (err) {}

  // Cleanup handler
  return () => {
    clearInterval(pollInterval);
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcastMessage);
    }
    window.removeEventListener('storage', handleStorageChange);
    if (eventSource) {
      eventSource.close();
    }
  };
}

