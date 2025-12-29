import {
  getBetPercentages,
  useBet,
  useClaim,
  useGetNumberOfBets,
  useRecordBet,
} from "@/app/hooks/useBet";
import {
  Matchup,
  useGetClaimableAmount,
  useGetMatchupState,
} from "@/app/hooks/useMatchups";
import { getTeamLogo } from "@/components/matchupcard";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useActiveAccount } from "thirdweb/react";

function BetModal({
  matchup,
  selectedTeam,
  selectedTeamOdds,
  close,
}: {
  matchup: Matchup;
  selectedTeam: 0 | 1 | 2;
  selectedTeamOdds: number;
  close: () => void;
}) {
  const { onClick, isPending, transactionHash, isSuccess } = useBet(
    matchup.contract_address
  );
  const [amount, setAmount] = useState<number>(10);
  const {
    mutate: recordBet,
    isPending: isRecordPending,
    isError,
    isSuccess: isRecordSuccess,
  } = useRecordBet();
  const activeAccount = useActiveAccount();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (
      isSuccess &&
      !isRecordPending &&
      !isRecordSuccess &&
      !isError &&
      activeAccount?.address &&
      transactionHash
    ) {
      recordBet({
        userAddress: activeAccount.address,
        amount: BigInt(amount),
        choice: selectedTeam,
        matchup: matchup,
        txnHash: transactionHash,
        odds: selectedTeamOdds,
      });
    }
  }, [
    isSuccess,
    isRecordPending,
    isRecordSuccess,
    isError,
    activeAccount?.address,
    transactionHash,
    amount,
    selectedTeam,
    matchup,
    selectedTeamOdds,
    recordBet,
  ]);

  useEffect(() => {
    if (isRecordSuccess) {
      toast.success("Bet recorded successfully!");
      queryClient.invalidateQueries({ queryKey: ["numberOfBets", matchup.id] });
      close();
    }
  }, [isRecordSuccess, close, queryClient, matchup.id]);

  useEffect(() => {
    if (isError) {
      toast.error("Failed to record bet. Please contact support.");
      close();
    }
  }, [isError, close]);
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-50">
      <div className="rounded-3xl p-4 bg-background max-w-2xl w-full border border-foreground/20 dark:border-foreground/10 mx-1">
        <div className="">
          <h1 className="text-2xl font-bold font-sans mb-4">Place your bet</h1>
          <div className="flex items-center gap-2 mb-4">
            <p className="text-sm text-muted-foreground font-sans">
              You are betting on{" "}
              {selectedTeam === 0
                ? matchup.home_team_name
                : selectedTeam === 2
                ? matchup.away_team_name
                : "a Draw"}
            </p>
            {selectedTeam === 1 ? null : selectedTeam === 0 ? (
              <Image
                src={getTeamLogo(matchup.assigned_home_team_id, "home")}
                alt={matchup.home_team_name}
                width={20}
                height={20}
                className="w-6 h-6 rounded-md object-cover"
              />
            ) : (
              <Image
                src={getTeamLogo(matchup.assigned_away_team_id, "away")}
                alt={matchup.away_team_name}
                width={20}
                height={20}
                className="w-6 h-6 rounded-md object-cover"
              />
            )}
          </div>
          <div className="mb-4">
            <label
              htmlFor="bet-amount"
              className="block text-sm font-medium text-muted-foreground font-sans mb-1"
            >
              Bet Amount (ℏbar)
            </label>
            <input
              type="number"
              id="bet-amount"
              placeholder="1,000 ℏbar"
              className="w-full px-3 py-2 border border-foreground/20 dark:border-foreground/10 rounded-2xl bg-background text-foreground font-sans focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              min={1}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              className="px-4 py-2 bg-foreground/5 text-foreground text-sm rounded-lg font-sans hover:bg-foreground/10 transition-all duration-200"
              onClick={() => close()}
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-sans hover:bg-foreground/90 transition-all duration-200"
              onClick={() => onClick({ outcome: selectedTeam, value: amount })}
              disabled={isPending}
            >
              {isPending ? "Placing Bet..." : "Place Bet"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Bet({ matchup }: { matchup: Matchup }) {
  const { data: odds, isLoading, error } = useGetNumberOfBets(matchup.id);
  const [isBetModalOpen, setIsBetModalOpen] = useState(false);
  const {
    state,
    isLoading: isStateLoading,
    error: stateError,
  } = useGetMatchupState(matchup.contract_address);
  const {
    claimableAmount,
    isLoading: isClaimableAmountLoading,
    error: claimableAmountError,
  } = useGetClaimableAmount(matchup.contract_address);
  const { onClick: claim, isPending: isClaimPending } = useClaim(
    matchup.contract_address
  );
  const [selectedTeam, setSelectedTeam] = useState<0 | 1 | 2>(0);
  const [selectedTeamOdds, setSelectedTeamOdds] = useState<number>(0);

  if (error || stateError || claimableAmountError) {
    return (
      <div className="w-full bg-foreground/5 rounded-2xl mt-4 p-4">
        <h1 className="text-base font-semibold font-sans">Bet</h1>
        <p className="text-sm text-muted-foreground font-sans">
          Bet on the outcome of the game
        </p>
        <p className="mt-4 text-sm font-sans text-red-500">
          {error
            ? error.message
            : stateError?.message || claimableAmountError?.message}
        </p>
      </div>
    );
  }

  const handleBetClick = (team: 0 | 1 | 2) => {
    setSelectedTeam(team);
    if (team === 0) {
      setSelectedTeamOdds(
        odds
          ? parseFloat((1 + odds.team_a_bets / odds.total_bets).toFixed(2))
          : 0
      );
    } else if (team === 1) {
      setSelectedTeamOdds(
        odds ? parseFloat((1 + odds.draw_bets / odds.total_bets).toFixed(2)) : 0
      );
    } else if (team === 2) {
      setSelectedTeamOdds(
        odds
          ? parseFloat((1 + odds.team_b_bets / odds.total_bets).toFixed(2))
          : 0
      );
    }
    setIsBetModalOpen(true);
  };

  if (isLoading || isStateLoading) {
    return (
      <div className="w-full bg-foreground/5 rounded-2xl mt-4 p-4">
        <h1 className="text-base font-semibold font-sans">Bet</h1>
        <p className="text-sm text-muted-foreground font-sans">
          Bet on the outcome of the game
        </p>
        <div className="flex items-center justify-between mt-4 gap-2">
          <Skeleton className="rounded-xl px-2 py-2 w-[37%] h-12 border border-foreground/20 dark:border-foreground/10" />
          <Skeleton className="rounded-xl px-2 py-2 w-1/4 h-12 border border-foreground/20 dark:border-foreground/10" />
          <Skeleton className="rounded-xl px-2 py-2 w-[37%] h-12 border border-foreground/20 dark:border-foreground/10" />
        </div>
      </div>
    );
  }

  if (!odds) {
    return (
      <div className="w-full bg-foreground/5 rounded-2xl mt-4 p-4">
        <h1 className="text-base font-semibold font-sans">Bet</h1>
        <p className="text-sm text-muted-foreground font-sans">
          Bet on the outcome of the game
        </p>
        <div className="flex items-center justify-between mt-4 gap-2">
          <div className="flex items-center justify-between rounded-xl px-2 py-2 w-[37%] border border-foreground/20 dark:border-foreground/10 cursor-pointer hover:bg-foreground/5 transition-all duration-200">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold font-sans">1</p>
              <Image
                src={getTeamLogo(matchup.assigned_home_team_id, "home")}
                alt={matchup.home_team_name}
                width={20}
                height={20}
                className="w-6 h-6 rounded-md object-cover"
              />
            </div>
            <p className="text-base font-semibold font-sans"> - </p>
          </div>
          <div className="flex items-center justify-between rounded-xl px-2 py-2 w-1/4 border border-foreground/20 dark:border-foreground/10 cursor-pointer hover:bg-foreground/5 transition-all duration-200">
            <p className="text-sm font-semibold font-sans">x</p>
            <p className="text-base font-semibold font-sans"> - </p>
          </div>
          <div className="flex items-center justify-between rounded-xl px-2 py-2 w-[37%] border border-foreground/20 dark:border-foreground/10 cursor-pointer hover:bg-foreground/5 transition-all duration-200">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold font-sans">2</p>
              <Image
                src={getTeamLogo(matchup.assigned_away_team_id, "away")}
                alt={matchup.away_team_name}
                width={20}
                height={20}
                className="w-6 h-6 rounded-md object-cover"
              />
            </div>
            <p className="text-base font-semibold font-sans"> - </p>
          </div>
        </div>
      </div>
    );
  }

  if (state?.settled) {
    return (
      <div className="w-full bg-foreground/5 rounded-2xl mt-4 p-4">
        <h1 className="text-base font-semibold font-sans">Bet</h1>
        <p className="text-sm text-muted-foreground font-sans">
          Bet on the outcome of the game
        </p>
        <p className="mt-4 text-sm font-sans text-muted-foreground mb-4 max-w-md">
          Betting is closed for this matchup as it has been settled. Check
          claimable amount below. Make sure to connect your wallet.
        </p>
        <button
          className="px-4 flex items-center justify-center py-2 bg-foreground text-background rounded-lg text-sm font-sans hover:bg-foreground/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isClaimableAmountLoading || claimableAmount === "0"}
          onClick={() => claim()}
        >
          {isClaimableAmountLoading || isClaimPending
            ? "Loading..."
            : `Claimable Amount: ${
                claimableAmount ? claimableAmount + " ℏbar" : "0 ℏbar"
              }`}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-foreground/5 rounded-2xl mt-4 p-4">
      <h1 className="text-base font-semibold font-sans">Bet</h1>
      <p className="text-sm text-muted-foreground font-sans">
        Bet on the outcome of the game
      </p>
      <div className="flex items-center justify-between mt-4 gap-2">
        <button
          className="flex items-center justify-between rounded-xl px-2 py-2 w-[37%] border border-foreground/20 dark:border-foreground/10 cursor-pointer hover:bg-foreground/5 transition-all duration-200"
          onClick={() => handleBetClick(0)}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold font-sans">1</p>
            <Image
              src={getTeamLogo(matchup.assigned_home_team_id, "home")}
              alt={matchup.home_team_name}
              width={20}
              height={20}
              className="w-6 h-6 rounded-md object-cover"
            />
          </div>

          <p className="text-base font-semibold font-sans">
            {odds.team_a_bets} Bets(
            <span className="text-xs font-sans text-muted-foreground">
              {getBetPercentages(odds).teamAPercentage}%
            </span>
            )
          </p>
        </button>
        <button
          className="flex items-center justify-between rounded-xl px-2 py-2 w-1/4 border border-foreground/20 dark:border-foreground/10 cursor-pointer hover:bg-foreground/5 transition-all duration-200"
          onClick={() => handleBetClick(1)}
        >
          <p className="text-sm font-semibold font-sans">x</p>

          <p className="text-base font-semibold font-sans">
            {odds.draw_bets} Bets(
            <span className="text-xs font-sans text-muted-foreground">
              {getBetPercentages(odds).drawPercentage}%
            </span>
            )
          </p>
        </button>
        <button
          className="flex items-center justify-between rounded-xl px-2 py-2 w-[37%] border border-foreground/20 dark:border-foreground/10 cursor-pointer hover:bg-foreground/5 transition-all duration-200"
          onClick={() => handleBetClick(2)}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold font-sans">2</p>
            <Image
              src={getTeamLogo(matchup.assigned_away_team_id, "away")}
              alt={matchup.away_team_name}
              width={20}
              height={20}
              className="w-6 h-6 rounded-md object-cover"
            />
          </div>
          <p className="text-base font-semibold font-sans flex items-center">
            {odds.team_b_bets} Bets(
            <span className="text-xs font-sans text-muted-foreground">
              {getBetPercentages(odds).teamBPercentage}%
            </span>
            )
          </p>
        </button>
      </div>
      <p className="mt-4 text-center text-sm font-sans text-muted-foreground">
        Total Bets Placed: {odds.total_bets} Bets
      </p>
      {isBetModalOpen && (
        <BetModal
          matchup={matchup}
          selectedTeam={selectedTeam}
          selectedTeamOdds={selectedTeamOdds}
          close={() => {
            setIsBetModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

export default Bet;
