const logger = require("../middleware/logger");
const {
  WS_STATES,
  MESSAGE_TYPES,
  UPDATE_INTERVAL,
} = require("../utils/constants");
const {
  generateRandomUpdates,
  generateUnderlyingUpdate,
} = require("../services/dataGeneratorService");
const Option = require("../models/Option");
const Underlying = require("../models/Underlying");

class WebSocketManager {
  constructor(wss) {
    this.wss = wss;
    this.clients = new Map(); // Map of clientId -> { client, subscriptions, lastPing }
    this.optionsCache = new Map(); // Cache of token -> option data
    this.underlyingCache = new Map(); // Cache of token -> underlying data
    this.updateInterval = null;

    this.setupServer();
    this.loadCacheData();
  }

  async loadCacheData() {
    try {
      // Load options data into cache
      const options = await Option.find({});
      options.forEach((option) => {
        this.optionsCache.set(option.token, {
          token: option.token,
          strike: option.strike,
          optionType: option.optionType,
          currentPrice: option.currentPrice,
          yesterdayPrice: option.yesterdayPrice,
          percentChange: option.percentChange,
          moneyness: option.moneyness,
          updatedAt: option.updatedAt,
        });
      });

      // Load underlying data into cache
      const underlyings = await Underlying.find({});
      underlyings.forEach((underlying) => {
        this.underlyingCache.set(underlying.token, {
          token: underlying.token,
          name: underlying.name,
          currentPrice: underlying.currentPrice,
          yesterdayPrice: underlying.yesterdayPrice,
          percentChange: underlying.percentChange,
          updatedAt: underlying.updatedAt,
        });
      });

      logger.info(
        `Cache loaded with ${this.optionsCache.size} options and ${this.underlyingCache.size} underlyings`
      );
    } catch (error) {
      logger.error(`Error loading cache data: ${error.message}`);
    }
  }

  setupServer() {
    this.wss.on("connection", (ws, req) => {
      const clientId =
        req.headers["sec-websocket-key"] || Date.now().toString();

      logger.info(`New WebSocket connection: ${clientId}`);

      // Initialize client data
      this.clients.set(clientId, {
        client: ws,
        subscriptions: new Set(),
        lastPing: Date.now(),
      });

      // Send connection status
      this.sendMessage(ws, {
        type: MESSAGE_TYPES.CONNECTION_STATUS,
        status: "connected",
        clientId,
      });

      // Handle incoming messages
      ws.on("message", (message) => this.handleMessage(clientId, message));

      // Handle connection close
      ws.on("close", () => this.handleClose(clientId));

      // Handle errors
      ws.on("error", (error) => {
        logger.error(
          `WebSocket error for client ${clientId}: ${error.message}`
        );
        this.clients.delete(clientId);
      });

      // Start data updates if this is the first client
      if (this.clients.size === 1) {
        this.startDataUpdates();
      }
    });

    // Set up interval for checking client connections
    setInterval(() => this.checkConnections(), 30000);
  }

  startDataUpdates() {
    if (this.updateInterval) return;

    logger.info(`Starting data updates every ${UPDATE_INTERVAL}ms`);

    this.updateInterval = setInterval(() => {
      this.broadcastDataUpdates();
    }, UPDATE_INTERVAL);
  }

  stopDataUpdates() {
    if (!this.updateInterval) return;

    logger.info("Stopping data updates");

    clearInterval(this.updateInterval);
    this.updateInterval = null;
  }

  async broadcastDataUpdates() {
    try {
      if (this.clients.size === 0) {
        this.stopDataUpdates();
        return;
      }

      // Get all option tokens
      const allOptions = Array.from(this.optionsCache.values());

      // Get the underlying data
      const underlying = Array.from(this.underlyingCache.values())[0];
      if (!underlying) return;

      // Generate underlying update
      const underlyingUpdate = generateUnderlyingUpdate(underlying);

      // Update the underlying cache
      underlying.currentPrice = underlyingUpdate.currentPrice;
      underlying.percentChange = underlyingUpdate.percentChange;
      underlying.updatedAt = new Date();

      // Update the underlying in DB
      await Underlying.findOneAndUpdate(
        { token: underlying.token },
        {
          currentPrice: underlying.currentPrice,
          percentChange: underlying.percentChange,
          updatedAt: underlying.updatedAt,
        }
      );

      // Generate random options updates (about 10% of options)
      const updateCount = Math.ceil(allOptions.length * 0.1);
      const optionUpdates = generateRandomUpdates(allOptions, updateCount);

      // Update the options cache and DB
      for (const update of optionUpdates) {
        const option = this.optionsCache.get(update.token);
        if (option) {
          option.currentPrice = update.currentPrice;
          option.percentChange = update.percentChange;
          option.updatedAt = new Date();

          // Update moneyness based on new underlying price
          option.moneyness = Option.schema.methods.updateMoneyness.call(
            option,
            underlying.currentPrice
          );

          // Update in DB
          await Option.findOneAndUpdate(
            { token: option.token },
            {
              currentPrice: option.currentPrice,
              percentChange: option.percentChange,
              moneyness: option.moneyness,
              updatedAt: option.updatedAt,
            }
          );
        }
      }

      // Broadcast updates to subscribed clients
      this.clients.forEach((clientData, clientId) => {
        if (clientData.client.readyState !== WS_STATES.OPEN) return;

        // Filter updates to only include subscribed tokens
        const subscribedOptions = optionUpdates.filter((update) =>
          clientData.subscriptions.has(update.token)
        );

        // Add underlying if subscribed
        const updates = [...subscribedOptions];
        if (clientData.subscriptions.has(underlying.token)) {
          updates.push(underlyingUpdate);
        }

        // Only send if there are updates for this client
        if (updates.length > 0) {
          this.sendMessage(clientData.client, {
            type: MESSAGE_TYPES.MARKET_DATA,
            data: updates,
          });
        }
      });
    } catch (error) {
      logger.error(`Error broadcasting data updates: ${error.message}`);
    }
  }

  handleMessage(clientId, message) {
    try {
      const clientData = this.clients.get(clientId);
      if (!clientData) return;

      const parsedMessage = JSON.parse(message);
      logger.debug(
        `Received message from client ${clientId}: ${JSON.stringify(
          parsedMessage
        )}`
      );

      // Update last ping time
      clientData.lastPing = Date.now();

      switch (parsedMessage.type) {
        case MESSAGE_TYPES.SUBSCRIBE:
          this.handleSubscribe(clientId, parsedMessage);
          break;

        case MESSAGE_TYPES.UNSUBSCRIBE:
          this.handleUnsubscribe(clientId, parsedMessage);
          break;

        case MESSAGE_TYPES.PING:
          this.handlePing(clientId);
          break;

        default:
          logger.warn(
            `Unknown message type from client ${clientId}: ${parsedMessage.type}`
          );
      }
    } catch (error) {
      logger.error(
        `Error handling message from client ${clientId}: ${error.message}`
      );
    }
  }

  handleSubscribe(clientId, message) {
    const clientData = this.clients.get(clientId);
    if (!clientData) return;

    const { tokens } = message;
    if (!Array.isArray(tokens)) {
      this.sendError(
        clientData.client,
        "Invalid tokens format, expected array"
      );
      return;
    }
    // Make sure subscriptions is initialized as a Set
    if (!clientData.subscriptions) {
      clientData.subscriptions = new Set();
    }
    // Add tokens to subscriptions
    tokens.forEach((token) => clientData.subscriptions.add(token));

    logger.info(
      `Client ${clientId} subscribed to ${tokens.length} tokens. Total subscriptions: ${clientData.subscriptions.size}`
    );

    // Send current state for subscribed tokens
    this.sendFullMarketState(clientId);
  }

  handleUnsubscribe(clientId, message) {
    const clientData = this.clients.get(clientId);
    if (!clientData) return;

    const { tokens } = message;
    if (!Array.isArray(tokens)) {
      this.sendError(
        clientData.client,
        "Invalid tokens format, expected array"
      );
      return;
    }

    // Remove tokens from subscriptions
    tokens.forEach((token) => clientData.subscriptions.delete(token));

    logger.info(`Client ${clientId} unsubscribed from ${tokens.length} tokens`);

    // Confirm unsubscribe
    this.sendMessage(clientData.client, {
      type: MESSAGE_TYPES.CONNECTION_STATUS,
      status: "unsubscribed",
      tokens,
    });
  }

  handlePing(clientId) {
    const clientData = this.clients.get(clientId);
    if (!clientData) return;

    // Send pong response
    this.sendMessage(clientData.client, {
      type: MESSAGE_TYPES.PONG,
      timestamp: Date.now(),
    });
  }

  handleClose(clientId) {
    logger.info(`WebSocket connection closed: ${clientId}`);
    this.clients.delete(clientId);

    // Stop updates if no clients left
    if (this.clients.size === 0) {
      this.stopDataUpdates();
    }
  }

  sendFullMarketState(clientId) {
    const clientData = this.clients.get(clientId);
    if (!clientData || clientData.client.readyState !== WS_STATES.OPEN) return;
    // Get data for all subscribed tokens
    const marketData = [];

    Array.from(clientData.subscriptions).forEach((token) => {
      // Check if token is an option
      if (this.optionsCache.has(token)) {
        const option = this.optionsCache.get(token);
        marketData.push({
          token,
          type: "option",
          data: option,
        });
      }

      // Check if token is underlying
      if (this.underlyingCache.has(token)) {
        const underlying = this.underlyingCache.get(token);
        marketData.push({
          token,
          type: "underlying",
          data: underlying,
        });
      }
    });

    // Send full market state
    this.sendMessage(clientData.client, {
      type: MESSAGE_TYPES.MARKET_DATA,
      data: marketData,
      isFullState: true,
    });
  }

  checkConnections() {
    const now = Date.now();
    const timeout = 60000; // 1 minute timeout

    this.clients.forEach((clientData, clientId) => {
      // Check if client has timed out
      if (now - clientData.lastPing > timeout) {
        logger.info(`Client ${clientId} timed out`);

        // Close connection
        if (clientData.client.readyState === WS_STATES.OPEN) {
          clientData.client.close();
        }

        this.clients.delete(clientId);
      }
    });
  }

  sendMessage(client, message) {
    if (client.readyState !== WS_STATES.OPEN) return;

    try {
      client.send(JSON.stringify(message));
    } catch (error) {
      logger.error(`Error sending message: ${error.message}`);
    }
  }

  sendError(client, errorMessage) {
    this.sendMessage(client, {
      type: MESSAGE_TYPES.ERROR,
      error: errorMessage,
    });
  }
}

module.exports = WebSocketManager;
