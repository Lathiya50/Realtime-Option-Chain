const {
  STRIKE_DEPTH,
  STRIKE_GAP,
  UNDERLYING_BASE_VALUE,
  OPTION_TYPES,
} = require("../utils/constants");

const {
  generateToken,
  calculateOptionPrice,
  generateRandomPrice,
  getMoneyness,
} = require("../utils/helpers");

/**
 * Generate initial underlying asset data
 * @returns {Object} - The underlying asset data
 */
const generateUnderlyingData = () => {
  const yesterdayPrice = UNDERLYING_BASE_VALUE;
  const currentPrice = generateRandomPrice(yesterdayPrice, 2); // Lower deviation for initial price

  return {
    name: "NIFTY",
    token: generateToken(),
    yesterdayPrice,
    currentPrice,
    percentChange: ((currentPrice - yesterdayPrice) / yesterdayPrice) * 100,
  };
};

/**
 * Generate strikes centered around the underlying price
 * @param {number} underlyingPrice - The current price of the underlying asset
 * @returns {Array<number>} - Array of strike prices
 */
const generateStrikes = (underlyingPrice) => {
  const strikes = [];

  // Round underlying price to nearest strike interval
  const centerStrike = Math.round(underlyingPrice / STRIKE_GAP) * STRIKE_GAP;

  // Calculate how many strikes to include on each side
  const halfDepth = Math.floor(STRIKE_DEPTH / 2);

  // Generate strikes below center
  for (
    let i = centerStrike - halfDepth * STRIKE_GAP;
    i < centerStrike;
    i += STRIKE_GAP
  ) {
    strikes.push(i);
  }

  // Add center strike
  strikes.push(centerStrike);

  // Generate strikes above center
  for (
    let i = centerStrike + STRIKE_GAP;
    i <= centerStrike + halfDepth * STRIKE_GAP;
    i += STRIKE_GAP
  ) {
    strikes.push(i);
  }

  // Ensure we have exactly STRIKE_DEPTH strikes
  while (strikes.length > STRIKE_DEPTH) {
    strikes.pop();
  }

  return strikes;
};

/**
 * Generate option data for a given strike
 * @param {number} strike - The strike price
 * @param {string} optionType - "CALL" or "PUT"
 * @param {Object} underlyingData - The underlying asset data
 * @returns {Object} - The option data
 */
const generateOptionData = (strike, optionType, underlyingData) => {
  const yesterdayPrice = calculateOptionPrice(
    strike,
    underlyingData.yesterdayPrice,
    optionType
  );
  const currentPrice = calculateOptionPrice(
    strike,
    underlyingData.currentPrice,
    optionType
  );

  return {
    token: generateToken(),
    strike,
    optionType,
    underlyingToken: underlyingData.token,
    yesterdayPrice,
    currentPrice,
    percentChange: ((currentPrice - yesterdayPrice) / yesterdayPrice) * 100,
    moneyness: getMoneyness(strike, underlyingData.currentPrice, optionType),
  };
};

/**
 * Generate the complete option chain data
 * @returns {Object} - Complete option chain data
 */
const generateOptionChainData = () => {
  // Generate underlying data
  const underlyingData = generateUnderlyingData();

  // Generate strikes
  const strikes = generateStrikes(underlyingData.currentPrice);

  // Generate option data for each strike and type
  const options = [];

  strikes.forEach((strike) => {
    // Generate CALL option
    options.push(generateOptionData(strike, OPTION_TYPES.CALL, underlyingData));

    // Generate PUT option
    options.push(generateOptionData(strike, OPTION_TYPES.PUT, underlyingData));
  });

  return {
    underlying: underlyingData,
    options,
  };
};

/**
 * Generate random price updates for a subset of options
 * @param {Array} options - Array of all options
 * @param {number} updateCount - Number of options to update
 * @returns {Array} - Array of updated options
 */
const generateRandomUpdates = (options, updateCount = 10) => {
  const updatedOptions = [];
  const indices = new Set();

  // Randomly select option indices to update
  while (indices.size < Math.min(updateCount, options.length)) {
    const randomIndex = Math.floor(Math.random() * options.length);
    indices.add(randomIndex);
  }

  // Generate updates for selected options
  indices.forEach((index) => {
    const option = options[index];
    const updatedPrice = generateRandomPrice(option.currentPrice);

    updatedOptions.push({
      token: option.token,
      previousPrice: option.currentPrice,
      currentPrice: updatedPrice,
      percentChange:
        ((updatedPrice - option.yesterdayPrice) / option.yesterdayPrice) * 100,
    });
  });

  return updatedOptions;
};

/**
 * Generate an updated price for the underlying asset
 * @param {Object} underlying - Current underlying data
 * @returns {Object} - Updated underlying data
 */
const generateUnderlyingUpdate = (underlying) => {
  const updatedPrice = generateRandomPrice(underlying.currentPrice, 1); // Lower deviation for underlying

  return {
    token: underlying.token,
    previousPrice: underlying.currentPrice,
    currentPrice: updatedPrice,
    percentChange:
      ((updatedPrice - underlying.yesterdayPrice) / underlying.yesterdayPrice) *
      100,
  };
};

module.exports = {
  generateOptionChainData,
  generateRandomUpdates,
  generateUnderlyingUpdate,
};
