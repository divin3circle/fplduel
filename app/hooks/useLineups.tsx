import { useQuery } from "@tanstack/react-query";
import { useCurrentGameWeek } from "./useMatchups";
import { Lineup } from "@/lib/utils";
import { getEnvironment, getServerUrl } from "@/config/server.config";

export interface Pick {
  element: number;
  position: number;
  multiplier: number;
  is_captain: boolean;
  is_vice_captain: boolean;
  element_type: number;
}

export interface AutomaticSub {
  entry: number;
  element_in: number;
  element_out: number;
  event: number;
}

export interface EntryHistory {
  event: number;
  points: number;
  total_points: number;
  rank: number;
  rank_sort: number;
  overall_rank: number;
  percentile_rank: number;
  bank: number;
  value: number;
  event_transfers: number;
  event_transfers_cost: number;
  points_on_bench: number;
}

export interface ManagerPicks {
  active_chip: string | null;
  automatic_subs: AutomaticSub[];
  entry_history: EntryHistory;
  picks: Pick[];
}

export interface Formation {
  defenders: Lineup[];
  midfielders: Lineup[];
  forwards: Lineup[];
  goalkeeper: Lineup;
  substitutes: Lineup[];
}

async function getManagerPicks(
  gameWeek: number | undefined,
  managerId: number | undefined
): Promise<ManagerPicks> {
  if (!gameWeek) {
    throw new Error("Game week is required");
  }

  if (!managerId) {
    throw new Error("Manager ID is required");
  }

  const response = await fetch(
    `${getServerUrl(getEnvironment())}/teams/${managerId}/picks/${gameWeek - 1}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch manager picks");
  }

  const data: ManagerPicks = await response.json();
  return data;
}

export const useGetManagerPicks = (managerId: number | undefined) => {
  const currentGameWeek = useCurrentGameWeek();
  const { data, isLoading, error } = useQuery({
    queryKey: ["managerPicks", managerId, currentGameWeek],
    queryFn: () => getManagerPicks(currentGameWeek, managerId),
    enabled: !!managerId && !!currentGameWeek,
    refetchOnWindowFocus: false,
    staleTime: 5 * 24 * 60 * 60 * 1000,
  });
  return { picks: data, isLoading, error };
};

export function getFormation(lineup: Pick[]): Formation {
  enum Position {
    GK = 1,
    DEF = 2,
    MID = 3,
    FWD = 4,
  }

  // only the 1st 11 players
  const players = lineup.slice(1, 11);
  const defenders = [];
  const midfielders = [];
  const forwards = [];

  for (const player of players) {
    if (player.element_type === Position.DEF) {
      defenders.push(player);
    } else if (player.element_type === Position.MID) {
      midfielders.push(player);
    } else if (player.element_type === Position.FWD) {
      forwards.push(player);
    }
  }
  return {
    defenders,
    midfielders,
    forwards,
    goalkeeper: lineup[0],
    substitutes: lineup.slice(11),
  };
}

export const useFormation = (managerId: number | undefined) => {
  const { picks } = useGetManagerPicks(managerId);
  const {
    data: formation,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["managerFormation", managerId],
    queryFn: () => getFormation(picks?.picks || []),
    enabled: !!picks,
    staleTime: 5 * 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  return { formation, isLoading, error };
};
