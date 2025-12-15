/**
 * Hedera Network Configuration
 * Configure via NEXT_PUBLIC_HEDERA_NETWORK environment variable
 * Options: "testnet" | "mainnet"
 * Default: "testnet"
 */

export type HederaNetwork = "testnet" | "mainnet";

export const HEDERA_NETWORK: HederaNetwork =
  (process.env.NEXT_PUBLIC_HEDERA_NETWORK as HederaNetwork) || "testnet";

export const NETWORK_CONFIG = {
  testnet: {
    name: "Hedera Testnet",
    chainId: 296,
    networkId: 296,
    rpcUrl: "https://testnet.hashio.io/api",
    mirrorNodeUrl: "https://testnet.mirrornode.hedera.com/api/v1",
    hashscanUrl: "https://hashscan.io/testnet",
    isTestnet: true,
  },
  mainnet: {
    name: "Hedera Mainnet",
    chainId: 295,
    networkId: 295,
    rpcUrl: "https://mainnet.hashio.io/api",
    mirrorNodeUrl: "https://mainnet.mirrornode.hedera.com/api/v1",
    hashscanUrl: "https://hashscan.io/mainnet",
    isTestnet: false,
  },
} as const;

export const currentNetwork = NETWORK_CONFIG[HEDERA_NETWORK];

export function getMirrorNodeUrl(path: string = ""): string {
  return `${currentNetwork.mirrorNodeUrl}${path}`;
}

export function getHashscanUrl(path: string = ""): string {
  return `${currentNetwork.hashscanUrl}${path}`;
}

export function getRpcUrl(): string {
  return currentNetwork.rpcUrl;
}
