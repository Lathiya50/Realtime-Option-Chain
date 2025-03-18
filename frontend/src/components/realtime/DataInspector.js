import React, { useState, useEffect } from "react";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

const DataInspector = ({ marketData, error }) => {
  const [formattedData, setFormattedData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("token");
  const [sortDirection, setSortDirection] = useState("asc");

  // Format market data for display
  useEffect(() => {
    if (!marketData) return;

    const dataArray = Object.entries(marketData).map(([token, data]) => {
      const lastUpdateTime = data.lastUpdated
        ? new Date(data.lastUpdated).toLocaleTimeString()
        : "N/A";

      return {
        token,
        currentPrice: data.currentPrice?.toFixed(2) || "N/A",
        percentChange: data.percentChange?.toFixed(2) || "N/A",
        lastUpdated: lastUpdateTime,
        type: data.type || "unknown",
        raw: data,
      };
    });

    // Sort data
    const sortedData = dataArray.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "token") {
        comparison = a.token.localeCompare(b.token);
      } else if (sortBy === "price") {
        comparison = parseFloat(a.currentPrice) - parseFloat(b.currentPrice);
      } else if (sortBy === "change") {
        comparison = parseFloat(a.percentChange) - parseFloat(b.percentChange);
      } else if (sortBy === "time") {
        comparison = new Date(a.raw.lastUpdated) - new Date(b.raw.lastUpdated);
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    setFormattedData(sortedData);
  }, [marketData, sortBy, sortDirection]);

  // Filter data based on search term
  const filteredData = formattedData.filter((item) =>
    item.token.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle sort click
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("asc");
    }
  };

  // Render sort indicator
  const renderSortIndicator = (column) => {
    if (sortBy !== column) return null;

    if (sortDirection === "asc") {
      return <ArrowUp className="inline w-4 h-4" />;
    } else {
      return <ArrowDown className="inline w-4 h-4" />;
    }
  };

  // Get style class based on percent change
  const getChangeClass = (change) => {
    if (change === "N/A") return "text-gray-500";
    const numChange = parseFloat(change);
    if (numChange > 0) return "text-green-500";
    if (numChange < 0) return "text-red-500";
    return "text-gray-500";
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-xl p-6 border border-gray-700">
      <h2 className="text-xl font-semibold mb-6 text-white flex items-center">
        <div className="w-2 h-2 rounded-full mr-2 bg-blue-500"></div>
        Market Data
      </h2>

      {error && (
        <div className="p-4 mb-6 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20">
          {error}
        </div>
      )}

      <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
        <input
          type="text"
          placeholder="Search tokens..."
          className="w-full bg-gray-900 border border-gray-700 text-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-800/50 text-gray-400 text-xs">
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("token")}
              >
                Token {renderSortIndicator("token")}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("price")}
              >
                Current Price {renderSortIndicator("price")}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("change")}
              >
                % Change {renderSortIndicator("change")}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("time")}
              >
                Last Updated {renderSortIndicator("time")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filteredData.length ? (
              filteredData.map((item) => (
                <tr
                  key={item.token}
                  className="hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-medium text-white">
                    {item?.raw?.optionType}_{item?.raw?.strike}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {item.currentPrice}
                  </td>
                  <td
                    className={`px-6 py-4 text-sm ${getChangeClass(
                      item.percentChange
                    )}`}
                  >
                    {item.percentChange !== "N/A" ? (
                      <>
                        {parseFloat(item.percentChange) > 0 ? (
                          <ArrowUp className="inline w-4 h-4 mr-1" />
                        ) : parseFloat(item.percentChange) < 0 ? (
                          <ArrowDown className="inline w-4 h-4 mr-1" />
                        ) : (
                          <Minus className="inline w-4 h-4 mr-1" />
                        )}
                        {item.percentChange}%
                      </>
                    ) : (
                      item.percentChange
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {item.lastUpdated}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                  {searchTerm ? "No matching data found" : "No data available"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        Displaying {filteredData.length} of {formattedData.length} tokens
      </div>
    </div>
  );
};

export default DataInspector;
