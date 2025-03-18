/**
 * Constants for the Option Chain application
 */

// Option types
export const OPTION_TYPES = {
  CALL: "CALL",
  PUT: "PUT",
};

// Moneyness types
export const MONEYNESS = {
  ITM: "ITM", // In The Money
  ATM: "ATM", // At The Money
  OTM: "OTM", // Out The Money
};

// Moneyness colors
export const MONEYNESS_COLORS = {
  ITM: "bg-blue-100 text-blue-800",
  ATM: "bg-purple-100 text-purple-800",
  OTM: "bg-gray-100 text-gray-800",
};

// Price change colors
export const PRICE_CHANGE_COLORS = {
  POSITIVE: "text-green-500",
  NEGATIVE: "text-red-500",
  NEUTRAL: "text-gray-500",
};

// Table columns
export const OPTION_CHAIN_COLUMNS = {
  CALLS: [
    { key: "currentPrice", label: "Price" },
    { key: "percentChange", label: "% Change" },
  ],
  STRIKE: [{ key: "strike", label: "Strike" }],
  PUTS: [
    { key: "currentPrice", label: "Price" },
    { key: "percentChange", label: "% Change" },
  ],
};

// WebSocket message types
export const WS_MESSAGE_TYPES = {
  SUBSCRIBE: "subscribe",
  UNSUBSCRIBE: "unsubscribe",
  MARKET_DATA: "marketData",
  CONNECTION_STATUS: "connectionStatus",
  PING: "ping",
  PONG: "pong",
  ERROR: "error",
};

// Default configuration
export const DEFAULT_CONFIG = {
  refreshInterval: 200, // ms
  strikeGap: 100, // Gap between strikes
  displayStrikes: 75, // Number of strikes to display
};
