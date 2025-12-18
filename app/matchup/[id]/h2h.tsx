import { getTeamLogo } from "@/components/matchupcard";
import { Matchup } from "@/lib/utils";
import Image from "next/image";

function HeadToHead({ matchup }: { matchup: Matchup }) {
  return (
    <div className="w-full bg-foreground/5 rounded-2xl mt-4 mb-2 p-4">
      <h1 className="text-base font-semibold font-sans">Head to Head</h1>
      <p className="text-sm text-muted-foreground font-sans">
        {matchup.home.name} and {matchup.away.name} have played each other 10
        times.
      </p>
      <div className="my-4 flex flex-col gap-2">
        <div className="flex items-center justify-between mt-4">
          <div className="flex flex-row gap-2 items-center justify-center">
            <h1 className="text-base md:text-lg font-semibold font-sans">
              {matchup.home.name}
            </h1>
            <Image
              src={getTeamLogo(matchup.home.id, "home")}
              alt={matchup.home.name}
              width={100}
              height={100}
              className="w-10 h-10 rounded-md object-cover"
            />
          </div>
          <div className="flex flex-row gap-2 items-center justify-center">
            <h1 className="text-base md:text-lg font-semibold font-sans">
              {matchup.away.name}
            </h1>
            <Image
              src={getTeamLogo(matchup.away.id, "away")}
              alt={matchup.away.name}
              width={100}
              height={100}
              className="w-10 h-10 rounded-md object-cover"
            />
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 border-b border-foreground/20 pb-2 border-dashed">
          <p className="text-sm text-muted-foreground font-sans">15</p>
          <p className="text-sm text-muted-foreground font-sans">Won</p>
          <p className="text-sm text-muted-foreground font-sans">15</p>
        </div>
        <div className="flex items-center justify-between mt-4 border-b border-foreground/20 pb-2 border-dashed">
          <p className="text-sm text-muted-foreground font-sans">15</p>
          <p className="text-sm text-muted-foreground font-sans">Draws</p>
          <p className="text-sm text-muted-foreground font-sans">15</p>
        </div>
        <div className="flex items-center justify-between mt-4 border-b border-foreground/20 pb-2 border-dashed">
          <p className="text-sm text-muted-foreground font-sans">15</p>
          <p className="text-sm text-muted-foreground font-sans">Lost</p>
          <p className="text-sm text-muted-foreground font-sans">15</p>
        </div>
        <div className="flex items-center justify-between mt-4 border-b border-foreground/20 pb-2 border-dashed">
          <p className="text-sm text-muted-foreground font-sans">150</p>
          <p className="text-sm text-muted-foreground font-sans">
            Highest Score
          </p>
          <p className="text-sm text-muted-foreground font-sans">148</p>
        </div>
      </div>
    </div>
  );
}

export default HeadToHead;
