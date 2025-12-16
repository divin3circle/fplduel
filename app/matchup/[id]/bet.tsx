import { getTeamLogo } from "@/components/matchupcard";
import { Matchup } from "@/lib/utils";
import Image from "next/image";

function Bet({ matchup }: { matchup: Matchup }) {
  return (
    <div className="w-full bg-foreground/5 rounded-2xl mt-4 p-4">
      <h1 className="text-base font-semibold font-sans">Bet</h1>
      <p className="text-sm text-muted-foreground font-sans">
        Bet on the outcome of the game
      </p>
      <div className="flex items-center justify-between mt-4 gap-2">
        <div className="flex items-center justify-between rounded-xl px-2 py-2 w-[37%] border border-foreground/20 dark:border-foreground/10 cursor-pointer hover:bg-foreground/5 transition-all duration-200">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold font-sans">1</p>
            <Image
              src={getTeamLogo(matchup.home.id, "home")}
              alt={matchup.home.name}
              width={20}
              height={20}
              className="w-6 h-6 rounded-md object-cover"
            />
          </div>
          <p className="text-base font-semibold font-sans">2.50</p>
        </div>
        <div className="flex items-center justify-between rounded-xl px-2 py-2 w-1/4 border border-foreground/20 dark:border-foreground/10 cursor-pointer hover:bg-foreground/5 transition-all duration-200">
          <p className="text-sm font-semibold font-sans">x</p>
          <p className="text-base font-semibold font-sans">8.45</p>
        </div>
        <div className="flex items-center justify-between rounded-xl px-2 py-2 w-[37%] border border-foreground/20 dark:border-foreground/10 cursor-pointer hover:bg-foreground/5 transition-all duration-200">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold font-sans">2</p>
            <Image
              src={getTeamLogo(matchup.away.id, "away")}
              alt={matchup.away.name}
              width={20}
              height={20}
              className="w-6 h-6 rounded-md object-cover"
            />
          </div>
          <p className="text-base font-semibold font-sans">2.50</p>
        </div>
      </div>
    </div>
  );
}

export default Bet;
