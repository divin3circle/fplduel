"use client";
import Navbar from "@/components/navbar";
import fplBg from "@/public/fpl-banner.webp";
import { useState } from "react";
import { GiftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Matchups from "@/components/matchups";

export default function Home() {
  const [tab, setTab] = useState<"highlights" | "history" | "live">(
    "highlights"
  );
  return (
    <div className="max-w-7xl mx-auto px-2">
      <Navbar />
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2 md:gap-4">
          <div
            className={`${
              tab === "highlights"
                ? "text-primary font-semibold border-b-2 border-primary"
                : "text-foreground/70"
            } cursor-pointer`}
            onClick={() => setTab("highlights")}
          >
            <p className="font-sans text-lg">Highlights</p>
          </div>
          <div
            className={`${
              tab === "history"
                ? "text-primary font-semibold border-b-2 border-primary"
                : "text-foreground/70"
            } cursor-pointer`}
            onClick={() => setTab("history")}
          >
            <p className="font-sans text-lg">History</p>
          </div>
          <div
            className={`${
              tab === "live"
                ? "text-primary font-semibold border-b-2 border-primary"
                : "text-foreground/70"
            } cursor-pointer`}
            onClick={() => setTab("live")}
          >
            <p className="font-sans text-lg">Live</p>
          </div>
        </div>
      </div>
      <div
        className="w-full relative h-100 rounded-2xl bg-background/10 mt-4"
        style={{
          backgroundImage: `url(${fplBg.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute top-0 left-0 w-full h-full bg-black/10 rounded-2xl"></div>
        <div className="absolute top-0 left-0 w-full h-full flex flex-col items-start justify-between px-2">
          <div className="p-4 flex flex-col gap-2">
            <GiftIcon className="w-10 h-10 text-green-500" />
            <h1 className="font-semibold text-2xl bg-green-500 w-fit px-2 py-1 rounded-md text-black font-sans rotate-3 hover:rotate-0 transition-all duration-300">
              FREE 100ℏ
            </h1>
            <p className="text-5xl md:text-6xl uppercase font-sans text-white font-bold w-full max-w-md">
              After your first bet.
            </p>
          </div>
          <div className="">
            <p className="text-base font-sans text-white font-semibold w-full max-w-md p-4">
              Bet Peer-to-Peer on Top FPL Teams and Leagues. Trustless,
              Transparent, on Hedera Blockchain
            </p>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-2 p-4 w-full md:w-1/2">
            <Button
              variant="default"
              className="rounded-2xl font-sans font-semibold text-sm shadow-none w-full md:w-auto min-w-37.5"
            >
              <p>Get Started</p>
            </Button>
            <Link
              href="/"
              className="text-gray-300 font-semibold hover:underline font-sans "
            >
              Terms and Conditions
            </Link>
          </div>
        </div>
      </div>
      <Matchups />
    </div>
  );
}
