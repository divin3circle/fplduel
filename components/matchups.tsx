"use client";
import MatchupCard from "./matchupcard";
import { ChevronsRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGetGameWeekMatchups } from "@/app/hooks/useMatchups";

function Matchups() {
  const pathname = usePathname();
  const { matchups, isLoading, error } = useGetGameWeekMatchups();
  console.log(matchups);
  if (error) {
    return (
      <div className="flex items-center justify-center text-red-500 mt-4 text-sm font-sans">
        Error loading matchups. {error.message}
      </div>
    );
  }
  return (
    <div className="mt-8 mb-4 mx-2">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold font-sans">Matchups</h2>
        {!pathname.includes("matchup") && (
          <Link
            href={`/matchup`}
            className="flex items-center justify-center text-sm font-semibold font-sans text-muted-foreground hover:text-foreground transition-all duration-200 group"
          >
            View All
            <ChevronsRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-all duration-200" />
          </Link>
        )}
      </div>
      <p className="text-sm text-muted-foreground font-sans">Teams</p>
      {!isLoading && matchups ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {matchups.map((matchup) => (
            <MatchupCard key={matchup.home_team_id} matchup={matchup} />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center w-full mt-4">
          <Loader2 className="animate-spin" />
        </div>
      )}
      <p className="text-sm text-muted-foreground font-sans mt-4">Leagues</p>
      <p className="text-xs text-muted-foreground font-sans text-center mt-4">
        Coming Soon
      </p>
    </div>
  );
}

export default Matchups;
