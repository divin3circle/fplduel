import dotenv from "dotenv";
import express, { Application, Request, Response } from "express";
import { ethers } from "ethers";
import contractABI from "../../artifacts/contracts/FPLMatchupBet.sol/FPLMatchupBet.json";
import cors from "cors";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  })
);
app.use(express.json());

const provider = new ethers.JsonRpcProvider(
  process.env.RPC_URL || "https://testnet.hashio.io/api"
);

const wallet = new ethers.Wallet(getPrivateKey(), provider);

async function deployContract(
  bettingEnd: number,
  virtualPoolA: bigint,
  virtualPoolDraw: bigint,
  virtualPoolB: bigint
): Promise<{ contractAddress: string; transactionHash: string }> {
  console.log("\n🚀 Deploying FPLMatchupBet Contract...\n");

  const network = await provider.getNetwork();
  const networkName = network.name === "unknown" ? "hardhat" : network.name;
  console.log(`📡 Network: ${networkName} (Chain ID: ${network.chainId})`);

  const deployer = wallet;
  const balance = await provider.getBalance(deployer.address);
  console.log(`👤 Deployer: ${deployer.address}`);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} HBAR\n`);

  console.log("📋 Deployment Parameters:");
  console.log(`   Virtual Pool A: ${ethers.formatEther(virtualPoolA)} HBAR`);
  console.log(
    `   Virtual Pool Draw: ${ethers.formatEther(virtualPoolDraw)} HBAR`
  );
  console.log(`   Virtual Pool B: ${ethers.formatEther(virtualPoolB)} HBAR`);
  console.log(`   Betting End: ${new Date(bettingEnd * 1000).toISOString()}`);
  console.log(`   Betting End Timestamp: ${bettingEnd}\n`);

  console.log("⏳ Deploying contract...");
  const FPLMatchupBet = new ethers.ContractFactory(
    contractABI.abi,
    contractABI.bytecode,
    wallet
  );
  const contract = await FPLMatchupBet.deploy(
    bettingEnd,
    virtualPoolA,
    virtualPoolDraw,
    virtualPoolB
  );

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  const transactionHash = contract.deploymentTransaction()?.hash || "";

  console.log(`✅ Contract deployed successfully on ${networkName}!\n`);
  console.log(`   Address: ${contractAddress}`);
  console.log(`   Transaction: ${transactionHash}\n`);

  return { contractAddress, transactionHash };
}

function getPrivateKey(): string {
  try {
    const privateKey = process.env.HEDERA_TESTNET_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error(
        "Private key not found. Please set HEDERA_TESTNET_PRIVATE_KEY in your environment variables."
      );
    }
    return privateKey;
  } catch (error) {
    throw error;
  }
}

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome FPL Duel Contract Server");
});

app.post("/create", async (req: Request, res: Response) => {
  try {
    const { virtualPoolA, virtualPoolDraw, virtualPoolB, bettingEndTimestamp } =
      req.body;

    console.log("📝 Deploying new contract with parameters:", req.body);

    // Set default values if not provided
    const poolA = virtualPoolA
      ? ethers.parseEther(virtualPoolA.toString())
      : ethers.parseEther("100");
    const poolDraw = virtualPoolDraw
      ? ethers.parseEther(virtualPoolDraw.toString())
      : ethers.parseEther("50");
    const poolB = virtualPoolB
      ? ethers.parseEther(virtualPoolB.toString())
      : ethers.parseEther("100");
    const bettingEnd = bettingEndTimestamp
      ? parseInt(bettingEndTimestamp.toString())
      : Math.floor(Date.now() / 1000) + 5 * 24 * 60 * 60; // Default 5 days

    // Deploy the contract
    const { contractAddress, transactionHash } = await deployContract(
      bettingEnd,
      poolA,
      poolDraw,
      poolB
    );

    res.status(201).json({
      success: true,
      contractAddress,
      transactionHash,
      message: "Contract deployed successfully",
      bettingEnd: new Date(bettingEnd * 1000).toISOString(),
    });
  } catch (error) {
    console.error("Error deploying contract:", error);
    res.status(500).json({
      success: false,
      error: "Failed to deploy contract",
      details: error,
    });
  }
});

app.get("/odds/:contractAddress", async (req: Request, res: Response) => {
  try {
    const contractAddress = req.params.contractAddress;
    const contract = getContract(contractAddress);

    const oddsA = await contract.getOdds(0);
    const oddsDraw = await contract.getOdds(1);
    const oddsB = await contract.getOdds(2);

    res.status(200).json({
      teamA: (Number(oddsA) / 1e18).toFixed(2),
      draw: (Number(oddsDraw) / 1e18).toFixed(2),
      teamB: (Number(oddsB) / 1e18).toFixed(2),
    });
  } catch (error) {
    console.error("Error fetching odds:", error);
    res.status(500).json({ error: "Failed to fetch odds" });
  }
});

app.get("/state/:contractAddress", async (req: Request, res: Response) => {
  try {
    const contractAddress = req.params.contractAddress;
    const contract = getContract(contractAddress);

    const owner = await contract.owner();
    const bettingEnd = await contract.bettingEnd();
    const settled = await contract.settled();
    const totalPool = await contract.totalPool();

    res.status(200).json({
      owner: owner,
      bettingEnd: new Date(Number(bettingEnd) * 1000).toISOString(),
      settled: settled,
      totalPool: ethers.formatEther(totalPool),
    });
  } catch (error) {
    console.error("Failed to get contract state", error);
    res.status(500).json({ error: "Failed to fetch contract state" + error });
  }
});

app.get(
  "/claim/:userAddress/contract/:contractAddress",
  async (req: Request, res: Response) => {
    try {
      const userAddress = req.params.userAddress;
      const contractAddress = req.params.contractAddress;
      const contract = getContract(contractAddress);

      const claimableAmount = await contract.getClaimableAmount(userAddress);
      res.status(200).json({
        amount: ethers.formatEther(claimableAmount),
      });
    } catch (error) {
      console.log("Error getting claimable amount", error);
      res.status(500).json({
        error: "Error getting claimable amount. Try again later.",
      });
    }
  }
);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

function getContract(contractAddress: string) {
  return new ethers.Contract(contractAddress, contractABI.abi, provider);
}
