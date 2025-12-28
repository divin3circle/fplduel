import { createThirdwebClient, defineChain } from "thirdweb";
import { currentNetwork } from "./network.thirdweb";

const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;

if (!clientId) {
  throw new Error("CLIENT_ID must be set");
}

export const client = createThirdwebClient({
  clientId,
});

export const hederaChain = defineChain({
  id: currentNetwork.chainId,
  name: currentNetwork.name,
  rpc: currentNetwork.rpcUrl,
  nativeCurrency: {
    name: "hbar",
    symbol: "HBAR",
    decimals: 8,
  },
  rpcUrls: {
    default: { http: [currentNetwork.rpcUrl] },
  },
  blockExplorers: {
    default: {
      name: "Hashscan",
      url: currentNetwork.hashscanUrl,
    },
  },
  testnet: currentNetwork.isTestnet,
  chainId: currentNetwork.chainId,
  networkId: currentNetwork.networkId,
});

export const hederaTestnet = hederaChain;
