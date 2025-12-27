"use client";

import { useParams } from "next/navigation";
import Navbar from "@/components/navbar";
import Header from "./header";
import Bet from "./bet";
import Lineups from "./lineups";
import AIComparisons from "./ai-comparisons";
import HeadToHead from "./h2h";
import Link from "next/link";
import { ChevronsLeft, Loader2 } from "lucide-react";
import { useGetMatchup } from "@/app/hooks/useMatchups";

function MatchupPage() {
  const { id } = useParams();
  const { matchup, isLoading, error } = useGetMatchup(id?.toString());

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-2">
        <Navbar />
        <div className="flex items-center justify-center w-full mt-20">
          <Loader2 className="animate-spin" />
        </div>
      </div>
    );
  }

  if (!matchup || error) {
    return (
      <div className="max-w-7xl mx-auto px-2">
        <Navbar />
        <div className="flex items-center justify-center text-red-500 mt-20 text-sm font-sans">
          Error loading matchup. {error?.message}
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto px-2">
      <Navbar />
      <div className="my-4">
        <Link
          href={`/matchup`}
          className="flex items-center text-sm font-semibold font-sans text-muted-foreground hover:text-foreground transition-all duration-200 group"
        >
          <ChevronsLeft className="w-4 h-4 ml-2 group-hover:-translate-x-0.5 transition-all duration-200" />
          Back to Matchups
        </Link>
      </div>
      <Header matchup={matchup} />
      <Bet matchup={matchup} />
      <Lineups matchup={matchup} />
      <AIComparisons matchup={matchup} />
      <HeadToHead matchup={matchup} />
    </div>
  );
}

export default MatchupPage;
