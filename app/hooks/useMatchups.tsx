import {
  getContractServerUrl,
  getEnvironment,
  getServerUrl,
} from "@/config/server.config";
import { Team } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useActiveAccount } from "thirdweb/react";

export interface Matchup {
  id: string;
  home_team_id: number;
  assigned_home_team_id: number;
  away_team_id: number;
  assigned_away_team_id: number;
  game_week: number;
  home_team_name: string;
  away_team_name: string;
  home_team_score: number;
  away_team_score: number;
  home_team_manager_id: number;
  away_team_manager_id: number;
  home_team_manager_name: string;
  away_team_manager_name: string;
  home_team_value: number;
  away_team_value: number;
  home_team_transfers: number;
  away_team_transfers: number;
  contract_address: string;
  created_at: string;
  updated_at: string;
}

export interface CurrentGameWeekResponse {
  currentGameweek: number;
}

export interface MatchupOdds {
  teamA: number;
  draw: number;
  teamB: number;
}

export interface Teams {
  home: Team;
  away: Team;
}

export interface StateResponse {
  owner: string;
  bettingEnd: string;
  settled: boolean;
  totalPool: string;
}

async function getCurrentGameWeek(): Promise<number> {
  try {
    const response = await axios.get(
      `${getServerUrl(getEnvironment())}/gameweek`
    );
    const data: CurrentGameWeekResponse = response.data;
    return data.currentGameweek;
  } catch (error) {
    console.error("Error fetching current game week:", error);
    return 0;
  }
}

export const useCurrentGameWeek = () => {
  const { data } = useQuery({
    queryKey: ["currentGameWeek"],
    queryFn: getCurrentGameWeek,
    staleTime: 5 * 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  return data;
};

async function getGameWeekMatchups(gameweek: number): Promise<Matchup[]> {
  try {
    const response = await axios.get(
      `${getServerUrl(getEnvironment())}/gameweek/${gameweek}`
    );
    const matchups: Matchup[] = response.data.matchups;
    return matchups;
  } catch (error) {
    console.error("Error fetching matchups:", error);
    return [];
  }
}

export const useGetGameWeekMatchups = () => {
  const currentGameWeek = useCurrentGameWeek();

  const { data, isLoading, error } = useQuery({
    queryKey: ["gameWeekMatchups", currentGameWeek],
    queryFn: () =>
      getGameWeekMatchups(currentGameWeek ? currentGameWeek - 1 : 0),
    enabled: !!currentGameWeek,
    staleTime: 5 * 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return { matchups: data, isLoading, error };
};

async function getMatchupOdds(
  contractAddress: string
): Promise<MatchupOdds | null> {
  try {
    const response = await axios.get(
      `${getContractServerUrl(getEnvironment())}/odds/${contractAddress}`
    );
    const odds: MatchupOdds = response.data;
    return odds;
  } catch (error) {
    console.error("Error fetching matchup odds:", error);
    return null;
  }
}

export const useGetMatchupOdds = (contractAddress: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["matchupOdds", contractAddress],
    queryFn: () => getMatchupOdds(contractAddress),
    enabled: !!contractAddress,
  });

  return { odds: data, isLoading, error };
};

async function getMatchup(id: string | undefined): Promise<Matchup | null> {
  if (!id) {
    return null;
  }
  try {
    const response = await axios.get(
      `${getServerUrl(getEnvironment())}/matchup/${id}`
    );
    const matchup: Matchup = response.data.matchup;
    return matchup;
  } catch (error) {
    console.error("Error fetching matchup:", error);
    return null;
  }
}

export const useGetMatchup = (id: string | undefined) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["matchup", id],
    queryFn: () => getMatchup(id),
    enabled: !!id,
  });

  return { matchup: data, isLoading, error };
};

export function getTeams(matchup: Matchup): Teams {
  const homeTeam: Team = {
    id: matchup.assigned_home_team_id,
    entry: matchup.home_team_id,
    name: matchup.home_team_name,
    player_name: matchup.home_team_manager_name,
    total_transfers: matchup.home_team_transfers,
    value_with_bank: matchup.home_team_value,
  };
  const awayTeam: Team = {
    id: matchup.assigned_away_team_id,
    entry: matchup.away_team_id,
    name: matchup.home_team_name,
    player_name: matchup.away_team_manager_name,
    total_transfers: matchup.away_team_transfers,
    value_with_bank: matchup.away_team_value,
  };

  const teams: Teams = {
    home: homeTeam,
    away: awayTeam,
  };
  return teams;
}

async function getMatchupState(
  contractAddress: string | undefined
): Promise<StateResponse | null> {
  if (!contractAddress) {
    return null;
  }
  try {
    const response = await axios.get(
      `${getContractServerUrl(getEnvironment())}/state/${contractAddress}`
    );
    const state: StateResponse = response.data;
    return state;
  } catch (error) {
    console.error("Error fetching matchup state:", error);
    return null;
  }
}

export const useGetMatchupState = (contractAddress: string | undefined) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["matchupState", contractAddress],
    queryFn: () => getMatchupState(contractAddress),
    enabled: !!contractAddress,
  });

  return { state: data, isLoading, error };
};

async function getClaimableAmount(
  userAddress: string | undefined,
  contractAddress: string | undefined
): Promise<string | null> {
  if (!userAddress || !contractAddress) {
    return null;
  }
  try {
    const response = await axios.get(
      `${getContractServerUrl(
        getEnvironment()
      )}/claim/${userAddress}/contract/${contractAddress}`
    );
    const amount: string = response.data.amount;
    return amount;
  } catch (error) {
    console.error("Error fetching claimable amount:", error);
    return null;
  }
}

export const useGetClaimableAmount = (contractAddress: string | undefined) => {
  const userAddress = useActiveAccount();
  const { data, isLoading, error } = useQuery({
    queryKey: ["claimableAmount", userAddress, contractAddress],
    queryFn: () => getClaimableAmount(userAddress?.address, contractAddress),
    enabled: !!userAddress && !!contractAddress,
    staleTime: 5 * 60 * 1000,
  });

  return { claimableAmount: data, isLoading, error };
};
