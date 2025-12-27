import { Matchup } from "@/app/hooks/useMatchups";
import { getTeamLogo } from "@/components/matchupcard";
import Image from "next/image";
import Link from "next/link";

function Header({ matchup }: { matchup: Matchup }) {
  return (
    <div className="w-full bg-foreground/5 rounded-2xl mt-4 p-4">
      <div className="w-full flex items-center justify-between">
        <p className="text-sm font-sans">Gameweek 17</p>
        <p className="text-sm font-sans hover:text-orange-500 cursor-pointer hover:underline">
          {matchup.contract_address.slice(0, 6)}...
          {matchup.contract_address.slice(-4)}
        </p>
        <Link
          href={`https://hashscan.io/testnet/contract/${matchup.contract_address}`}
          className="rounded-3xl border border-foreground/20 p-2 text-center font-sans font-semibold text-sm shadow-none lowercase w-auto md:w-37.5"
        >
          View Contract
        </Link>
      </div>
      <div className="flex items-center justify-center mt-4">
        <div className="flex flex-col-reverse md:flex-row gap-2 items-center justify-center">
          <h1 className="text-base md:text-2xl font-semibold font-sans">
            {matchup.home_team_name}
          </h1>
          <Image
            src={getTeamLogo(matchup.assigned_home_team_id, "home")}
            alt={matchup.home_team_name}
            width={100}
            height={100}
            className="w-10 h-10 rounded-md object-cover"
          />
        </div>
        <p className="md:text-4xl text-2xl mx-10"> - </p>
        <div className="flex flex-col-reverse md:flex-row gap-2 items-center justify-center">
          <h1 className="text-base md:text-2xl font-semibold font-sans">
            {matchup.away_team_name}
          </h1>
          <Image
            src={getTeamLogo(matchup.assigned_away_team_id, "away")}
            alt={matchup.away_team_name}
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
