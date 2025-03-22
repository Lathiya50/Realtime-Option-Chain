"use client";

import { useState } from "react";

export default function StrikeFilter({
  atmStrike,
  allStrikes,
  visibleStrikes,
}) {
  const [displayCount, setDisplayCount] = useState(75);

  if (!atmStrike || !allStrikes || !allStrikes.length) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-4 items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Display Strikes
        </label>
        <select
          className="block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 text-sm"
          value={displayCount}
          onChange={(e) => setDisplayCount(Number(e.target.value))}
        >
          <option value={25}>25 strikes</option>
          <option value={50}>50 strikes</option>
          <option value={75}>75 strikes</option>
          <option value={100}>100 strikes</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          ATM Strike
        </label>
        <div className="px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-md font-medium">
          {atmStrike?.toFixed(2)}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Strike Range
        </label>
        <div className="text-sm">
          <span className="font-medium">
            {visibleStrikes[0]?.toFixed(2) || "-"}
          </span>
          <span className="mx-2">to</span>
          <span className="font-medium">
            {visibleStrikes[visibleStrikes.length - 1]?.toFixed(2) || "-"}
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Total Strikes
        </label>
        <div className="text-sm font-medium">
          {visibleStrikes.length} / {allStrikes.length}
        </div>
      </div>
    </div>
  );
}
