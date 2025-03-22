
import { createSlice, configureStore } from "@reduxjs/toolkit";
import websocketMiddleware from "./websocketMiddleware";


const initialState = {
  underlying: null,
  options: [],
  visibleStrikes: [],
  allStrikes: [],
  atmStrike: null,
  isLoading: false,
  error: null,
  marketData: {},
  subscriptions: [],
  connectionState: 0, // 0: CLOSED, 1: OPEN, 2: CLOSING, 3: CONNECTING
};

// Create the option chain slice
const optionChainSlice = createSlice({
  name: "optionChain",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setUnderlying: (state, action) => {
      state.underlying = action.payload;
    },
    setOptions: (state, action) => {
      state.options = action.payload;
    },
    setVisibleStrikes: (state, action) => {
      state.visibleStrikes = action.payload;
    },
    setAllStrikes: (state, action) => {
      state.allStrikes = action.payload;
    },
    setAtmStrike: (state, action) => {
      state.atmStrike = action.payload;
    },
    updateMarketData: (state, action) => {
      const { token, data } = action.payload;
      state.marketData[token] = {
        ...state.marketData[token],
        ...data,
        lastUpdated: new Date().toISOString(),
      };
    },
    setFullMarketData: (state, action) => {
      state.marketData = action.payload;
    },
    addSubscription: (state, action) => {
      if (!state.subscriptions.includes(action.payload)) {
        state.subscriptions.push(action.payload);
      }
    },
    removeSubscription: (state, action) => {
      state.subscriptions = state.subscriptions.filter(
        (token) => token !== action.payload
      );
    },
    setConnectionState: (state, action) => {
      state.connectionState = action.payload;
    },
    resetState: (state) => {
      return initialState;
    },
    connectWebSocket: () => {}, 
    disconnectWebSocket: () => {}, 
    subscribeTokens: () => {}, 
    unsubscribeTokens: () => {}, 
  },
});

// Export actions
export const {
  setLoading,
  setError,
  setUnderlying,
  setOptions,
  setVisibleStrikes,
  setAllStrikes,
  setAtmStrike,
  updateMarketData,
  setFullMarketData,
  addSubscription,
  removeSubscription,
  setConnectionState,
  resetState,
  connectWebSocket,
  disconnectWebSocket,
  subscribeTokens,
  unsubscribeTokens,
} = optionChainSlice.actions;

// Configure the Redux store
export const store = configureStore({
  reducer: {
    optionChain: optionChainSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        
        ignoredActions: ["optionChain/updateMarketData"],
        
        ignoredActionPaths: ["payload.lastUpdated"],
        
        ignoredPaths: ["optionChain.marketData"],
      },
    }).concat(websocketMiddleware),
});

export default store;
