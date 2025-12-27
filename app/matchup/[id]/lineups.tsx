"use client";
import { useFormation } from "@/app/hooks/useLineups";
import { getTeams, Matchup } from "@/app/hooks/useMatchups";
import {
  useGetPlayerByCode,
  useGetPlayerImageUrl,
} from "@/app/hooks/usePlayers";
import { getTeamLogo } from "@/components/matchupcard";
import { getFormation, Lineup, SAMPLE_LINEUP, Team } from "@/lib/utils";
import { Loader2 } from "lucide-react";
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
  const { imageUrl, isLoading: isLoadingImage } = useGetPlayerImageUrl(
    player.element
  );
  const { player: playerData, error } = useGetPlayerByCode(player.element);

  const handleClick = () => {
    router.push(`/player/${player.element}`);
  };
  const displayName = (name: string) => {
    if (isSubstitute) {
      return name;
    }
    if (name.length > 8) {
      return name.slice(0, 8) + "...";
    }
    return name;
  };
  return (
    <div
      onClick={handleClick}
      className={`flex relative ${
        isSubstitute ? "flex-col" : "flex-row"
      } gap-1 h-30 items-center rounded-md cursor-pointer hover:bg-foreground/10 transition-all duration-200 hover:scale-95`}
    >
      {isLoadingImage ? (
        <Image
          src={"/sample.webp"}
          alt="Player"
          width={100}
          height={100}
          className={`w-10 h-10 object-cover rounded-t-md ${
            isSubstitute
              ? "rotate-0 w-auto h-auto"
              : "rotate-270 md:w-12 md:h-12 "
          }`}
        />
      ) : (
        <Image
          src={imageUrl || "/sample.webp"}
          alt="Player"
          width={100}
          height={100}
          className={`w-10 h-10 object-contain rounded-t-md ${
            isSubstitute
              ? "rotate-0 w-auto h-20 "
              : "rotate-270 md:w-12 md:h-12 "
          }`}
        />
      )}
      {player.is_captain && (
        <div className="absolute right-1/2 top-0 bg-black rounded-full w-4 h-4 rotate-270">
          <p className="text-xs font-semibold font-sans text-center ">C</p>
        </div>
      )}
      <div
        className={`flex ${
          isSubstitute ? "rotate-0 flex-row p-1" : "rotate-270 flex-col"
        }`}
      >
        <p className="text-xs font-semibold font-sans text-center">
          {playerData
            ? displayName(playerData.web_name)
            : error
            ? "Error"
            : "Loading..."}
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

const PitchView = ({ managerId }: { managerId: number }) => {
  const { formation, isLoading, error } = useFormation(managerId);
  if (isLoading) {
    return (
      <div className="w-full h-150 md:h-full bg-foreground/5 rounded-2xl flex items-center justify-center">
        <Loader2 />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-150 md:h-full bg-foreground/5 rounded-2xl flex items-center justify-center">
        <p className="text-sm font-sans text-red-500 text-center">
          {error.message}
        </p>
      </div>
    );
  }

  if (!formation) {
    return (
      <div className="w-full h-150 md:h-full bg-foreground/5 rounded-2xl flex items-center justify-center">
        <p className="text-sm font-sans text-center">
          No Formation found for manager {managerId}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-150 md:h-full bg-foreground/5 rounded-2xl">
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
          <div
            className={`flex flex-col items-center h-3/4 ${
              formation.forwards.length > 1
                ? "justify-between"
                : "justify-center"
            }`}
          >
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
  console.log("Rendering TeamView for", teamType, team);
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
      </div>
      <div className="mt-2 md:h-[90%]">
        <PitchView managerId={team.entry} />
        <p className="text-sm font-semibold font-sans mt-4 mb-1">Substitutes</p>
        <SubstituteView />
      </div>
    </div>
  );
};

function Lineups({ matchup }: { matchup: Matchup }) {
  const teams = getTeams(matchup);
  console.log(matchup);
  return (
    <div className="w-full bg-foreground/5 rounded-2xl mt-4 flex items-center justify-between flex-col md:flex-row">
      <TeamView team={teams.home} teamType="home" />
      <TeamView team={teams.away} teamType="away" />
    </div>
  );
}

export default Lineups;
