"use client";

import { useParams } from "next/navigation";
import Navbar from "@/components/navbar";
import Header from "./header";
import { MATCHUPS } from "@/lib/utils";
import Bet from "./bet";
import Lineups from "./lineups";
import AIComparisons from "./ai-comparisons";
import HeadToHead from "./h2h";
import Link from "next/link";
import { ChevronsLeft } from "lucide-react";

function MatchupPage() {
  const { id } = useParams();
  const matchup = MATCHUPS.find((matchup) => matchup.id === Number(id));
  if (!matchup) {
    return <div>Matchup not found</div>;
  }
  return (
    <div className="max-w-7xl mx-auto px-2">
      <Navbar />
      <div className="my-4">
        <Link
          href={`/matchup`}
          className="flex items-center text-sm font-semibold font-sans text-muted-foreground hover:text-foreground transition-all duration-200 group"
        >
          <ChevronsLeft className="w-4 h-4 ml-2 group-hover:translate-x-[-2px] transition-all duration-200" />
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
