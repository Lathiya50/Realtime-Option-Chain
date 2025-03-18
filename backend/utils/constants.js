// WebSocket connection states
const WS_STATES = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
};

// WebSocket message types
const MESSAGE_TYPES = {
  SUBSCRIBE: "subscribe",
  UNSUBSCRIBE: "unsubscribe",
  MARKET_DATA: "marketData",
  PING: "ping",
  PONG: "pong",
  ERROR: "error",
  CONNECTION_STATUS: "connectionStatus",
};

// Option types
const OPTION_TYPES = {
  CALL: "CALL",
  PUT: "PUT",
};

// Constants for option chain
const STRIKE_GAP = parseInt(process.env.STRIKE_GAP) || 100;
const STRIKE_DEPTH = parseInt(process.env.STRIKE_DEPTH) || 75;
const UNDERLYING_BASE_VALUE =
  parseInt(process.env.UNDERLYING_BASE_VALUE) || 22500;
const UPDATE_INTERVAL = parseInt(process.env.UPDATE_INTERVAL) || 200;

// Maximum deviation for random price changes (in percentage)
const MAX_PRICE_DEVIATION = 5;

module.exports = {
  WS_STATES,
  MESSAGE_TYPES,
  OPTION_TYPES,
  STRIKE_GAP,
  STRIKE_DEPTH,
  UNDERLYING_BASE_VALUE,
  UPDATE_INTERVAL,
  MAX_PRICE_DEVIATION,
};
