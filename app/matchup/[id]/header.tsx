import { getTeamLogo } from "@/components/matchupcard";
import { Button } from "@/components/ui/button";
import { Matchup } from "@/lib/utils";
import Image from "next/image";

function Header({ matchup }: { matchup: Matchup }) {
  const contract = "0x5AD5BaaE06F41f2cE4DDc193C46Ae04439B159ba";
  return (
    <div className="w-full bg-foreground/5 rounded-2xl mt-4 p-4">
      <div className="w-full flex items-center justify-between">
        <p className="text-sm font-sans">Gameweek 17</p>
        <p className="text-sm font-sans hover:text-orange-500 cursor-pointer hover:underline">
          {contract.slice(0, 6)}...{contract.slice(-4)}
        </p>
        <Button
          variant="outline"
          className="rounded-2xl font-sans font-semibold text-sm shadow-none lowercase w-auto md:w-[150px]"
        >
          View Contract
        </Button>
      </div>
      <div className="flex items-center justify-center mt-4">
        <div className="flex flex-col-reverse md:flex-row gap-2 items-center justify-center">
          <h1 className="text-base md:text-2xl font-semibold font-sans">
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
        <p className="md:text-4xl text-2xl mx-10"> - </p>
        <div className="flex flex-col-reverse md:flex-row gap-2 items-center justify-center">
          <h1 className="text-base md:text-2xl font-semibold font-sans">
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
      <div className="flex flex-col md:flex-row md:items-center gap-1 justify-between mt-6">
        <p className="text-sm text-foreground/70 font-sans font-semibold md:text-center">
          Deadline: December 15, 2025
        </p>
        <p className="text-sm text-foreground/70 font-sans font-semibold md:text-center">
          Bet Volume: 1.79M ℏbar ($212,500 )
        </p>
      </div>
    </div>
  );
}

export default Header;
