"use client";

import { useBetsByUser } from "@/app/hooks/useBet";
import { Loader2 } from "lucide-react";
import { useActiveAccount } from "thirdweb/react";
import BetCard from "./betcard";

function HistoryView() {
  const activeAccount = useActiveAccount();
  const {
    data: bets,
    isLoading,
    error,
  } = useBetsByUser(activeAccount?.address);

  if (!activeAccount) {
    return (
      <div className="mt-8 mb-4 mx-2">
        <h1 className="text-2xl font-semibold font-sans mb-4">
          Please connect your wallet to view your betting history.
        </h1>
      </div>
    );
  }

  if (!bets || bets.length === 0) {
    return (
      <div className="mt-8 mb-4 mx-2">
        <h1 className="font-sans ">History</h1>
        <p className="text-sm text-muted-foreground font-sans mb-4">
          Your past bets
        </p>
        <p className="text-sm text-muted-foreground font-sans">
          You have no past bets.
        </p>
      </div>
    );
  }
  return (
    <div className="mt-8 mb-4 mx-2">
      <h1 className="font-sans ">History</h1>
      <p className="text-sm text-muted-foreground font-sans mb-4">
        Your past bets
      </p>
      {isLoading && (
        <div className="flex items-center justify-center flex-col">
          <Loader2 className="animate-spin" />
          <p className="text-sm text-muted-foreground font-sans mt-2">
            Loading your bets...
          </p>
        </div>
      )}
      {!isLoading && error && (
        <div className="text-red-500 text-sm font-sans">
          Error loading your bets: {error.message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {bets.map((bet) => (
          <BetCard key={bet.id} bet={bet} />
        ))}
      </div>
    </div>
  );
}

export default HistoryView;
