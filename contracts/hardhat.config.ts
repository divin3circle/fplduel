import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import "hardhat-gas-reporter";
import "solidity-coverage";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hederaTestnet: {
      url: process.env.HEDERA_TESTNET_URL || "https://testnet.hashio.io/api",
      accounts: process.env.HEDERA_TESTNET_PRIVATE_KEY 
        ? [process.env.HEDERA_TESTNET_PRIVATE_KEY]
        : [],
      chainId: 296,
      gas: 3000000,
      gasPrice: 750000000000, // ~750 gwei - Hedera minimum
    },
    hederaMainnet: {
      url: process.env.HEDERA_MAINNET_URL || "https://mainnet.hashio.io/api",
      accounts: process.env.HEDERA_MAINNET_PRIVATE_KEY
        ? [process.env.HEDERA_MAINNET_PRIVATE_KEY]
        : [],
      chainId: 295,
      gas: 3000000,
      gasPrice: 750000000000, // ~750 gwei - Hedera minimum
    },
    hardhat: {
      chainId: 1337,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
  },
  etherscan: {
    apiKey: {
      hederaTestnet: process.env.HEDERA_CHAIN_ID || "testnet",
      hederaMainnet: process.env.HEDERA_CHAIN_ID || "mainnet",
    },
    customChains: [
      {
        network: "hederaTestnet",
        chainId: 296,
        urls: {
          apiURL: "https://server-verify.hashscan.io",
          browserURL: "https://hashscan.io/testnet",
        },
      },
      {
        network: "hederaMainnet",
        chainId: 295,
        urls: {
          apiURL: "https://server-verify.hashscan.io",
          browserURL: "https://hashscan.io/mainnet",
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
