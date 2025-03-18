// frontend/app/page.js
"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, BarChart2, LineChart } from "lucide-react";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Realtime Option Chain
          </h1>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-4">
        <div className="max-w-4xl w-full space-y-12">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl">
              Real-time Options Data
            </h2>
            <p className="mt-4 text-xl text-gray-500 dark:text-gray-300">
              Visualize and analyze option chain data with real-time updates
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <button
              onClick={() => router.push("/option-chain")}
              className="group bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center mb-4">
                <BarChart2 className="h-8 w-8 text-blue-500 mr-3" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Option Chain
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                View the complete option chain with 75 strikes centered around
                ATM. Monitor prices and percent changes in real-time.
              </p>
              <div className="flex items-center text-blue-500 font-medium">
                <span>Go to Option Chain</span>
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
              </div>
            </button>

            <button
              onClick={() => router.push("/realtime")}
              className="group bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center mb-4">
                <LineChart className="h-8 w-8 text-green-500 mr-3" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Data Inspector
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Debug and inspect the real-time data feed. Subscribe to specific
                tokens/strikes and monitor WebSocket connection status.
              </p>
              <div className="flex items-center text-green-500 font-medium">
                <span>Go to Data Inspector</span>
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
              </div>
            </button>
          </div>
        </div>
      </main>

      <footer className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Realtime Option Chain - Full Stack Developer Assignment
          </p>
        </div>
      </footer>
    </div>
  );
}
