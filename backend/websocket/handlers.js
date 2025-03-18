const WebSocketManager = require("./manager");
const logger = require("../middleware/logger");

let wsManager = null;

/**
 * Initialize the WebSocket manager with the given server
 * @param {WebSocketServer} wss - The WebSocket server instance
 */
const initWebSocketManager = (wss) => {
  if (!wsManager) {
    wsManager = new WebSocketManager(wss);
    logger.info("WebSocket manager initialized");
  }
  return wsManager;
};

/**
 * Get the WebSocket manager instance
 * @returns {WebSocketManager} - The WebSocket manager instance
 */
const getWebSocketManager = () => {
  if (!wsManager) {
    throw new Error("WebSocket manager not initialized");
  }
  return wsManager;
};

module.exports = {
  initWebSocketManager,
  getWebSocketManager,
};
