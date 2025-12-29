import Matchups from "@/components/matchups";
import Navbar from "@/components/navbar";
import Link from "next/link";
import { ChevronsLeft } from "lucide-react";

function MatchupsPage() {
  return (
    <div className="max-w-7xl mx-auto px-2">
      <Navbar />
      <div className="my-4">
        <Link
          href={`/`}
          className="flex items-center text-sm font-semibold font-sans text-muted-foreground hover:text-foreground transition-all duration-200 group"
        >
          <ChevronsLeft className="w-4 h-4 ml-2 group-hover:-translate-x-0.5 transition-all duration-200" />
          Back to Home
        </Link>
      </div>
      <Matchups />
    </div>
  );
}

export default MatchupsPage;
