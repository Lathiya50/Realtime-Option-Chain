const Option = require("../models/Option");
const Underlying = require("../models/Underlying");
const { generateOptionChainData } = require("../services/dataGeneratorService");
const logger = require("../middleware/logger");
const { OPTION_TYPES } = require("../utils/constants");

/**
 * Get the option chain data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getOptionChain = async (req, res, next) => {
  try {
    // Check if we have data already
    const existingUnderlying = await Underlying.findOne();

    // If no data exists, initialize the option chain
    if (!existingUnderlying) {
      await initializeOptionChain();
    }

    // Get the underlying data
    const underlying = await Underlying.findOne();
    if (!underlying) {
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve underlying data",
      });
    }

    // Get all options sorted by strike and type
    const options = await Option.find().sort({ strike: 1, optionType: 1 });

    // Format the response
    const response = {
      success: true,
      data: {
        underlying: {
          token: underlying.token,
          name: underlying.name,
          currentPrice: underlying.currentPrice,
          yesterdayPrice: underlying.yesterdayPrice,
          percentChange: underlying.percentChange,
        },
        options: options.map((option) => ({
          token: option.token,
          strike: option.strike,
          optionType: option.optionType,
          currentPrice: option.currentPrice,
          yesterdayPrice: option.yesterdayPrice,
          percentChange: option.percentChange,
          moneyness: option.moneyness,
        })),
      },
    };

    res.json(response);
  } catch (error) {
    logger.error(`Error retrieving option chain: ${error.message}`);
    next(error);
  }
};

/**
 * Get the strikes available in the option chain
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getStrikes = async (req, res, next) => {
  try {
    // Get unique strikes
    // const strikes = await Option.distinct("token").sort();
    const strikes = await Option.find(
      {},
      { token: 1, strike: 1, optionType: 1, underlyingToken: 1, _id: 0 }
    )
      .sort({
        strike: 1,
      })
      .lean();
    if (strikes.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No strikes found",
        data: {
          strikes: [],
        },
      });
    }
    const newStrikes = strikes?.map((strike) => {
      return {
        ...strike,
        label: `${strike.optionType}_${strike.strike}`,
      };
    });
    res.json({
      success: true,
      data: {
        strikes: newStrikes,
      },
    });
  } catch (error) {
    logger.error(`Error retrieving strikes: ${error.message}`);
    next(error);
  }
};

/**
 * Get options for a specific strike
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getOptionsByStrike = async (req, res, next) => {
  try {
    const { strike } = req.params;

    if (!strike || isNaN(strike)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid strike price" });
    }

    // Get options for the strike
    const options = await Option.find({ strike: Number(strike) });

    res.json({
      success: true,
      data: {
        strike: Number(strike),
        options: options.map((option) => ({
          token: option.token,
          optionType: option.optionType,
          currentPrice: option.currentPrice,
          yesterdayPrice: option.yesterdayPrice,
          percentChange: option.percentChange,
          moneyness: option.moneyness,
        })),
      },
    });
  } catch (error) {
    logger.error(`Error retrieving options by strike: ${error.message}`);
    next(error);
  }
};

/**
 * Initialize the option chain data in the database
 */
const initializeOptionChain = async () => {
  try {
    logger.info("Initializing option chain data");

    // Generate option chain data
    const { underlying, options } = generateOptionChainData();

    // Save underlying data
    await Underlying.create(underlying);

    // Save options data
    await Option.insertMany(options);

    logger.info(
      `Option chain initialized with 1 underlying and ${options.length} options`
    );

    return { underlying, options };
  } catch (error) {
    logger.error(`Error initializing option chain: ${error.message}`);
    throw error;
  }
};

/**
 * Reset the option chain data (for testing/development)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const resetOptionChain = async (req, res, next) => {
  try {
    // Only allow in development environment
    if (process.env.NODE_ENV !== "development") {
      return res.status(403).json({
        success: false,
        message: "This endpoint is only available in development mode",
      });
    }

    // Delete all existing data
    await Option.deleteMany({});
    await Underlying.deleteMany({});

    // Re-initialize the option chain
    const { underlying, options } = await initializeOptionChain();

    res.json({
      success: true,
      message: "Option chain reset successfully",
      data: {
        underlyingCount: 1,
        optionsCount: options.length,
      },
    });
  } catch (error) {
    logger.error(`Error resetting option chain: ${error.message}`);
    next(error);
  }
};

module.exports = {
  getOptionChain,
  getStrikes,
  getOptionsByStrike,
  resetOptionChain,
  initializeOptionChain,
};
