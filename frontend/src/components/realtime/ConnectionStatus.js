import React from "react";

const ConnectionStatus = ({
  connectionState,
  isConnected,
  connect,
  disconnect,
  apiStatus,
  WS_STATES,
  reconnectAttempt,
}) => {
  // Get status color based on connection state
  const getStateColor = () => {
    switch (connectionState) {
      case WS_STATES.OPEN:
        return "bg-green-100 text-green-800";
      case WS_STATES.CONNECTING:
        return "bg-yellow-100 text-yellow-800";
      case WS_STATES.CLOSING:
        return "bg-orange-100 text-orange-800";
      case WS_STATES.CLOSED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get state name from state code
  const getStateName = () => {
    switch (connectionState) {
      case WS_STATES.OPEN:
        return "Connected";
      case WS_STATES.CONNECTING:
        return "Connecting";
      case WS_STATES.CLOSING:
        return "Closing";
      case WS_STATES.CLOSED:
        return "Disconnected";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-xl p-6 border border-gray-700">
      <h2 className="text-xl font-semibold mb-6 text-white flex items-center">
        <div className="w-2 h-2 rounded-full mr-2 bg-blue-500"></div>
        Connection Status
      </h2>

      <div className="space-y-6">
        <div className="bg-gray-800 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">WebSocket Status</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${getStateColor()}`}
            >
              {getStateName()}
            </span>
          </div>

          {reconnectAttempt > 0 && connectionState === WS_STATES.CLOSED && (
            <div className="text-sm text-yellow-500 flex items-center">
              <div className="animate-pulse mr-2">⚠️</div>
              Reconnection attempt: {reconnectAttempt}/5
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-gray-400">API Status</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                apiStatus?.status === "ok"
                  ? "bg-green-500/20 text-green-400"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              {apiStatus?.status === "ok" ? "Healthy" : "Error"}
            </span>
          </div>
        </div>

        {apiStatus?.status !== "ok" && (
          <div className="text-sm text-red-400 bg-red-500/10 rounded-lg p-3">
            {apiStatus?.message || "API connection error"}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={connect}
            disabled={isConnected}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              isConnected
                ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-500/30"
            }`}
          >
            Connect
          </button>

          <button
            onClick={disconnect}
            disabled={!isConnected}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              !isConnected
                ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-red-500 to-rose-600 text-white hover:shadow-lg hover:shadow-red-500/30"
            }`}
          >
            Disconnect
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectionStatus;
