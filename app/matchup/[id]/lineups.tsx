"use client";
import { formatValue, getTeamLogo } from "@/components/matchupcard";
import {
  getFormation,
  Lineup,
  Matchup,
  SAMPLE_LINEUP,
  Team,
} from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";

const PlayerView = ({
  player,
  isSubstitute,
}: {
  player: Lineup;
  isSubstitute?: boolean;
}) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/player/${player.element}`);
  };
  return (
    <div
      onClick={handleClick}
      className={`flex relative ${
        isSubstitute ? "flex-col" : "flex-row"
      } gap-1 items-center rounded-md bg-foreground/5 cursor-pointer hover:bg-foreground/10 transition-all duration-200 hover:scale-95 backdrop-blur-2xl border border-foreground/20 dark:border-foreground/10`}
    >
      <Image
        src="/sample.webp"
        alt="Player"
        width={100}
        height={100}
        className={`w-10 h-10 object-cover rounded-t-md ${
          isSubstitute
            ? "rotate-0 w-auto h-auto"
            : "rotate-270 md:w-12 md:h-12 "
        }`}
      />
      {player.is_captain && (
        <div className="absolute right-1/2 top-0 bg-black rounded-full w-4 h-4 rotate-270">
          <p className="text-xs font-semibold font-sans text-center ">C</p>
        </div>
      )}
      <div
        className={`flex ${
          isSubstitute ? "rotate-0 flex-row" : "rotate-270 flex-col"
        } p-1`}
      >
        <p className="text-xs font-semibold font-sans text-center">
          {player.position}
        </p>
      </div>
    </div>
  );
};

const SubstituteView = () => {
  const formation = getFormation(SAMPLE_LINEUP);
  return (
    <div className="flex items-center justify-around gap-1">
      {formation.substitutes.map((substitute) => (
        <PlayerView key={substitute.element} player={substitute} isSubstitute />
      ))}
    </div>
  );
};

const PitchView = () => {
  const formation = getFormation(SAMPLE_LINEUP);

  return (
    <div className="w-full h-[600px] md:h-full bg-foreground/5 rounded-2xl">
      <div className="relative w-full h-full hidden md:block">
        <Image
          src="/pitch.png"
          alt="Pitch"
          width={1000}
          height={1000}
          className="w-full h-full object-cover rounded-md"
        />
        <div className="absolute inset-0 flex items-center justify-around">
          <div className="flex flex-col justify-center items-center h-full">
            <PlayerView player={formation.goalkeeper} />
          </div>
          <div className="flex flex-col justify-between items-center h-[75%]">
            {formation.defenders.map((defender) => (
              <PlayerView key={defender.element} player={defender} />
            ))}
          </div>
          <div className="flex flex-col justify-between items-center h-3/4">
            {formation.midfielders.map((midfielder) => (
              <PlayerView key={midfielder.element} player={midfielder} />
            ))}
          </div>
          <div className="flex flex-col justify-between items-center h-3/4">
            {formation.forwards.map((forward) => (
              <PlayerView key={forward.element} player={forward} />
            ))}
          </div>
        </div>
      </div>
      <div className="relative w-full h-full md:hidden">
        <Image
          src="/pitch2.png"
          alt="Pitch"
          width={1000}
          height={1000}
          className="w-full h-full object-cover rounded-md"
        />
        <div className="absolute inset-0 flex items-center justify-between rotate-270">
          <div className="flex flex-col justify-center items-center h-full">
            <PlayerView player={formation.goalkeeper} />
          </div>
          <div className="flex flex-col justify-between items-center h-[55%]">
            {formation.defenders.map((defender) => (
              <PlayerView key={defender.element} player={defender} />
            ))}
          </div>
          <div className="flex flex-col justify-between items-center h-[55%]">
            {formation.midfielders.map((midfielder) => (
              <PlayerView key={midfielder.element} player={midfielder} />
            ))}
          </div>
          <div className="flex flex-col justify-between items-center h-[55%]">
            {formation.forwards.map((forward) => (
              <PlayerView key={forward.element} player={forward} />
            ))}
          </div>
        </div>
      </div>
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
        <p className="text-sm font-semibold font-sans mt-4 mb-1">Substitutes</p>
        <SubstituteView />
      </div>
    </div>
  );
};

function Lineups({ matchup }: { matchup: Matchup }) {
  return (
    <div className="w-full bg-foreground/5 rounded-2xl mt-4 flex items-center justify-between flex-col md:flex-row">
      <TeamView team={matchup.home} teamType="home" />
      <TeamView team={matchup.away} teamType="away" />
    </div>
  );
}

export default Lineups;
