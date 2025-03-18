// components/options/OptionData.js
"use client";

import { OPTION_TYPES, PRICE_CHANGE_COLORS } from "../../lib/constants";

export default function OptionData({ option, type }) {
  if (!option) {
    return (
      <>
        <td className="py-2 px-3 text-gray-400">-</td>
        <td className="py-2 px-3 text-gray-400">-</td>
        <td className="py-2 px-3 text-gray-400">-</td>
        <td className="py-2 px-3 text-gray-400">-</td>
      </>
    );
  }

  const isCall = type === OPTION_TYPES.CALL;
  const alignment = isCall ? "text-left" : "text-right";

  // Determine color based on price change
  const changeColor = !option.percentChange
    ? PRICE_CHANGE_COLORS.NEUTRAL
    : option.percentChange > 0
    ? PRICE_CHANGE_COLORS.POSITIVE
    : PRICE_CHANGE_COLORS.NEGATIVE;

  return (
    <>
      <td className={`py-2 px-3 ${alignment} font-medium`}>
        {option.currentPrice?.toFixed(2) || "-"}
      </td>
      <td className={`py-2 px-3 ${alignment} ${changeColor}`}>
        {option.percentChange
          ? `${
              option.percentChange > 0 ? "+" : ""
            }${option.percentChange.toFixed(2)}%`
          : "-"}
      </td>
    </>
  );
}
