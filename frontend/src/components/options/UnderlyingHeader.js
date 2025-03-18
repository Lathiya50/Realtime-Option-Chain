"use client";

import { useMemo } from "react";
import { PRICE_CHANGE_COLORS } from "../../lib/constants";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  BarChart2,
  History,
  ChevronRight,
} from "lucide-react";

export default function UnderlyingHeader({ underlying }) {
  if (!underlying) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-lg animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-32"></div>
      </div>
    );
  }

  // Calculate price change
  const priceChange = underlying.currentPrice - underlying.yesterdayPrice;

  const formattedTime = new Date(underlying.lastUpdated).toLocaleTimeString();
  const formattedDate = new Date(underlying.lastUpdated).toLocaleDateString();

  const calculatePercentChange = (currentPrice = 0, previousPrice = 0) => {
    if (previousPrice === 0) return 0;
    const percentChange =
      ((currentPrice - previousPrice) / previousPrice) * 100;
    return parseFloat(percentChange.toFixed(2));
  };

  const updatedPrice = calculatePercentChange(
    underlying.currentPrice,
    underlying.yesterdayPrice
  );
  const changeColor = !updatedPrice
    ? PRICE_CHANGE_COLORS.NEUTRAL
    : updatedPrice > 0
    ? PRICE_CHANGE_COLORS.POSITIVE
    : PRICE_CHANGE_COLORS.NEGATIVE;

  return (
    <div className="p-6 bg-white rounded-xl shadow-md transition-all duration-300 hover:shadow-lg border border-gray-100">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Symbol and Time Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <BarChart2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-gray-800">
                {underlying.name}
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{formattedTime}</span>
                <ChevronRight className="w-3 h-3" />
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Current Price Section */}
        <div className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-xl">
          <p className="text-4xl font-bold tracking-tighter text-gray-800">
            ₹
            {underlying.currentPrice?.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
            })}
          </p>
          <div className={`flex items-center gap-2 mt-2 ${changeColor}`}>
            <span className="text-lg font-medium">
              ₹{priceChange.toFixed(2)}
            </span>
            <span className="text-lg font-medium">
              ({updatedPrice}
              %)
            </span>
            {underlying.percentChange > 0 ? (
              <TrendingUp className="w-5 h-5" />
            ) : (
              <TrendingDown className="w-5 h-5" />
            )}
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <History className="w-4 h-4" />
              <p>Previous Close</p>
            </div>
            <p className="mt-1 text-lg font-semibold text-gray-800">
              ₹
              {underlying.previousPrice?.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <History className="w-4 h-4" />
              <p>Yesterday</p>
            </div>
            <p className="mt-1 text-lg font-semibold text-gray-800">
              ₹
              {underlying.yesterdayPrice?.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
