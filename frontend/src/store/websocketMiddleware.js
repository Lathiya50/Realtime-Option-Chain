
import websocketService, { MESSAGE_TYPES, WS_STATES } from "../lib/websocket";
import {
  setConnectionState,
  updateMarketData,
  setFullMarketData,
  setError,
} from "./optionChainStore";

const websocketMiddleware = (store) => {
  let isInitialized = false;

  return (next) => (action) => {
    const { dispatch } = store;


    if (!isInitialized) {
      isInitialized = true;

      
      websocketService.on("open", () => {
        dispatch(setConnectionState(WS_STATES.OPEN));

      
        const { subscriptions } = store.getState().optionChain;
        if (subscriptions.length > 0) {
          websocketService.subscribe(subscriptions);
        }
      });

      
      websocketService.on("close", () => {
        dispatch(setConnectionState(WS_STATES.CLOSED));
      });

      
      websocketService.on("message", (message) => {
        switch (message.type) {
          case MESSAGE_TYPES.MARKET_DATA:
            handleMarketData(message, dispatch);
            break;
          case MESSAGE_TYPES.ERROR:
            dispatch(setError(message.error || "Unknown WebSocket error"));
            break;
          default:
            break;
        }
      });

      websocketService.on("error", (error) => {
        dispatch(setError(error.message || "WebSocket error"));
      });
    }

    if (action.type === "optionChain/connectWebSocket") {
      websocketService.connect();
    } else if (action.type === "optionChain/disconnectWebSocket") {
      websocketService.disconnect();
    } else if (action.type === "optionChain/subscribeTokens") {
      websocketService.subscribe(action.payload);
    } else if (action.type === "optionChain/unsubscribeTokens") {
      websocketService.unsubscribe(action.payload);
    }

    return next(action);
  };

  // Handle market data updates
  function handleMarketData(message, dispatch) {
    if (!message || !message.data) return;

    const updates = message.data;
    const isFullState = message.isFullState || false;

    if (isFullState) {
      // Handle full market state dump
      const marketData = {};
      updates.forEach((update) => {
        const { token, data } = update;
        if (token) {
          marketData[token] = {
            ...data,
            lastUpdated: new Date().toISOString(),
          };
        }
      });

      dispatch(setFullMarketData(marketData));
    } else {
      // Handle incremental updates
      updates.forEach((update) => {
        const { token, data } = update;
        if (token) {
          dispatch(updateMarketData({ token, data }));
        }
      });
    }
  }
};

export default websocketMiddleware;
