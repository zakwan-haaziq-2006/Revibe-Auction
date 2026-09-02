// Real-time Auction Synchronization Utility
// Uses BroadcastChannel API with window storage fallback for multi-tab/multi-window synchronization

const STORAGE_KEY = 'revibe_auction_state_v1';
const CHANNEL_NAME = 'revibe_auction_channel';

let broadcastChannel = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  }
} catch (err) {
  console.warn('BroadcastChannel initialization failed, falling back to storage events:', err);
}

/**
 * Save current state to localStorage and broadcast across open tabs/windows
 */
export function saveAuctionState(state) {
  try {
    const payload = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, payload);

    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'AUCTION_STATE_UPDATE', payload: state });
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
      return JSON.parse(saved);
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
      broadcastChannel.postMessage({ type: 'AUCTION_STATE_RESET' });
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
    if (event.data.type === 'AUCTION_STATE_UPDATE' && event.data.payload) {
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
          const newState = JSON.parse(e.newValue);
          onUpdate(newState);
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
