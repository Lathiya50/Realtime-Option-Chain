export default function ErrorDisplay({ message, onRetry }) {
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 max-w-lg mx-auto my-8">
      <div className="flex flex-col items-center text-center">
        <svg
          className="h-10 w-10 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-red-800 dark:text-red-200">
          Error Loading Data
        </h3>
        <p className="mt-1 text-sm text-red-700 dark:text-red-300">{message}</p>

        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100 rounded-md hover:bg-red-200 dark:hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
