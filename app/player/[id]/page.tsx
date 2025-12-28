"use client";
import Navbar from "@/components/navbar";
import Link from "next/link";
import { ChevronsLeft, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import {
  useGetPlayerByCode,
  useGetPlayerImageUrl,
} from "@/app/hooks/usePlayers";
import Image from "next/image";

function PlayerPage() {
  const { id } = useParams();
  const { player, isLoading, error } = useGetPlayerByCode(Number(id));
  const { imageUrl, isLoading: isLoadingImage } = useGetPlayerImageUrl(
    Number(id)
  );
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-2">
        <Navbar />
        <div className="my-4">
          <Link
            href="/matchup"
            className="text-sm font-semibold font-sans text-muted-foreground hover:text-foreground transition-all duration-200 group"
          >
            <ChevronsLeft className="w-4 h-4 ml-2 group-hover:-translate-x-0.5 transition-all duration-200" />
            Back to Matchups
          </Link>
        </div>
        <div className="flex items-center justify-center w-full mt-20">
          <Loader2 className="animate-spin" />
        </div>
      </div>
    );
  }

  if (!player || error) {
    return (
      <div className="max-w-7xl mx-auto px-2">
        <Navbar />
        <div className="my-4">
          <Link
            href="/matchup"
            className="text-sm font-semibold font-sans text-muted-foreground hover:text-foreground transition-all duration-200 group"
          >
            <ChevronsLeft className="w-4 h-4 ml-2 group-hover:-translate-x-0.5 transition-all duration-200" />
            Back to Matchups
          </Link>
        </div>
        <div className="flex items-center justify-center text-red-500 mt-20 text-sm font-sans">
          Error loading player. {error?.message}
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto px-2">
      <Navbar />
      <div className="my-4">
        <Link
          href="/matchup"
          className="text-sm flex  items-center font-semibold font-sans text-muted-foreground hover:text-foreground transition-all duration-200 group"
        >
          <ChevronsLeft className="w-4 h-4 ml-2 group-hover:-translate-x-0.5 transition-all duration-200" />
          Back to Matchups
        </Link>
      </div>
      <div className="my-4">
        <Image
          src={isLoadingImage ? "/sample.webp" : imageUrl || "/sample.webp"}
          alt={player.name}
          width={150}
          height={150}
          className="w-24 h-24 md:w-42 md:h-42 object-contain rounded-2xl border border-foreground/20 p-2"
        />
        <p className="text-base font-semibold font-sans text-foreground mt-2">
          {player.web_name}
        </p>
      </div>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="border border-foreground/20 rounded-2xl p-4">
          <p className="text-sm font-sans text-muted-foreground mb-2">Team</p>
          <p className="text-sm font-sans text-foreground">{player.team_id}</p>
        </div>
        <div className="border border-foreground/20 rounded-2xl p-4">
          <p className="text-md font-sans font-semibold mb-2">Points</p>
          <p className="text-sm font-sans text-foreground">
            Total: {player.total_points}
          </p>
          <p className="font-sans text-sm text-foreground/50">
            Pointe per Game: {player.points_per_game}
          </p>
        </div>
        <div className="border border-foreground/20 rounded-2xl p-4">
          <p className="text-md font-sans font-semibold mb-2">Selected</p>
          <p className="text-sm font-sans text-foreground">
            Selected: {player.selected_by_percent} %
          </p>
          <p className="font-sans text-sm text-foreground/50">
            Rank: {player.selected_rank} / 770
          </p>
        </div>
        <div className="border border-foreground/20 rounded-2xl p-4">
          <p className="text-md font-sans font-semibold mb-2">ICT</p>
          <p className="text-sm font-sans text-foreground">
            Index: {player.ict_index}
          </p>
          <p className="font-sans text-sm text-foreground/50">
            Ranks {player.ict_index_rank} / 770
          </p>
        </div>
        <div className="border border-foreground/20 rounded-2xl p-4">
          <p className="text-md font-sans font-semibold mb-2">Transfers</p>
          <p className="text-sm font-sans text-foreground">
            In: {player.transfers_in.toLocaleString()}
          </p>
          <p className="font-sans text-sm text-foreground/50">
            Out: {player.transfers_out.toLocaleString()}
          </p>
        </div>
        <div className="border border-foreground/20 rounded-2xl p-4">
          <p className="text-md font-sans font-semibold mb-2">Form</p>
          <p className="text-sm font-sans text-foreground">
            Form: {player.form}
          </p>
          <p className="font-sans text-sm text-foreground/50">
            Ranks {player.form_rank} / 770
          </p>
        </div>
        <div className="border border-foreground/20 rounded-2xl p-4">
          <p className="text-md font-sans font-semibold mb-2">
            Points Per Game
          </p>
          <p className="text-sm font-sans text-foreground">
            Points Per Game: {player.points_per_game}
          </p>
          <p className="font-sans text-sm text-foreground/50">
            Ranks {player.points_per_game_rank} / 770
          </p>
        </div>
        <div className="border border-foreground/20 rounded-2xl p-4">
          <p className="text-md font-sans font-semibold mb-2">Minutes </p>
          <p className="text-sm font-sans text-foreground">
            Minutes: {player.minutes_played}
          </p>
          <p className="font-sans text-sm text-foreground/50">
            Starts per 90: {player.starts_per_90}
          </p>
        </div>
        <div className="border border-foreground/20 rounded-2xl p-4">
          <p className="text-md font-sans font-semibold mb-2">Expected G/A</p>
          <p className="text-sm font-sans text-foreground">
            Expected Assists: {player.expected_assists}
          </p>
          <p className="font-sans text-sm text-foreground/50">
            Expected Goals {player.expected_goals}
          </p>
        </div>
        <div className="border border-foreground/20 rounded-2xl p-4">
          <p className="text-md font-sans font-semibold mb-2">Involvements</p>
          <p className="text-sm font-sans text-foreground">
            Goals: {player.expected_goal_involvements}
          </p>
          <p className="font-sans text-sm text-foreground/50">
            Assists: {player.expected_assists}
          </p>
        </div>
        <div className="border border-foreground/20 rounded-2xl p-4">
          <p className="text-md font-sans font-semibold mb-2">Goals</p>
          <p className="text-sm font-sans text-foreground">
            Scored: {player.goals_scored}
          </p>
          <p className="font-sans text-sm text-foreground/50">
            Conceded: {player.goals_conceded}
          </p>
        </div>
        <div className="border border-foreground/20 rounded-2xl p-4">
          <p className="text-md font-sans font-semibold mb-2">Defense</p>
          <p className="text-sm font-sans text-foreground">
            Defensive Contribution: {player.defensive_contribution_per_90}
          </p>
          <p className="font-sans text-sm text-foreground/50">
            Expected Goals Conceded: {player.expected_goals_conceded}
          </p>
        </div>
        <div className="border border-foreground/20 rounded-2xl p-4">
          <p className="text-md font-sans font-semibold mb-2">Discipline</p>
          <p className="text-sm font-sans text-foreground">
            Red Cards: {player.red_cards}
          </p>
          <p className="font-sans text-sm text-foreground/50">
            Yellow Cards: {player.yellow_cards}
          </p>
        </div>
        <div className="border border-foreground/20 rounded-2xl p-4">
          <p className="text-md font-sans font-semibold mb-2">News</p>
          <p className="text-sm font-sans text-foreground">
            {player.news === "" ? "No news available" : player.news}
          </p>
          <p className="font-sans text-sm text-foreground/50">
            {new Date(player.news_added || "").toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}

export default PlayerPage;
