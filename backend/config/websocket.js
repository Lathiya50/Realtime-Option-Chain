const { WebSocketServer } = require("ws");
const logger = require("../middleware/logger");

// Initialize WebSocket server
const initWebSocketServer = (server) => {
  const wss = new WebSocketServer({ server });

  logger.info(`WebSocket server initialized`);

  return wss;
};

module.exports = {
  initWebSocketServer,
};
