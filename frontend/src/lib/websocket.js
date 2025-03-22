const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:5001/ws";

// WebSocket states
export const WS_STATES = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
};

// Message types
export const MESSAGE_TYPES = {
  SUBSCRIBE: "subscribe",
  UNSUBSCRIBE: "unsubscribe",
  MARKET_DATA: "marketData",
  CONNECTION_STATUS: "connectionStatus",
  PING: "ping",
  PONG: "pong",
  ERROR: "error",
};

class WebSocketService {
  constructor() {
    this.socket = null;
    this.reconnectTimeout = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1s delay
    this.handlers = {
      open: [],
      close: [],
      message: [],
      error: [],
      reconnect: [],
    };
    this.pingInterval = null;
    this.pendingSubscriptions = new Set(); // Track pending subscriptions
  }

  /**
   * Connect to the WebSocket server
   */
  connect() {
    if (this.socket && this.socket.readyState === WS_STATES.OPEN) {
      return;
    }

    if (this.socket) {
      this.socket.onopen = null;
      this.socket.onclose = null;
      this.socket.onmessage = null;
      this.socket.onerror = null;

      if (this.socket.readyState === WS_STATES.OPEN) {
        this.socket.close();
      }
    }

    try {
      this.socket = new WebSocket(WS_URL);

      this.socket.onopen = (event) => {
        this.reconnectAttempts = 0;
        this.startPingInterval();
        this._triggerHandlers("open", event);

        if (this.pendingSubscriptions.size > 0) {
          const tokens = Array.from(this.pendingSubscriptions);

          this.subscribe(tokens);
          this.pendingSubscriptions.clear();
        }
      };

      this.socket.onclose = (event) => {
        this.stopPingInterval();
        this._triggerHandlers("close", event);
        this._attemptReconnect();
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this._triggerHandlers("message", data);
        } catch (error) {}
      };

      this.socket.onerror = (error) => {
        this._triggerHandlers("error", error);
      };
    } catch (error) {
      this._triggerHandlers("error", error);
      this._attemptReconnect();
    }
  }

  /**
   * Close the WebSocket connection
   */
  disconnect() {
    if (!this.socket) return;
  
    this.stopPingInterval();
    clearTimeout(this.reconnectTimeout);
    
    // Close the socket if it's in an OPEN or CONNECTING state
    if (this.socket.readyState === WS_STATES.OPEN || 
        this.socket.readyState === WS_STATES.CONNECTING) {
      this.socket.close();
    }
  
    this.socket = null;
    this.pendingSubscriptions.clear();
    this.reconnectAttempts = 0; // Reset reconnect attempts
  }

  /**
   * Subscribe to option tokens
   * @param {Array<string>} tokens - Array of token IDs to subscribe to
   */
  subscribe(tokens) {
    if (!tokens || (Array.isArray(tokens) && tokens.length === 0)) {
      return;
    }

    const tokenArray = Array.isArray(tokens) ? tokens : [tokens];

    if (!this.isConnected()) {
      // Store these subscriptions for when we connect
      tokenArray.forEach((token) => this.pendingSubscriptions.add(token));
      return;
    }

    const message = {
      type: MESSAGE_TYPES.SUBSCRIBE,
      tokens: tokenArray,
    };

    this.send(message);
  }

  /**
   * Unsubscribe from option tokens
   * @param {Array<string>} tokens 
   */
  unsubscribe(tokens) {
    if (!tokens) return;

    const tokenArray = Array.isArray(tokens) ? tokens : [tokens];

    tokenArray.forEach((token) => this.pendingSubscriptions.delete(token));

    if (!this.isConnected()) {
      return;
    }

    const message = {
      type: MESSAGE_TYPES.UNSUBSCRIBE,
      tokens: tokenArray,
    };

    this.send(message);
  }

  /**
   * Send a message to the WebSocket server
   * @param {Object} message - Message to send
   */
  send(message) {
    if (!this.isConnected()) {
      return false;
    }

    try {
      const messageStr = JSON.stringify(message);
      this.socket.send(messageStr);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if the WebSocket is connected
   * @returns {boolean} True if connected, false otherwise
   */
  isConnected() {
    return this.socket && this.socket.readyState === WS_STATES.OPEN;
  }

  /**
   * Get the current WebSocket state
   * @returns {number} WebSocket state
   */
  getState() {
    return this.socket ? this.socket.readyState : WS_STATES.CLOSED;
  }

  /**
   * Start the ping interval to keep the connection alive
   */
  startPingInterval() {
    this.stopPingInterval();
    this.pingInterval = setInterval(() => {
      if (this.isConnected()) {
        this.send({ type: MESSAGE_TYPES.PING, timestamp: Date.now() });
      } else {
       
        this.stopPingInterval();
      }
    }, 30000); // Send ping every 30 seconds
  }

  /**
   * Stop the ping interval
   */
  stopPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Add an event handler
   * @param {string} event - Event type (open, close, message, error, reconnect)
   * @param {Function} handler - Handler function
   */
  on(event, handler) {
    if (this.handlers[event]) {
      this.handlers[event].push(handler);
    }
  }

  /**
   * Remove an event handler
   * @param {string} event - Event type
   * @param {Function} handler - Handler function to remove
   */
  off(event, handler) {
    if (this.handlers[event]) {
      this.handlers[event] = this.handlers[event].filter((h) => h !== handler);
    }
  }

  /**
   * Attempt to reconnect to the WebSocket server
   * @private
   */
  _attemptReconnect() {
    clearTimeout(this.reconnectTimeout);

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this._triggerHandlers("reconnect", {
        success: false,
        attempt: this.reconnectAttempts,
        maxAttempts: this.maxReconnectAttempts,
      });
      return;
    }

    const delay = this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts);

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      this._triggerHandlers("reconnect", {
        attempt: this.reconnectAttempts,
        maxAttempts: this.maxReconnectAttempts,
      });
      this.connect();
    }, delay);
  }

  /**
   * Trigger all handlers for an event
   * @param {string} event - Event type
   * @param {*} data - Event data
   * @private
   */
  _triggerHandlers(event, data) {
    if (this.handlers[event]) {
      this.handlers[event].forEach((handler) => {
        try {
          handler(data);
        } catch (error) {}
      });
    }
  }
}

// Create a singleton instance
const websocketService =
  typeof window !== "undefined" ? new WebSocketService() : null;

export default websocketService;
