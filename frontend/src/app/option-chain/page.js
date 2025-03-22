"use client";
import useOptionChain from "../../hooks/useOptionChain";
import AppLayout from "../../components/layout/AppLayout";
import OptionChainTable from "../../components/options/OptionChainTable";
import UnderlyingHeader from "../../components/options/UnderlyingHeader";
import StrikeFilter from "../../components/options/StrikeFilter";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ErrorDisplay from "../../components/ui/ErrorDisplay";

export default function OptionChainPage() {
  const {
    isLoading,
    error,
    underlying,
    optionChain,
    visibleStrikes,
    atmStrike,
    allStrikes,
    refreshData,
  } = useOptionChain();

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-96">
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <ErrorDisplay message={error} onRetry={refreshData} />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto p-4">
        <UnderlyingHeader underlying={underlying} />

        <div className="my-4">
          <StrikeFilter
            atmStrike={atmStrike}
            allStrikes={allStrikes}
            visibleStrikes={visibleStrikes}
          />
        </div>

        <div className="overflow-x-auto">
          <OptionChainTable optionChain={optionChain} underlying={underlying} />
        </div>
      </div>
    </AppLayout>
  );
}
