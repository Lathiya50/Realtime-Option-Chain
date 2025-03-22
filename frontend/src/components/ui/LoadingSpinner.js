export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      <span className="ml-3 text-lg font-medium text-gray-700 dark:text-gray-300">
        Loading...
      </span>
    </div>
  );
}
