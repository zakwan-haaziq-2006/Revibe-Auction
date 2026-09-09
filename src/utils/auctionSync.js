// Real-time Auction Synchronization Utility
// Combines Cloud Server-Sent Events (SSE) + HTTP Pub/Sub for cross-device sync (laptop <-> phone)
// with BroadcastChannel API and LocalStorage for zero-latency same-device multi-tab synchronization.

const STORAGE_KEY = 'revibe_auction_state_v1';
const CHANNEL_NAME = 'revibe_auction_channel';
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
 * Debounced push to cloud endpoint so fast repeated actions don't overload HTTP requests
 */
function pushStateToCloud(packet) {
  pendingCloudPush = packet;
  if (!cloudPushTimeout) {
    cloudPushTimeout = setTimeout(() => {
      cloudPushTimeout = null;
      if (pendingCloudPush && typeof fetch !== 'undefined') {
        const toSend = pendingCloudPush;
        pendingCloudPush = null;
        fetch(CLOUD_BASE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(toSend)
        }).catch((err) => {
          console.warn('Cloud sync push warning (device offline or network temporary glitch):', err);
        });
      }
    }, 60);
  }
}

/**
 * Save current state to localStorage, local BroadcastChannel, and Cloud (for cross-device sync)
 */
export function saveAuctionState(state) {
  try {
    const timestamp = Date.now();
    const packet = {
      type: 'AUCTION_STATE_UPDATE',
      state,
      payload: state,
      senderId: CLIENT_TAB_ID,
      timestamp
    };

    // 1. Local Storage (Instant same-device persistence)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(packet));

    // 2. Local Broadcast Channel (Instant same-browser multi-tab sync)
    if (broadcastChannel) {
      broadcastChannel.postMessage(packet);
    }

    // 3. Cloud Pub/Sub (Cross-device sync: Laptop <-> Phone)
    pushStateToCloud(packet);
  } catch (err) {
    console.error('Failed to save and broadcast auction state:', err);
  }
}

/**
 * Load persisted auction state from localStorage
 */
export function loadAuctionState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        if ('payload' in parsed && parsed.payload) {
          return parsed.payload;
        }
        if ('state' in parsed && 'timestamp' in parsed) {
          return parsed.state;
        }
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load auction state from localStorage:', err);
  }
  return null;
}

/**
 * Fetch latest auction state from the cloud (used on phones/new devices upon first load)
 */
export async function loadAuctionStateFromCloud() {
  try {
    if (typeof fetch === 'undefined') return null;
    const res = await fetch(`${CLOUD_BASE_URL}/json?poll=1&since=24h`, { cache: 'no-store' });
    if (!res.ok) return null;
    const text = await res.text();
    if (!text) return null;
    const lines = text.trim().split('\n').filter(Boolean);
    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        const item = JSON.parse(lines[i]);
        if (item.event === 'message' && item.message) {
          const data = JSON.parse(item.message);
          if (data.type === 'AUCTION_STATE_UPDATE' && (data.payload || data.state)) {
            const state = data.payload || data.state;
            if (data.timestamp && data.timestamp > lastProcessedTimestamp) {
              lastProcessedTimestamp = data.timestamp;
            }
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            } catch (e) {}
            return state;
          } else if (data.type === 'AUCTION_STATE_RESET') {
            try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
            return null;
          }
        }
      } catch (e) {}
    }
  } catch (err) {
    console.warn('Could not fetch initial state from cloud:', err);
  }
  return null;
}

/**
 * Clear persisted auction state from localStorage, local BroadcastChannel, and Cloud
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

    if (typeof fetch !== 'undefined') {
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
 * Subscribe to real-time state changes from both Cloud (cross-device) and Local (multi-tab)
 * @param {Function} onUpdate Callback function when state changes on another device/tab
 * @param {Function} onReset Callback function when auction is reset on another device/tab
 * @returns {Function} Unsubscribe cleanup function
 */
export function subscribeToAuctionState(onUpdate, onReset) {
  if (typeof window === 'undefined') return () => {};

  // Process verified incoming state packet
  const processIncomingPacket = (data) => {
    if (!data) return;
    if (data.senderId === CLIENT_TAB_ID) return; // Prevent echo reflections

    if (data.type === 'AUCTION_STATE_UPDATE' && (data.payload || data.state)) {
      const state = data.payload || data.state;
      if (data.timestamp && data.timestamp <= lastProcessedTimestamp) {
        return;
      }
      if (data.timestamp) {
        lastProcessedTimestamp = data.timestamp;
      }
      // Update local storage so refreshes retain cloud data
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (e) {}

      onUpdate(state);
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

  // 3. Cloud SSE (Server-Sent Events) Stream for Cross-Device Real-Time Sync (Laptop <-> Phone)
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
        } catch (err) {
          // Ignore keep-alive or malformed payloads
        }
      };

      eventSource.onerror = () => {
        // EventSource will automatically attempt reconnection
      };
    }
  } catch (err) {
    console.warn('Cloud EventSource initialization failed:', err);
  }

  // Cleanup handler
  return () => {
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcastMessage);
    }
    window.removeEventListener('storage', handleStorageChange);
    if (eventSource) {
      eventSource.close();
    }
  };
}
