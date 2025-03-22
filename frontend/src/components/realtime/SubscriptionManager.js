import React, { useState, useEffect, useMemo } from "react";
import { PlusCircle, MinusCircle } from "lucide-react";
import { fetchStrikes } from "../../lib/api";

const SubscriptionManager = ({
  isConnected,
  subscribe,
  unsubscribe,
  marketData,
}) => {
  const [tokens, setTokens] = useState(["underlying"]);
  const [inputToken, setInputToken] = useState("");
  const [error, setError] = useState(null);
  const [availableTokens, setAvailableTokens] = useState([]);
  const [loading, setLoading] = useState(false);

  const matchToken = useMemo(() => {
    return availableTokens.filter((obj) => tokens.includes(obj.token));
  }, [tokens, availableTokens]);

  // Fetch available tokens
  useEffect(() => {
    const fetchAvailableTokens = async () => {
      try {
        setLoading(true);
        setError(null);
        const strikes = await fetchStrikes();

        setAvailableTokens(["underlying", ...strikes]);
      } catch (err) {
        setError(err.message || "Failed to load available tokens");
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableTokens();
  }, []);

  // Check if token exists in marketData
  const isSubscribed = (token) => {
    return marketData && Object.keys(marketData).includes(token);
  };

  // Add token
  const addToken = () => {
    if (!inputToken || tokens.includes(inputToken)) return;

    const newTokens = [...tokens, inputToken];
    setTokens(newTokens);
    setInputToken("");
    // Subscribe to new token if connected
    if (isConnected) {
      subscribe(inputToken);
    }
  };
    
  // Remove token
  const removeToken = (token) => {
    const newTokens = tokens.filter((t) => t!== token);
    setTokens(newTokens);

    // Unsubscribe from token if connected
    if (isConnected) {
      unsubscribe(token);
    }
  };

  const handleInputChange = (e) => {
    setInputToken(e.target.value);
    setError(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!availableTokens.some((obj) => obj.token === inputToken)) {
      setError("Invalid token. Please select from available options.");
      setTimeout(() => setError(null), 5000);
      return;
    }
    addToken();
  };
  return (
    <div className="mt-4 p-4 border rounded-lg bg-gray-800 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Market Data Subscriptions</h2>

      {loading ? (
        <div className="text-gray-600">Loading available tokens...</div>
      ) : error ? (
        <div className="text-red-500 mb-4">{error}</div>
      ) : (
        <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
          <div className="relative flex-1">
            <select
              value={inputToken}
              onChange={handleInputChange}
              className="appearance-none w-full bg-gray-900 border border-gray-700 text-gray-200 py-2 px-3 pr-8 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!isConnected}
            >
              <option value="" className="text-gray-400">
                Select a token...
              </option>
              {availableTokens.map((item) => (
                <option
                  key={item.token}
                  value={item.token}
                  className="bg-gray-900 text-gray-200 hover:bg-gray-800"
                >
                  {item.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            disabled={!inputToken || !isConnected}
          >
            <PlusCircle className="w-5 h-5" />
          </button>
        </form>
      )}

      <div className="space-y-2">
        {matchToken.map((item) => (
          <div
            key={item.token}
            className="flex items-center justify-between p-2 border rounded"
          >
            <span
              className={
                isSubscribed(item.token) ? "text-green-600" : "text-gray-600"
              }
            >
              {item.label}
            </span>
            <button
              onClick={() => removeToken(item.token)}
              className="text-red-500 hover:text-red-600"
            >
              <MinusCircle className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionManager;
