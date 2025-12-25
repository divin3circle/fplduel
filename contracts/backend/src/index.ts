import express, { Application, Request, Response } from "express";
import { ethers } from "ethers";
import contractABI from "../../artifacts/contracts/FPLMatchupBet.sol/FPLMatchupBet.json";

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Configure provider - replace with your Hedera testnet RPC URL
const provider = new ethers.JsonRpcProvider(
  process.env.RPC_URL || "https://testnet.hashio.io/api"
);

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome FPL Duel Contract Server");
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
