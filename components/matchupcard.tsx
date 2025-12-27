import { Matchup, useCurrentGameWeek } from "@/app/hooks/useMatchups";
import { AWAY_TEAMS, HOME_TEAMS } from "@/lib/assets";
import { ChevronsRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function getTeamLogo(teamId: number, teamType: "home" | "away") {
  if (teamType === "home") {
    return HOME_TEAMS[teamId];
  }
  return AWAY_TEAMS[teamId - 5];
}
export function formatValue(value: number): string {
  const actualValue = value / 10;
  return `£${actualValue.toFixed(2)}`;
}

function MatchupCard({ matchup }: { matchup: Matchup }) {
  const currentGameWeek = useCurrentGameWeek();
  return (
    <div className="bg-background/10 rounded-2xl p-4 border border-foreground/20">
      <div className="flex items-center justify-between">
        <div className="">
          <p className="text-sm text-muted-foreground font-sans">Status</p>
          <h1 className="text-base font-semibold font-sans">
            Gameweek {currentGameWeek}
          </h1>
        </div>
        <div className="flex flex-col items-end">
          <p className="text-sm text-muted-foreground font-sans">Deadline</p>
          <h1 className="text-base font-semibold font-sans">
            December 15, 2025
          </h1>
        </div>
      </div>
      <div className="flex flex-col gap-2 mt-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground font-sans font-semibold">
            Name
          </p>
          <p className="text-sm font-semibold font-sans text-muted-foreground">
            Value
          </p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src={getTeamLogo(matchup.assigned_home_team_id, "home")}
              alt={matchup.home_team_name}
              width={20}
              height={20}
              className="w-6 h-6 rounded-md object-cover"
            />
            <p className="text-sm font-semibold font-sans">
              {matchup.home_team_name.slice(0, 15)}
              {matchup.home_team_name.length > 15 && "..."}
            </p>
          </div>
          <div className="flex items-center justify-center w-18 h-8 bg-foreground/10 rounded-md">
            <p className="text-sm font-semibold font-sans">
              {formatValue(matchup.home_team_value)}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src={getTeamLogo(matchup.assigned_away_team_id, "away")}
              alt={matchup.away_team_name}
              width={20}
              height={20}
              className="w-6 h-6 rounded-md object-cover"
            />
            <p className="text-sm font-semibold font-sans">
              {matchup.away_team_name.slice(0, 15)}
              {matchup.away_team_name.length > 15 && "..."}
            </p>
          </div>
          <div className="flex items-center justify-center w-18 h-8 bg-foreground/10 rounded-md">
            <p className="text-sm font-semibold font-sans">
              {formatValue(matchup.away_team_value)}
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-4 gap-2">
        <div className="flex items-center justify-between bg-foreground/10 rounded-xl px-2 py-2 w-[37%] border border-foreground/20 dark:border-foreground/10 cursor-pointer hover:bg-foreground/20 transition-all duration-200">
          <p className="text-sm font-semibold font-sans">1</p>
          <p className="text-base font-semibold font-sans">2.50</p>
        </div>
        <div className="flex items-center justify-between bg-foreground/10 rounded-xl px-2 py-2 w-1/4 border border-foreground/20 dark:border-foreground/10 cursor-pointer hover:bg-foreground/20 transition-all duration-200">
          <p className="text-sm font-semibold font-sans">x</p>
          <p className="text-base font-semibold font-sans">8.45</p>
        </div>
        <div className="flex items-center justify-between bg-foreground/10 rounded-xl px-2 py-2 w-[37%] border border-foreground/20 dark:border-foreground/10 cursor-pointer hover:bg-foreground/20 transition-all duration-200">
          <p className="text-sm font-semibold font-sans">2</p>
          <p className="text-base font-semibold font-sans">2.50</p>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-center">
        <Link
          href={`/matchup/${matchup.id}`}
          className="flex items-center justify-center text-sm font-semibold font-sans text-muted-foreground hover:text-foreground transition-all duration-200 group"
        >
          View More
          <ChevronsRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-all duration-200" />
        </Link>
      </div>
    </div>
  );
}

export default MatchupCard;
