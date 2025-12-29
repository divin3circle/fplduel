import { useSendTransaction } from "thirdweb/react";
import { getContract, prepareContractCall } from "thirdweb";
import { client, hederaTestnet } from "@/config/client.thirdweb";
import { toast } from "sonner";
import { contractAbi } from "@/config/contract.config";
import { Matchup } from "./useMatchups";
import axios from "axios";
import { getEnvironment, getServerUrl } from "@/config/server.config";
import { useMutation, useQuery } from "@tanstack/react-query";

export interface Bet {
  id: string;
  user_address: string;
  matchup_id: string;
  predicted_winner: number;
  bet_amount: number;
  odds: number;
  txn_hash: string;
  created_at: string;
  updated_at: string;
}

export interface BetCount {
  total_bets: number;
  team_a_bets: number;
  team_b_bets: number;
  draw_bets: number;
}

async function recordBet(
  userAddress: string,
  amount: bigint,
  choice: number,
  matchup: Matchup,
  txnHash: string | undefined,
  odds: number
): Promise<Bet> {
  try {
    const body = {
      user_address: userAddress,
      matchup_id: matchup.id,
      predicted_winner: choice,
      bet_amount: Number(amount),
      odds: Number(odds),
      txn_hash: txnHash ? txnHash : "hash_not_available",
    };
    const response = await axios.post(
      `${getServerUrl(getEnvironment())}/bet`,
      body
    );
    return response.data;
  } catch (error) {
    console.error("Error recording bet:", error);
    throw error;
  }
}

async function getNumberOfBets({
  matchupId,
}: {
  matchupId: string;
}): Promise<BetCount> {
  try {
    const response = await axios.get(
      `${getServerUrl(getEnvironment())}/bets/${matchupId}/count`
    );
    return response.data as BetCount;
  } catch (error) {
    console.error("Error fetching number of bets:", error);
    throw error;
  }
}

async function getBetsByUser({
  userAddress,
}: {
  userAddress: string | undefined;
}): Promise<Bet[]> {
  if (!userAddress) {
    console.warn("No user address provided for fetching bets.");
    return [];
  }
  try {
    const response = await axios.get(
      `${getServerUrl(getEnvironment())}/bets/${userAddress}`
    );
    return response.data as Bet[];
  } catch (error) {
    console.error("Error fetching bets by user:", error);
    throw error;
  }
}

export function useBetsByUser(userAddress: string | undefined) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["betsByUser", userAddress],
    queryFn: () => getBetsByUser({ userAddress }),
  });
  return { data, isLoading, error };
}

export function useBet(contractAddress: string) {
  const {
    mutate: sendTx,
    data: transactionResult,
    isPending,
    error,
    isSuccess,
  } = useSendTransaction();
  const contract = getContract({
    address: contractAddress,
    chain: hederaTestnet,
    client,
    abi: contractAbi,
  });
  const onClick = ({ outcome, value }: { outcome: number; value: number }) => {
    const valueInWei = BigInt(Math.floor(value * 1e18));

    const transaction = prepareContractCall({
      contract,
      method: "bet",
      params: [outcome as 0 | 1 | 2],
      value: valueInWei,
    });
    sendTx(transaction);
  };
  if (error) {
    toast.error(`Bet failed: ${error.message}`);
  }
  if (isSuccess) {
    toast.success("Bet placed successfully!");
    toast.info(`Hash: ${transactionResult.transactionHash}.`);
  }
  return {
    onClick,
    isPending,
    isSuccess,
    transactionHash: transactionResult?.transactionHash,
  };
}

export function useClaim(contractAddress: string) {
  const {
    mutate: sendTx,
    data: transactionResult,
    isPending,
    error,
    isSuccess,
  } = useSendTransaction();
  const contract = getContract({
    address: contractAddress,
    chain: hederaTestnet,
    client,
    abi: contractAbi,
  });
  const onClick = () => {
    const transaction = prepareContractCall({
      contract,
      method: "claim",
      params: [],
      value: BigInt(0),
    });
    sendTx(transaction);
  };
  if (error) {
    toast.error(`Claim failed: ${error.message}`);
  }
  if (isSuccess) {
    toast.success("Claimed successfully!");
    toast.info(`Hash: ${transactionResult.transactionHash}.`);
  }
  return { onClick, isPending };
}

export function useRecordBet() {
  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: ({
      userAddress,
      amount,
      choice,
      matchup,
      txnHash,
      odds,
    }: {
      userAddress: string;
      amount: bigint;
      choice: number;
      matchup: Matchup;
      txnHash: string | undefined;
      odds: number;
    }) => recordBet(userAddress, amount, choice, matchup, txnHash, odds),
  });
  return { mutate, isPending, isError, isSuccess };
}

export function useGetNumberOfBets(matchupId: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["numberOfBets", matchupId],
    queryFn: () => getNumberOfBets({ matchupId }),
  });
  return { data, isLoading, error };
}

export function getBetPercentages(betCounts: BetCount) {
  const totalBets = betCounts.total_bets;
  if (totalBets === 0) {
    return {
      teamAPercentage: 0,
      teamBPercentage: 0,
      drawPercentage: 0,
    };
  }
  const teamAPercentage = (betCounts.team_a_bets / totalBets) * 100;
  const teamBPercentage = (betCounts.team_b_bets / totalBets) * 100;
  const drawPercentage = (betCounts.draw_bets / totalBets) * 100;

  return {
    teamAPercentage: teamAPercentage.toFixed(2),
    teamBPercentage: teamBPercentage.toFixed(2),
    drawPercentage: drawPercentage.toFixed(2),
  };
}
