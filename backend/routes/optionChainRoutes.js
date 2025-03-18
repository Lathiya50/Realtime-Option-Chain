const express = require("express");
const {
  getOptionChain,
  getStrikes,
  getOptionsByStrike,
  resetOptionChain,
} = require("../controllers/optionChainController");

const router = express.Router();
  
// GET /api/option-chain - Get the full option chain data
router.get("/", getOptionChain);

// GET /api/option-chain/strikes - Get all available strikes
router.get("/strikes", getStrikes);

// GET /api/option-chain/strike/:strike - Get options for a specific strike
router.get("/strike/:strike", getOptionsByStrike);

// POST /api/option-chain/reset - Reset the option chain (dev only)
router.post("/reset", resetOptionChain);

module.exports = router;
