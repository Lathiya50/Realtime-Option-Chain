const { v4: uuidv4 } = require("uuid");
const { MAX_PRICE_DEVIATION, UNDERLYING_BASE_VALUE } = require("./constants");

/**
 * Generate a unique token
 * @returns {string} - A UUID string
 */
const generateToken = () => {
  return uuidv4();
};

/**
 * Calculate the option price based on strike and underlying price
 * This is a simplified model - in real applications, this would use Black-Scholes or other option pricing models
 *
 * @param {number} strike - The strike price of the option
 * @param {number} underlyingPrice - The price of the underlying asset
 * @param {string} optionType - "CALL" or "PUT"
 * @returns {number} - The calculated option price
 */
const calculateOptionPrice = (strike, underlyingPrice, optionType) => {
  if (optionType === "CALL") {
    // For call options: max(0, underlyingPrice - strike)
    const intrinsicValue = Math.max(0, underlyingPrice - strike);
    // Add a time value component (simplified)
    const timeValue = Math.sqrt(Math.abs(underlyingPrice - strike)) * 2;
    return parseFloat((intrinsicValue + timeValue).toFixed(2));
  } else {
    // For put options: max(0, strike - underlyingPrice)
    const intrinsicValue = Math.max(0, strike - underlyingPrice);
    // Add a time value component (simplified)
    const timeValue = Math.sqrt(Math.abs(underlyingPrice - strike)) * 2;
    return parseFloat((intrinsicValue + timeValue).toFixed(2));
  }
};

/**
 * Generate a random price change within a defined percentage range
 *
 * @param {number} basePrice - The base price to calculate deviation from
 * @param {number} maxDeviation - Maximum percentage deviation allowed
 * @returns {number} - The new price after applying random deviation
 */
const generateRandomPrice = (basePrice, maxDeviation = MAX_PRICE_DEVIATION) => {
  // Generate a random deviation between -maxDeviation and +maxDeviation percent
  const deviationPercent =
    (Math.random() * (maxDeviation * 2) - maxDeviation) / 100;

  // Apply the deviation to the base price
  const newPrice = basePrice * (1 + deviationPercent);

  // Return with 2 decimal places
  return parseFloat(newPrice.toFixed(2));
};

/**
 * Calculate percentage change between two prices
 *
 * @param {number} currentPrice - The current price
 * @param {number} previousPrice - The previous price
 * @returns {number} - The percentage change
 */
const calculatePercentChange = (currentPrice, previousPrice) => {
  if (previousPrice === 0) return 0;
  const percentChange = ((currentPrice - previousPrice) / previousPrice) * 100;
  return parseFloat(percentChange.toFixed(2));
};

/**
 * Determine if an option is in-the-money, at-the-money, or out-of-the-money
 *
 * @param {number} strike - The strike price of the option
 * @param {number} underlyingPrice - The current price of the underlying asset
 * @param {string} optionType - "CALL" or "PUT"
 * @returns {string} - "ITM", "ATM", or "OTM"
 */
const getMoneyness = (strike, underlyingPrice, optionType) => {
  const threshold = 0.5; // threshold for at-the-money

  if (optionType === "CALL") {
    if (
      Math.abs(strike - underlyingPrice) <=
      threshold * (UNDERLYING_BASE_VALUE / 100)
    ) {
      return "ATM";
    } else if (strike < underlyingPrice) {
      return "ITM";
    } else {
      return "OTM";
    }
  } else {
    // PUT option
    if (
      Math.abs(strike - underlyingPrice) <=
      threshold * (UNDERLYING_BASE_VALUE / 100)
    ) {
      return "ATM";
    } else if (strike > underlyingPrice) {
      return "ITM";
    } else {
      return "OTM";
    }
  }
};

module.exports = {
  generateToken,
  calculateOptionPrice,
  generateRandomPrice,
  calculatePercentChange,
  getMoneyness,
};
