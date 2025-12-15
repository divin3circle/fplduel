import { MATCHUPS } from "@/lib/utils";
import MatchupCard from "./matchupcard";

function Matchups() {
  return (
    <div className="mt-8 mb-4">
      <h2 className="text-2xl font-semibold font-sans">Matchups</h2>
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
