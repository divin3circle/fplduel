"use client";

import { useParams } from "next/navigation";
import Navbar from "@/components/navbar";
import Header from "./header";
import { MATCHUPS } from "@/lib/utils";
import Bet from "./bet";

function MatchupPage() {
  const { id } = useParams();
  const matchup = MATCHUPS.find((matchup) => matchup.id === Number(id));
  if (!matchup) {
    return <div>Matchup not found</div>;
  }
  return (
    <div className="max-w-7xl mx-auto px-2">
      <Navbar />
      <Header matchup={matchup} />
      <Bet matchup={matchup} />
    </div>
  );
}

export default MatchupPage;
