"use client";

import { useState, useEffect } from "react";
import AppLayout from "../../components/layout/AppLayout";
import ConnectionStatus from "../../components/realtime/ConnectionStatus";
import DataInspector from "../../components/realtime/DataInspector";
import SubscriptionManager from "../../components/realtime/SubscriptionManager";
import useWebSocket from "../../hooks/useWebSocket";
import { checkApiHealth } from "../../lib/api";

export default function RealtimePage() {
  const {
    connectionState,
    isConnected,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    marketData,
    error,
    WS_STATES,
  } = useWebSocket();

  const [apiStatus, setApiStatus] = useState(null);

  useEffect(() => {
    // Check API health on component mount
    const checkHealth = async () => {
      try {
        const status = await checkApiHealth();
        setApiStatus(status);
      } catch (error) {
        setApiStatus({ status: "error", message: error.message });
      }
    };

    checkHealth();
  }, []);

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold text-white">
          <span className="text-blue-500">Real-time</span> Market Data
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8">
            <ConnectionStatus
              connectionState={connectionState}
              isConnected={isConnected}
              connect={connect}
              disconnect={disconnect}
              apiStatus={apiStatus}
              WS_STATES={WS_STATES}
            />

            <SubscriptionManager
              isConnected={isConnected}
              subscribe={subscribe}
              unsubscribe={unsubscribe}
              marketData={marketData}
            />
          </div>

          <div className="lg:col-span-2">
            <DataInspector marketData={marketData} error={error} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
