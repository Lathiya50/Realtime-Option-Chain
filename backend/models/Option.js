const mongoose = require('mongoose');
const { getMoneyness } = require('../utils/helpers');

const OptionSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  strike: {
    type: Number,
    required: true,
  },
  optionType: {
    type: String,
    enum: ['CALL', 'PUT'],
    required: true,
  },
  underlyingToken: {
    type: String,
    required: true,
  },
  yesterdayPrice: {
    type: Number,
    required: true,
  },
  currentPrice: {
    type: Number,
    required: true,
  },
  percentChange: {
    type: Number,
    default: 0,
  },
  moneyness: {
    type: String,
    enum: ['ITM', 'ATM', 'OTM'],
    default: 'OTM',
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

// Calculate percent change before saving
OptionSchema.pre('save', function(next) {
  if (this.isModified('currentPrice')) {
    this.percentChange = ((this.currentPrice - this.yesterdayPrice) / this.yesterdayPrice) * 100;
    this.percentChange = parseFloat(this.percentChange.toFixed(2));
    this.updatedAt = Date.now();
  }
  next();
});

// Method to update moneyness
OptionSchema.methods.updateMoneyness = function(underlyingPrice) {
  this.moneyness = getMoneyness(this.strike, underlyingPrice, this.optionType);
  return this.moneyness;
};

module.exports = mongoose.model('Option', OptionSchema);