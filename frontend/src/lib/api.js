/**
 * API utilities for the Option Chain application
 */

// Base API URL
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/**
 * Fetch option chain data from the API
 * @returns {Promise<Object>} Option chain data including underlying and options
 */
export const fetchOptionChain = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/option-chain`);

    if (!response.ok) {
      throw new Error(`Failed to fetch option chain: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch all available strikes
 * @returns {Promise<Array>} Array of available strike prices
 */
export const fetchStrikes = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/option-chain/strikes`);

    if (!response.ok) {
      throw new Error(`Failed to fetch strikes: ${response.status}`);
    }

    const data = await response.json();
    return data.data.strikes;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch options for a specific strike price
 * @param {number} strike - The strike price to fetch options for
 * @returns {Promise<Object>} Options data for the specified strike
 */
export const fetchOptionsByStrike = async (strike) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/option-chain/strike/${strike}`
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch options for strike ${strike}: ${response.status}`
      );
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Reset the option chain (development only)
 * @returns {Promise<Object>} Reset confirmation
 */
export const resetOptionChain = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/option-chain/reset`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`Failed to reset option chain: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Check API health
 * @returns {Promise<Object>} Health status
 */
export const checkApiHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);

    if (!response.ok) {
      throw new Error(`API health check failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};
