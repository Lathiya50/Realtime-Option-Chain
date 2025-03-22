import { useState, useEffect, useCallback } from "react";
import websocketService, { WS_STATES, MESSAGE_TYPES } from "../lib/websocket";

/**
 * Custom hook for managing WebSocket connections
 * @returns {Object} WebSocket state and functions
 */
export default function useWebSocket() {
  const [connectionState, setConnectionState] = useState(WS_STATES.CLOSED);
  const [isConnecting, setIsConnecting] = useState(false);
  const [subscriptions, setSubscriptions] = useState(new Set());
  const [lastMessage, setLastMessage] = useState(null);
  const [marketData, setMarketData] = useState({});
  const [error, setError] = useState(null);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);

  // Connect to WebSocket
  const connect = useCallback(() => {
    setIsConnecting(true);
    setError(null);
    websocketService.connect();
  }, []);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    websocketService.disconnect();
    setIsConnecting(false);
    setConnectionState(WS_STATES.CLOSED);
    setSubscriptions(new Set());
    setMarketData({});

  }, []);

  // Subscribe to tokens
  const subscribe = useCallback((tokens) => {
    if (!tokens || (Array.isArray(tokens) && tokens.length === 0)) {
      return;
    }

    const tokenArray = Array.isArray(tokens) ? tokens : [tokens];

        if (websocketService.isConnected()) {
      websocketService.subscribe(tokenArray);

      setSubscriptions((prev) => {
        const newSet = new Set(prev);
        tokenArray.forEach((token) => newSet.add(token));
        return newSet;
      });
    } else {
      setSubscriptions((prev) => {
        const newSet = new Set(prev);
        tokenArray.forEach((token) => newSet.add(token));
        return newSet;
      });
    }
  }, []);

  // Unsubscribe from tokens
  const unsubscribe = useCallback((tokens) => {
    if (!tokens) return;
    const tokenArray = Array.isArray(tokens) ? tokens : [tokens];

    if (websocketService.isConnected()) {
      websocketService.unsubscribe(tokenArray);
    }

    setSubscriptions((prev) => {
      const newSet = new Set(prev);
      tokenArray.forEach((token) => newSet.delete(token));
      return newSet;
    });
  }, []);

  // Send ping to keep connection alive
  const sendPing = useCallback(() => {
    if (websocketService.isConnected()) {
      websocketService.send({
        type: MESSAGE_TYPES.PING,
        timestamp: Date.now(),
      });
    }
  }, []);

  // Handle market data updates
  const handleMarketData = useCallback((data) => {
    if (!data || !data.data) return;

    const updates = data.data;
    const isFullState = data.isFullState || false;

    setMarketData((prevData) => {
      const newData = isFullState ? {} : { ...prevData };

      updates.forEach((update) => {
        const { token, type, data: itemData } = update;

        if (token && (type === "option" || type === "underlying")) {
          newData[token] = {
            ...newData[token],
            ...itemData,
            lastUpdated: new Date(),
          };
        } else if (token) {
          // Simple update without type (real-time updates)
          if (prevData[token] || isFullState) {
            newData[token] = {
              ...(newData[token] || {}),
              ...update,
              lastUpdated: new Date(),
            };
          }
        }
      });

      return newData;
    });
  }, []);

  // Set up WebSocket event handlers
  useEffect(() => {
    // Connection opened
    const handleOpen = () => {
      setConnectionState(WS_STATES.OPEN);
      setIsConnecting(false);
      setError(null);
      setReconnectAttempt(0);

      // Re-subscribe to tokens if any
      if (subscriptions.size > 0) {
        websocketService.subscribe(Array.from(subscriptions));
      }
    };

    // Connection closed
    const handleClose = (event) => {
      setConnectionState(WS_STATES.CLOSED);
      setIsConnecting(false);
    };

    // Message received
    const handleMessage = (message) => {
      setLastMessage(message);

      switch (message.type) {
        case MESSAGE_TYPES.MARKET_DATA:
          handleMarketData(message);
          break;
        case MESSAGE_TYPES.ERROR:
          setError(message.error || "Unknown error from server");
          break;
        case MESSAGE_TYPES.CONNECTION_STATUS:
          // Handle connection status updates

          break;
        case MESSAGE_TYPES.PONG:
          // Received pong response

          break;
        default:
          break;
      }
    };

    // Error occurred
    const handleError = (err) => {
      setError(err.message || "WebSocket error occurred");
      setIsConnecting(false);
    };

    // Reconnect attempt
    const handleReconnect = (data) => {
      setReconnectAttempt(data.attempt || 0);
    };

    // Register event handlers
    websocketService.on("open", handleOpen);
    websocketService.on("close", handleClose);
    websocketService.on("message", handleMessage);
    websocketService.on("error", handleError);
    websocketService.on("reconnect", handleReconnect);

    // Update initial connection state
    setConnectionState(websocketService.getState());

    // Clean up event handlers
    return () => {
      websocketService.off("open", handleOpen);
      websocketService.off("close", handleClose);
      websocketService.off("message", handleMessage);
      websocketService.off("error", handleError);
      websocketService.off("reconnect", handleReconnect);
    };
  }, [handleMarketData, subscriptions]);

  return {
    connectionState,
    isConnected: connectionState === WS_STATES.OPEN,
    isConnecting,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    sendPing,
    subscriptions: Array.from(subscriptions),
    lastMessage,
    marketData,
    error,
    reconnectAttempt,
    WS_STATES,
  };
}
