const mongoose = require("mongoose");

const UnderlyingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
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
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Calculate percent change before saving
UnderlyingSchema.pre("save", function (next) {
  if (this.isModified("currentPrice")) {
    this.percentChange =
      ((this.currentPrice - this.yesterdayPrice) / this.yesterdayPrice) * 100;
    this.percentChange = parseFloat(this.percentChange.toFixed(2));
    this.updatedAt = Date.now();
  }
  next();
});

module.exports = mongoose.model("Underlying", UnderlyingSchema);
