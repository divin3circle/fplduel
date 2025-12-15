import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface Matchup {
  home: {
    id: number;
    entry: number;
    name: string;
    player_name: string;
    value_with_bank: number;
    total_transfers: number;
  };
  away: {
    id: number;
    entry: number;
    name: string;
    player_name: string;
    value_with_bank: number;
    total_transfers: number;
  };
}

const TOP_TEAMS = [
  {
    id: 1,
    entry: 354072,
    name: "Sakhee ⭐️",
    player_name: "Kostadin Aleksiev",
    value_with_bank: 1096,
    total_transfers: 114,
  },
  {
    id: 2,
    entry: 8947,
    name: "ABC123",
    player_name: "D S",
    value_with_bank: 1095,
    total_transfers: 101,
  },
  {
    id: 3,
    entry: 7107513,
    name: "In memory of Laura D",
    player_name: "Richard Weise",
    value_with_bank: 1093,
    total_transfers: 74,
  },
  {
    id: 4,
    entry: 82713,
    name: "Budweis Brewery",
    player_name: "Merry Yolanda Liem",
    value_with_bank: 1091,
    total_transfers: 44,
  },
  {
    id: 5,
    entry: 501529,
    name: "RARAWA",
    player_name: "Simon Henning",
    value_with_bank: 1091,
    total_transfers: 52,
  },
  {
    id: 6,
    entry: 8552295,
    name: "TV Kong Pandu",
    player_name: "Engkong Kong Pandu",
    value_with_bank: 1090,
    total_transfers: 85,
  },
  {
    id: 7,
    entry: 7918161,
    name: "KFC Superchargers",
    player_name: "John Pilkington",
    value_with_bank: 1090,
    total_transfers: 89,
  },
  {
    id: 8,
    entry: 871934,
    name: "autzeshan",
    player_name: "Tze Shan Au",
    value_with_bank: 1089,
    total_transfers: 44,
  },
  {
    id: 9,
    entry: 10174262,
    name: "Unknown",
    player_name: "Unknown Account",
    value_with_bank: 1089,
    total_transfers: 67,
  },
  {
    id: 10,
    entry: 1537186,
    name: "Half Team",
    player_name: "Y. Alfiano",
    value_with_bank: 1089,
    total_transfers: 110,
  },
];

export const MATCHUPS = [
  {
    home: TOP_TEAMS[0],
    away: TOP_TEAMS[TOP_TEAMS.length - 1],
  },
  {
    home: TOP_TEAMS[1],
    away: TOP_TEAMS[TOP_TEAMS.length - 2],
  },
  {
    home: TOP_TEAMS[2],
    away: TOP_TEAMS[TOP_TEAMS.length - 3],
  },
  {
    home: TOP_TEAMS[3],
    away: TOP_TEAMS[TOP_TEAMS.length - 4],
  },
  {
    home: TOP_TEAMS[4],
    away: TOP_TEAMS[TOP_TEAMS.length - 5],
  },
];
