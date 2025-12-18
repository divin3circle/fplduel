import { Matchup } from "@/lib/utils";
import Link from "next/link";
import React from "react";

function AIComparisons({ matchup }: { matchup: Matchup }) {
  return (
    <div className="w-full bg-foreground/5 rounded-2xl mt-4 p-4">
      <h1 className="text-base font-semibold font-sans">AI Comparisons</h1>
      <p className="text-sm text-muted-foreground font-sans">
        This is what Azure AI says about the two teams in this matchup.
      </p>
      <div className="my-4">
        <h1 className="text-sm font-semibold font-sans">Home Team</h1>
        <p className="text-sm text-muted-foreground font-sans md:max-w-1/2 leading-relaxed">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam,
          quos. Lorem ipsum dolor sit amet consectetur adipisicing elit.
          Quisquam,
        </p>
        <h1 className="text-sm font-semibold font-sans mt-4">Away Team</h1>
        <p className="text-sm text-muted-foreground font-sans md:max-w-1/2 leading-relaxed">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam,
          quos. Lorem ipsum dolor sit amet consectetur adipisicing elit.
          Quisquam,
        </p>
      </div>
      <p className="text-xs text-muted-foreground font-sans">
        AI Generated content might be inaccurate or incomplete.
        <Link
          href="https://azure.microsoft.com/en-us/products/ai-services/openai-service"
          className="text-blue-500 hover:text-blue-600 ml-1"
        >
          Learn more
        </Link>
      </p>
    </div>
  );
}

export default AIComparisons;
