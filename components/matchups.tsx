"use client";
import { MATCHUPS } from "@/lib/utils";
import MatchupCard from "./matchupcard";
import { ChevronsRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function Matchups() {
  const pathname = usePathname();
  return (
    <div className="mt-8 mb-4">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {MATCHUPS.map((matchup) => (
          <MatchupCard key={matchup.home.id} matchup={matchup} />
        ))}
      </div>
      <p className="text-sm text-muted-foreground font-sans mt-4">Leagues</p>
      <p className="text-xs text-muted-foreground font-sans text-center mt-4">
        Coming Soon
      </p>
    </div>
  );
}

export default Matchups;
