import { getEnvironment, getServerUrl } from "@/config/server.config";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export interface Player {
  id: number;
  name: string;
  web_name: string;
  team_id: number;
  team_code: number;
  in_dreamteam: boolean;
  total_points: number;
  code: number;
  photo: string | null;
  birth_date: string | null;
  minutes_played: number;
  form_rank: number;
  form: string;
  points_per_game: string;
  influence: string;
  creativity: string;
  threat: string;
  ict_index: string;
  element_type: number;
  transfers_in: number;
  transfers_out: number;
  selected_by_percent: string;
  selected_rank: number;
  points_per_game_rank: number;
  ict_index_rank: number;
  news: string | null;
  news_added: string | null;
  goals_scored: number;
  assists: number;
  clean_sheets: number;
  goals_conceded: number;
  expected_goals: string;
  expected_assists: string;
  expected_goal_involvements: string;
  expected_goals_conceded: string;
  yellow_cards: number;
  red_cards: number;
  defensive_contribution_per_90: string;
  starts_per_90: string;
  minutes: string;
  updated_at: string;
}

async function getPlayerImageUrl(playerCode: number): Promise<string | null> {
  try {
    const response = await axios.get(
      `${getServerUrl(getEnvironment())}/player/jersey/${playerCode}`
    );
    const data = response.data;
    return data.jersey_url; // Assuming the API returns { imageUrl: "url_here" }
  } catch (error) {
    console.error("Error fetching player image URL:", error);
    return null;
  }
}

export const useGetPlayerImageUrl = (playerCode: number) => {
  const { player, isLoading: playerLoading } = useGetPlayerByCode(playerCode);
  const { data, isLoading, error } = useQuery({
    queryKey: ["playerImageUrl", playerCode],
    queryFn: () => getPlayerImageUrl(player!.code),
    enabled: !!playerCode && !!player,
    staleTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false,
  });

  return { imageUrl: data, isLoading: isLoading || playerLoading, error };
};

async function getPlayerByCode(playerCode: number): Promise<Player> {
  try {
    const response = await axios.get(
      `${getServerUrl(getEnvironment())}/player/id/${playerCode}`
    );
    const data: { player: Player } = response.data;
    return data.player;
  } catch (error) {
    console.error("Error fetching player by code:", error);
    throw error;
  }
}

export const useGetPlayerByCode = (playerCode: number) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["playerByCode", playerCode],
    queryFn: () => getPlayerByCode(playerCode),
    enabled: !!playerCode,
    staleTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false,
  });

  return { player: data, isLoading, error };
};
