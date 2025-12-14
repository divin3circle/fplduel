import { ethers } from "hardhat";

/**
 * DEPLOYMENT SCRIPT
 * Deploys FPLMatchupBet to Hedera Testnet/Mainnet or Local Hardhat
 */

async function main() {
  console.log("\n🚀 Deploying FPLMatchupBet Contract...\n");

  const network = await ethers.provider.getNetwork();
  const networkName = network.name === "unknown" ? "hardhat" : network.name;
  console.log(`📡 Network: ${networkName} (Chain ID: ${network.chainId})`);

  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`👤 Deployer: ${deployer.address}`);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} HBAR\n`);

  // Default parameters (can be overridden by .env)
  // 100 HBAR default virtual pool for Team A/B, 50 for Draw
  const virtualPoolA = process.env.VIRTUAL_POOL_A ? BigInt(process.env.VIRTUAL_POOL_A) : ethers.parseEther("100");
  const virtualPoolDraw = process.env.VIRTUAL_POOL_DRAW ? BigInt(process.env.VIRTUAL_POOL_DRAW) : ethers.parseEther("50");
  const virtualPoolB = process.env.VIRTUAL_POOL_B ? BigInt(process.env.VIRTUAL_POOL_B) : ethers.parseEther("100");

  const bettingEnd = process.env.BETTING_END_TIMESTAMP
    ? parseInt(process.env.BETTING_END_TIMESTAMP)
    : Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // Default 7 days

  console.log("📋 Deployment Parameters:");
  console.log(`   Virtual Pool A: ${ethers.formatEther(virtualPoolA)} HBAR`);
  console.log(`   Virtual Pool Draw: ${ethers.formatEther(virtualPoolDraw)} HBAR`);
  console.log(`   Virtual Pool B: ${ethers.formatEther(virtualPoolB)} HBAR`);
  console.log(`   Betting End: ${new Date(bettingEnd * 1000).toISOString()}`);
  console.log(`   Betting End Timestamp: ${bettingEnd}\n`);

  console.log("⏳ Deploying contract...");
  const FPLMatchupBet = await ethers.getContractFactory("FPLMatchupBet");
  const contract = await FPLMatchupBet.deploy(
    bettingEnd,
    virtualPoolA,
    virtualPoolDraw,
    virtualPoolB
  );

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log(`✅ Contract deployed successfully!\n`);

  // Log Contract Info
  const explorerBase = networkName === "hederaMainnet" ? "https://hashscan.io/mainnet" : "https://hashscan.io/testnet";
  const explorerLink = `${explorerBase}/contract/${contractAddress}`;
  
  console.log("📄 Contract Information:");
  console.log(`   Address: ${contractAddress}`);
  console.log(`   Network: ${network.name}`);
  console.log(`   Chain ID: ${network.chainId}`);
  console.log(`   Explorer: ${explorerLink}\n`);

  // Verify Initial Odds
  console.log("🎲 Initial Odds:");
  try {
    const oddsA = await contract.getOdds(0);
    const oddsDraw = await contract.getOdds(1);
    const oddsB = await contract.getOdds(2);

    console.log(`   Team A: ${(Number(oddsA) / 1e18).toFixed(2)}`);
    console.log(`   Draw: ${(Number(oddsDraw) / 1e18).toFixed(2)}`);
    console.log(`   Team B: ${(Number(oddsB) / 1e18).toFixed(2)}\n`);
  } catch (error) {
    console.log("   ⚠️  Could not fetch initial odds\n");
  }

  // Save Deployment Info locally
  await saveDeploymentInfo(contractAddress, networkName, {
    deployer: deployer.address,
    bettingEnd,
    virtualPools: {
      teamA: ethers.formatEther(virtualPoolA),
      draw: ethers.formatEther(virtualPoolDraw),
      teamB: ethers.formatEther(virtualPoolB),
    },
    transactionHash: contract.deploymentTransaction()?.hash,
  });

  if (networkName.includes("hedera")) {
    console.log("\n📝 To verify on Hashscan:");
    console.log(`   npx hardhat verify --network ${networkName} ${contractAddress} ${bettingEnd} ${virtualPoolA} ${virtualPoolDraw} ${virtualPoolB}`);
  }

  console.log("\n✨ Deployment complete!\n");
}

// Helper: Save deployment info to file
async function saveDeploymentInfo(contractAddress: string, network: string, deploymentData: Record<string, any>) {
  const fs = await import("fs");
  const path = await import("path");

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const fileName = `${network}-${Date.now()}.json`;
  const filePath = path.join(deploymentsDir, fileName);

  const data = {
    network,
    contractAddress,
    timestamp: new Date().toISOString(),
    ...deploymentData,
  };

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`✅ Deployment info saved to: ${filePath}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
