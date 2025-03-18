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
    const newTokens = tokens.filter((t) => t.token !== token);
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
          <select
            value={inputToken}
            onChange={handleInputChange}
            className="border rounded px-2 py-1 flex-1 bg-black"
          >
            <option value="">Select token...</option>
            {availableTokens.map((item) => (
              <option key={item.token} value={item.token}>
                {item.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
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
