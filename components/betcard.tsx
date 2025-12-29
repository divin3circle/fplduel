import { Bet } from "@/app/hooks/useBet";
import { CalendarIcon, CopyIcon } from "lucide-react";
import { toast } from "sonner";

function BetCard({ bet }: { bet: Bet }) {
  return (
    <div className="bg-background/10 rounded-2xl p-4 border border-foreground/20 flex flex-col gap-2 ">
      <div className="pb-2 border-b p-2 border-dashed border-foreground/20 flex items-center justify-between w-full">
        <p className="text-xs text-muted-foreground font-semibold">Bet ID</p>
        <p
          className="text-sm font-sans cursor-pointer flex hover:text-orange-500 ease-in duration-200 transition-all items-center gap-1"
          onClick={() => {
            navigator.clipboard.writeText(bet.id);
            toast.success("Bet ID copied to clipboard!");
          }}
        >
          {bet.id.slice(0, 4)} ... {bet.id.slice(-4)}
          <CopyIcon className="text-orange-500 cursor-pointer" size={14} />
        </p>
      </div>
      <div className="pb-2 border-b p-2 border-dashed border-foreground/20 flex items-center justify-between w-full">
        <p className="text-xs text-muted-foreground font-semibold">
          Transaction
        </p>
        <p
          className="text-sm font-sans cursor-pointer flex hover:text-orange-500 ease-in duration-200 transition-all items-center gap-1"
          onClick={() => {
            navigator.clipboard.writeText(bet.txn_hash);
            toast.success("Transaction hash copied to clipboard!");
          }}
        >
          {bet.txn_hash.slice(0, 4)} ... {bet.txn_hash.slice(-4)}
          <CopyIcon className="text-orange-500 cursor-pointer" size={14} />
        </p>
      </div>
      <div className="pb-2 border-b p-2 border-dashed border-foreground/20 flex items-center justify-between w-full">
        <p className="text-xs text-muted-foreground font-semibold">
          Bet Amount
        </p>
        <p className="text-sm font-sans cursor-pointer flex items-center gap-1">
          {bet.bet_amount.toFixed(2)}ℏ
        </p>
      </div>
      <div className="pb-2 p-2 flex items-center justify-between w-full">
        <p className="text-xs text-muted-foreground font-semibold">Date</p>
        <p className="text-sm font-sans cursor-pointer flex items-center gap-1">
          {new Date(bet.created_at).toLocaleDateString()}
          <CalendarIcon className="" size={14} />
        </p>
      </div>
    </div>
  );
}

export default BetCard;
