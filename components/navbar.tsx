"use client";
import Link from "next/link";
import { Button } from "./ui/button";
import { client, hederaChain } from "@/config/client.thirdweb";
import { Loader2 } from "lucide-react";
import {
  useActiveAccount,
  useConnect,
  useWalletBalance,
  useWalletDetailsModal,
} from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { useTheme } from "next-themes";

const ConnectedView = () => {
  const account = useActiveAccount();
  const { data: balance, isLoading } = useWalletBalance({
    client,
    chain: hederaChain,
    address: account?.address,
  });
  const shortAddress =
    account?.address.slice(0, 6) + "..." + account?.address.slice(-4);
  const formartBalance = (balance: string): string => {
    const balanceNumber = parseFloat(balance);
    const formattedBalance = balanceNumber / 10e8;
    return formattedBalance.toFixed(2).toString();
  };
  return (
    <div className="rounded-2xl flex items-center justify-center font-sans gap-2 font-semibold text-sm shadow-none lowercase w-full">
      <p className="text-xs truncate">{shortAddress}</p>
      {isLoading ? (
        <Loader2 className="animate-spin" size="10" />
      ) : (
        <p className="text-xs text-foreground/50 truncate">
          {formartBalance(balance?.displayValue || "0")}ℏ
        </p>
      )}
    </div>
  );
};

function Navbar() {
  const { connect, isConnecting } = useConnect();
  const activeAccount = useActiveAccount();
  const detailsModal = useWalletDetailsModal();
  const { theme } = useTheme();

  return (
    <div className="mt-2 flex items-center justify-between mx-2">
      <Link href="/" className="flex items-center gap-2">
        <h1 className="text-2xl font-bold font-sans lowercase">FPLDuel</h1>
      </Link>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className="rounded-2xl font-sans font-semibold text-sm shadow-none lowercase w-auto md:w-[150px]"
        >
          Login
        </Button>
        <button
          onClick={() => {
            if (activeAccount) {
              detailsModal.open({
                client,
                theme: theme === "light" ? "light" : "dark",
              });
            } else {
              connect(async () => {
                // create a wallet instance
                const metamask = createWallet("io.metamask"); // autocomplete the wallet id
                // trigger the connection
                await metamask.connect({ client });
                // return the wallet
                return metamask;
              });
            }
          }}
          className="rounded-2xl font-sans font-semibold text-sm shadow-none lowercase w-auto md:w-[150px] border border-foreground/20 p-2"
        >
          {isConnecting && <Loader2 className="animate-spin" />}
          {activeAccount && <ConnectedView />}
          {!activeAccount && "Connect"}
        </button>
      </div>
    </div>
  );
}

export default Navbar;
