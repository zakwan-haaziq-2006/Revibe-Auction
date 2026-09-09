// Real-time Auction Synchronization Utility
// Uses BroadcastChannel API with window storage fallback for multi-tab/multi-window synchronization

const STORAGE_KEY = 'revibe_auction_state_v1';
const CHANNEL_NAME = 'revibe_auction_channel';

// Unique identifier for current browser tab session
export const CLIENT_TAB_ID = 'tab_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();

let broadcastChannel = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  }
} catch (err) {
  console.warn('BroadcastChannel initialization failed, falling back to storage events:', err);
}

let lastProcessedTimestamp = 0;

/**
 * Save current state to localStorage and broadcast across open tabs/windows
 */
export function saveAuctionState(state) {
  try {
    const timestamp = Date.now();
    const packet = {
      state,
      senderId: CLIENT_TAB_ID,
      timestamp
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(packet));

    if (broadcastChannel) {
      broadcastChannel.postMessage({
        type: 'AUCTION_STATE_UPDATE',
        payload: state,
        senderId: CLIENT_TAB_ID,
        timestamp
      });
    }
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
      // Support both wrapped packet format and legacy direct state
      if (parsed && typeof parsed === 'object') {
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
 * Clear persisted auction state from localStorage and broadcast reset
 */
export function clearAuctionState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    if (broadcastChannel) {
      broadcastChannel.postMessage({
        type: 'AUCTION_STATE_RESET',
        senderId: CLIENT_TAB_ID,
        timestamp: Date.now()
      });
    }
  } catch (err) {
    console.error('Failed to clear auction state:', err);
  }
}

/**
 * Subscribe to real-time state changes from other tabs/windows
 * @param {Function} onUpdate Callback function when state changes in another tab
 * @param {Function} onReset Callback function when auction is reset in another tab
 * @returns {Function} Unsubscribe cleanup function
 */
export function subscribeToAuctionState(onUpdate, onReset) {
  if (typeof window === 'undefined') return () => {};

  // 1. BroadcastChannel Listener
  const handleMessage = (event) => {
    if (!event.data) return;
    // Ignore updates dispatched by this exact tab
    if (event.data.senderId === CLIENT_TAB_ID) return;

    if (event.data.type === 'AUCTION_STATE_UPDATE' && event.data.payload) {
      if (event.data.timestamp && event.data.timestamp <= lastProcessedTimestamp) {
        return;
      }
      if (event.data.timestamp) {
        lastProcessedTimestamp = event.data.timestamp;
      }
      onUpdate(event.data.payload);
    } else if (event.data.type === 'AUCTION_STATE_RESET') {
      onReset();
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleMessage);
  }

  // 2. Storage Event Listener (Fallback / Extra cross-window sync)
  const handleStorageChange = (e) => {
    if (e.key === STORAGE_KEY) {
      if (e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          let payload = parsed;
          let senderId = null;
          let timestamp = 0;

          if (parsed && typeof parsed === 'object' && 'state' in parsed) {
            payload = parsed.state;
            senderId = parsed.senderId;
            timestamp = parsed.timestamp || 0;
          }

          if (senderId === CLIENT_TAB_ID) return;
          if (timestamp && timestamp <= lastProcessedTimestamp) return;
          if (timestamp) lastProcessedTimestamp = timestamp;

          onUpdate(payload);
        } catch (err) {
          console.error('Error parsing storage event payload:', err);
        }
      } else {
        onReset();
      }
    }
  };

  window.addEventListener('storage', handleStorageChange);

  // Cleanup handler
  return () => {
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleMessage);
    }
    window.removeEventListener('storage', handleStorageChange);
  };
}
