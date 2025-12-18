import { formatValue, getTeamLogo } from "@/components/matchupcard";
import { Matchup, Team } from "@/lib/utils";
import Image from "next/image";

const PitchView = () => {
  return (
    <div className="w-full h-[600px] md:h-full bg-foreground/5 rounded-2xl p-4">
      <Image
        src="/pitch.png"
        alt="Pitch"
        width={1000}
        height={1000}
        className="w-full h-full object-cover rounded-md hidden md:block"
      />
      <Image
        src="/pitch2.png"
        alt="Pitch"
        width={1000}
        height={1000}
        className="w-full h-full object-cover rounded-md block md:hidden"
      />
    </div>
  );
};

const TeamView = ({
  team,
  teamType,
}: {
  team: Team;
  teamType: "home" | "away";
}) => {
  return (
    <div className="w-full md:w-1/2 h-auto md:h-full p-4">
      <div className="flex items-center gap-4 border-b border-foreground/20 pb-2">
        <div className="flex items-center gap-1">
          <Image
            src={getTeamLogo(team.id, teamType)}
            alt={team.name}
            width={20}
            height={20}
            className="w-6 h-6 rounded-md object-cover"
          />
          <p className="text-sm font-semibold font-sans">{team.name}</p>
        </div>
        <p className="text-sm font-semibold font-sans">Last Points: 102</p>
        <div className="flex items-center justify-center w-18 h-6 bg-foreground/10 rounded-md">
          <p className="text-sm font-semibold font-sans">
            {formatValue(team.value_with_bank)}
          </p>
        </div>
      </div>
      <div className="mt-2 md:h-[90%]">
        <PitchView />
      </div>
    </div>
  );
};

function Lineups({ matchup }: { matchup: Matchup }) {
  return (
    <div className="w-full bg-foreground/5 rounded-2xl mt-4 md:h-[500px] flex items-center justify-between flex-col md:flex-row">
      <TeamView team={matchup.home} teamType="home" />
      <TeamView team={matchup.away} teamType="away" />
    </div>
  );
}

export default Lineups;
