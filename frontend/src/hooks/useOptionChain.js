import { useState, useEffect, useCallback, useMemo } from "react";
import { fetchOptionChain } from "../lib/api";
import useWebSocket from "./useWebSocket";
import { OPTION_TYPES, DEFAULT_CONFIG } from "../lib/constants";

/**
 * Custom hook for managing Option Chain data
 * @param {Object} config - Configuration options
 * @returns {Object} Option chain data and functions
 */
export default function useOptionChain(config = {}) {
  // Merge default config with provided config
  const options = { ...DEFAULT_CONFIG, ...config };

  // State for option chain data
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [optionChain, setOptionChain] = useState(null);
  const [underlying, setUnderlying] = useState(null);
  const [strikes, setStrikes] = useState([]);
  const [visibleStrikes, setVisibleStrikes] = useState([]);
  const [atmStrike, setAtmStrike] = useState(null);

  // Get WebSocket functionality
  const { isConnected, connect, subscribe, marketData } = useWebSocket();

  // Find the At The Money strike (closest to underlying price)
  const findAtmStrike = useCallback((strikes, underlyingPrice) => {
    if (!strikes.length || !underlyingPrice) return null;

    return strikes.reduce((closest, strike) => {
      return Math.abs(strike - underlyingPrice) <
        Math.abs(closest - underlyingPrice)
        ? strike
        : closest;
    });
  }, []);
  // Get visible strikes centered around ATM strike
  const getVisibleStrikes = useCallback(
    (allStrikes, atmStrike, displayCount) => {
      if (!allStrikes.length || !atmStrike) return [];

      const atmIndex = allStrikes.indexOf(atmStrike);
      if (atmIndex === -1) return allStrikes.slice(0, displayCount);

      const halfDisplay = Math.floor(displayCount / 2);

      let startIndex = atmIndex - halfDisplay;
      if (startIndex < 0) startIndex = 0;

      let endIndex = startIndex + displayCount;
      if (endIndex > allStrikes.length) {
        endIndex = allStrikes.length;
        startIndex = Math.max(0, endIndex - displayCount);
      }

      return allStrikes.slice(startIndex, endIndex);
    },
    []
  );
  // Load initial option chain data
  const loadOptionChain = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await fetchOptionChain();

      // Set underlying data
      setUnderlying(data.underlying);

      // Process options data
      const processedOptions = {};
      const allStrikes = new Set();

      data.options.forEach((option) => {
        // Add strike to set
        allStrikes.add(option.strike);

        // Group options by strike and type
        if (!processedOptions[option.strike]) {
          processedOptions[option.strike] = {};
        }

        processedOptions[option.strike][option.optionType] = option;
      });

      // Sort strikes
      const sortedStrikes = Array.from(allStrikes).sort((a, b) => a - b);
      setStrikes(sortedStrikes);

      // Find ATM strike (closest to underlying price)
      const atm = findAtmStrike(sortedStrikes, data.underlying.currentPrice);
      setAtmStrike(atm);

      // Set visible strikes (centered around ATM strike)
      const visibleStrikes = getVisibleStrikes(
        sortedStrikes,
        atm,
        options.displayStrikes
      );
      setVisibleStrikes(visibleStrikes);

      // Set option chain data
      setOptionChain(processedOptions);
      setIsLoading(false);

      // Connect to WebSocket if not already connected
      if (!isConnected) {
        connect();
      }

      // Subscribe to underlying and all options
      const tokens = [data.underlying.token];
      data.options.forEach((option) => tokens.push(option.token));
      subscribe(tokens);
    } catch (err) {
      setError(err.message || "Failed to load option chain");
      setIsLoading(false);
    }
  }, [
    isConnected,
    connect,
    subscribe,
    options.displayStrikes,
    findAtmStrike,
    getVisibleStrikes,
  ]);

  // Update option chain with WebSocket data
  useEffect(() => {
    if (!optionChain || !Object.keys(marketData).length) return;

    let updatedUnderlying = underlying;
    let updatedOptionChain = { ...optionChain };
    let needsUpdate = false;

    // Process each market data update
    Object.entries(marketData).forEach(([token, data]) => {
      // Update underlying
      if (underlying && token === underlying.token) {
        updatedUnderlying = { ...underlying, ...data };
        needsUpdate = true;
      }

      // Update options
      for (const strike in optionChain) {
        for (const type in optionChain[strike]) {
          const option = optionChain[strike][type];

          if (option && option.token === token) {
            updatedOptionChain[strike] = {
              ...updatedOptionChain[strike],
              [type]: { ...option, ...data },
            };
            needsUpdate = true;
          }
        }
      }
    });

    // Update state if needed
    if (needsUpdate) {
      // First update the option chain
      setOptionChain(updatedOptionChain);

      // Then handle underlying price changes separately
      if (updatedUnderlying !== underlying) {
        setUnderlying(updatedUnderlying);

        // Recalculate ATM strike if underlying price changed
        const newAtm = findAtmStrike(strikes, updatedUnderlying.currentPrice);
        if (newAtm !== atmStrike) {
          setAtmStrike(newAtm);

          // Update visible strikes
          const newVisibleStrikes = getVisibleStrikes(
            strikes,
            newAtm,
            options.displayStrikes
          );
          setVisibleStrikes(newVisibleStrikes);
        }
      }
    }
  }, [
    marketData,
    optionChain,
    underlying,
    strikes,
    atmStrike,
    findAtmStrike,
    getVisibleStrikes,
    options.displayStrikes,
  ]);

  // Load initial data
  useEffect(() => {
    loadOptionChain();
  }, [loadOptionChain]);

  // Format data for display
  const formattedData = useMemo(() => {
    if (!optionChain || !visibleStrikes.length) return [];

    return visibleStrikes.map((strike) => {
      const calls = optionChain[strike]?.[OPTION_TYPES.CALL] || null;
      const puts = optionChain[strike]?.[OPTION_TYPES.PUT] || null;

      return {
        strike,
        isATM: strike === atmStrike,
        calls,
        puts,
      };
    });
  }, [optionChain, visibleStrikes, atmStrike]);

  return {
    isLoading,
    error,
    underlying,
    optionChain: formattedData,
    visibleStrikes,
    atmStrike,
    allStrikes: strikes,
    refreshData: loadOptionChain,
  };
}
