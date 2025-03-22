"use client";

import { OPTION_TYPES, MONEYNESS_COLORS } from "../../lib/constants";
import OptionData from "./OptionData";

export default function OptionChainTable({ optionChain, underlying }) {
  if (!optionChain || !optionChain.length) {
    return <div className="text-center p-6">No option data available</div>;
  }

  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="bg-gray-100 dark:bg-gray-800">
          <th
            colSpan={2}
            className="py-2 px-3 text-left font-medium text-gray-500 dark:text-gray-300"
          >
            Calls
          </th>
          <th className="py-2 px-3 text-center font-medium text-gray-500 dark:text-gray-300">
            Strike
          </th>
          <th
            colSpan={2}
            className="py-2 px-3 text-right font-medium text-gray-500 dark:text-gray-300"
          >
            Puts
          </th>
        </tr>
        <tr className="bg-gray-50 dark:bg-gray-700">
          <th className="py-2 px-3 text-left font-medium text-gray-500 dark:text-gray-300">
            Price
          </th>
          <th className="py-2 px-3 text-left font-medium text-gray-500 dark:text-gray-300">
            Chg%
          </th>
          <th className="py-2 px-3 text-center font-medium text-gray-500 dark:text-gray-300"></th>
          <th className="py-2 px-3 text-right font-medium text-gray-500 dark:text-gray-300">
            Price
          </th>
          <th className="py-2 px-3 text-right font-medium text-gray-500 dark:text-gray-300">
            Chg%
          </th>
        </tr>
      </thead>
      <tbody>
        {optionChain.map((row, index) => (
          <tr
            key={row.strike}
            className={`border-b border-gray-200 dark:border-gray-700 ${
              row.isATM
                ? "bg-blue-50 dark:bg-blue-900/20"
                : index % 2 === 0
                ? "bg-white dark:bg-gray-800"
                : "bg-gray-50 dark:bg-gray-700/50"
            }`}
          >
            {/* Call option data */}
            <OptionData option={row.calls} type={OPTION_TYPES.CALL} />

            {/* Strike price */}
            <td className="py-2 px-3 text-center font-medium">
              <span
                className={`inline-block px-2 py-1 rounded ${
                  row.isATM
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                    : ""
                }`}
              >
                {row.strike.toFixed(2)}
              </span>
            </td>

            {/* Put option data */}
            <OptionData option={row.puts} type={OPTION_TYPES.PUT} />
          </tr>
        ))}
      </tbody>
    </table>
  );
}
