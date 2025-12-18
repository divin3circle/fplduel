"use client";
import Navbar from "@/components/navbar";
import Link from "next/link";
import { ChevronsLeft } from "lucide-react";
import { useParams } from "next/navigation";

function PlayerPage() {
  const { id } = useParams();
  return (
    <div className="max-w-7xl mx-auto px-2">
      <Navbar />
      <div className="my-4">
        <Link
          href="/matchup"
          className="text-sm font-semibold font-sans text-muted-foreground hover:text-foreground transition-all duration-200 group"
        >
          <ChevronsLeft className="w-4 h-4 ml-2 group-hover:translate-x-[-2px] transition-all duration-200" />
          Back to Matchups
        </Link>
      </div>
      <div className="my-4">
        <p className="text-base font-semibold font-sans">Player {id}</p>
      </div>
    </div>
  );
}

export default PlayerPage;
