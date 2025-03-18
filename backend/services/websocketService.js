const { getWebSocketManager } = require("../websocket/handlers");
const logger = require("../middleware/logger");

/**
 * Service for interacting with the WebSocket manager
 */
class WebSocketService {
  /**
   * Get the current WebSocket connection count
   * @returns {number} - Number of active connections
   */
  static getConnectionCount() {
    try {
      const manager = getWebSocketManager();
      return manager.clients.size;
    } catch (error) {
      logger.error(`Error getting connection count: ${error.message}`);
      return 0;
    }
  }

  /**
   * Get the number of subscriptions for a specific token
   * @param {string} token - The token to check
   * @returns {number} - Number of clients subscribed to this token
   */
  static getSubscriptionCount(token) {
    try {
      const manager = getWebSocketManager();
      let count = 0;

      manager.clients.forEach((clientData) => {
        if (clientData.subscriptions.has(token)) {
          count++;
        }
      });

      return count;
    } catch (error) {
      logger.error(`Error getting subscription count: ${error.message}`);
      return 0;
    }
  }

  /**
   * Broadcast a message to all connected clients
   * @param {Object} message - The message to broadcast
   */
  static broadcastMessage(message) {
    try {
      const manager = getWebSocketManager();

      manager.clients.forEach((clientData) => {
        manager.sendMessage(clientData.client, message);
      });

      logger.info(`Broadcast message sent to ${manager.clients.size} clients`);
    } catch (error) {
      logger.error(`Error broadcasting message: ${error.message}`);
    }
  }

  /**
   * Manually trigger a data update cycle
   * This is useful for testing or when significant changes need to be immediately propagated
   */
  static triggerDataUpdate() {
    try {
      const manager = getWebSocketManager();
      manager.broadcastDataUpdates();
      logger.info("Manual data update triggered");
    } catch (error) {
      logger.error(`Error triggering data update: ${error.message}`);
    }
  }
}

module.exports = WebSocketService;
