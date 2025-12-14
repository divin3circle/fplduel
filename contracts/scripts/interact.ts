import { ethers } from "hardhat";

/**
 * INTERACTIVE TEST SCRIPT
 * Tests getOdds() and bet() functions on the deployed contract
 */

// ⚠️ UPDATE THIS WITH YOUR CONTRACT ADDRESS
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "0x8ed868ac2d4FD5b1CEAbcB4617F81d93EeECa6cE";

async function main() {
  console.log("\n🧪 Testing FPL Matchup Contract\n");
  console.log("═══════════════════════════════════════════════════\n");

  const [deployer] = await ethers.getSigners();
  
  console.log("📡 Network & Accounts:");
  const network = await ethers.provider.getNetwork();
  console.log(`   Network: ${network.name} (Chain ID: ${network.chainId})`);
  console.log(`   Deployer: ${deployer.address}`);
  
  console.log(`🔗 Connecting to contract: ${CONTRACT_ADDRESS}\n`);
  const contract = await ethers.getContractAt("FPLMatchupBet", CONTRACT_ADDRESS);

  // 1. Check Contract State
  console.log("═══════════════════════════════════════════════════");
  console.log("TEST 1: Contract State\n");

  const owner = await contract.owner();
  const bettingEnd = await contract.bettingEnd();
  const settled = await contract.settled();
  const totalPool = await contract.totalPool();

  console.log("   Owner:", owner);
  console.log("   Betting End:", new Date(Number(bettingEnd) * 1000).toISOString());
  console.log("   Settled:", settled);
  console.log("   Total Pool:", ethers.formatEther(totalPool), "HBAR");
  console.log("   Status:", settled ? "❌ SETTLED" : "✅ ACTIVE\n");

  // 2. Get Current Odds
  console.log("═══════════════════════════════════════════════════");
  console.log("TEST 2: Get Current Odds\n");

  const oddsA = await contract.getOdds(0);
  const oddsDraw = await contract.getOdds(1);
  const oddsB = await contract.getOdds(2);

  console.log(`   Team A: ${(Number(oddsA) / 1e18).toFixed(2)}`);
  console.log(`   Draw:   ${(Number(oddsDraw) / 1e18).toFixed(2)}`);
  console.log(`   Team B: ${(Number(oddsB) / 1e18).toFixed(2)}\n`);

  // 3. Place Bet
  console.log("═══════════════════════════════════════════════════");
  console.log("TEST 3: Place Test Bet\n");

  const betAmount = ethers.parseEther("1"); // 1 HBAR
  const outcome = 0; // Bet on Team A

  console.log(`   Placing bet: ${ethers.formatEther(betAmount)} HBAR on outcome ${outcome} (Team A)...`);

  try {
    const tx = await contract.bet(outcome, { value: betAmount });
    console.log("   Transaction sent:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("   ✅ Transaction confirmed! (Gas Used: " + receipt?.gasUsed.toString() + ")\n");

    const betEvent = receipt?.logs.find((log: any) => {
      try { return contract.interface.parseLog(log)?.name === "BetPlaced"; } catch { return false; }
    });

    if (betEvent) {
      const parsed = contract.interface.parseLog(betEvent);
      console.log("   📢 Event: BetPlaced");
      console.log("      Bettor:", parsed?.args[0]);
      console.log("      Amount:", ethers.formatEther(parsed?.args[2]), "HBAR\n");
    }

  } catch (error: any) {
    console.log("   ❌ Bet failed!", error.message, "\n");
  }

  // 4. Updated Odds
  console.log("═══════════════════════════════════════════════════");
  console.log("TEST 4: Updated Odds (After Bet)\n");

  const newOddsA = await contract.getOdds(0);
  const newOddsDraw = await contract.getOdds(1);
  const newOddsB = await contract.getOdds(2);

  console.log(`   Team A: ${(Number(newOddsA) / 1e18).toFixed(2)} (was ${(Number(oddsA) / 1e18).toFixed(2)})`);
  console.log(`   Draw:   ${(Number(newOddsDraw) / 1e18).toFixed(2)}`);
  console.log(`   Team B: ${(Number(newOddsB) / 1e18).toFixed(2)}\n`);

  // 5. Pool State
  console.log("═══════════════════════════════════════════════════");
  console.log("TEST 5: Pool State\n");

  const poolA = await contract.poolA();
  const poolDraw = await contract.poolDraw();
  const poolB = await contract.poolB();
  const newTotalPool = await contract.totalPool();

  console.log("   Pool A:    ", ethers.formatEther(poolA), "HBAR");
  console.log("   Pool Draw: ", ethers.formatEther(poolDraw), "HBAR");
  console.log("   Pool B:    ", ethers.formatEther(poolB), "HBAR");
  console.log("   Total Pool:", ethers.formatEther(newTotalPool), "HBAR\n");

  // 6. User Info
  console.log("═══════════════════════════════════════════════════");
  console.log("TEST 6: User Bet Information\n");

  const userOutcome = await contract.userOutcome(deployer.address);
  const userAmount = await contract.userAmount(deployer.address);

  console.log("   Your Address:", deployer.address);
  console.log("   Your Outcome:", userOutcome.toString(), userOutcome > 0 ? `(${['Team A', 'Draw', 'Team B'][Number(userOutcome) - 1]})` : "(No bet)");
  console.log("   Your Stake:  ", ethers.formatEther(userAmount), "HBAR\n");

  // 7. Settle Contract (Only works if betting ended)
  console.log("═══════════════════════════════════════════════════");
  console.log("TEST 7: Settle Contract\n");

  const currentTime = Math.floor(Date.now() / 1000);
  if (currentTime >= Number(bettingEnd) && !settled) {
    console.log("   ⏳ Betting ended, attempting settlement...");
    try {
      // Simulate Team A winning (outcome 0)
      const tx = await contract.settle(0);
      console.log("   Settlement sent:", tx.hash);
      await tx.wait();
      console.log("   ✅ Contract Settled! Winner: Team A\n");
    } catch (error: any) {
      console.log("   ❌ Settlement failed:", error.message, "\n");
    }
  } else {
    console.log("   ⏭️  Skipping settlement (Betting period active or already settled)");
    console.log(`      Current Time: ${currentTime}`);
    console.log(`      Betting End:  ${bettingEnd}\n`);
  }

  // 8. Claim Winnings
  console.log("═══════════════════════════════════════════════════");
  console.log("TEST 8: Claim Winnings\n");

  const isSettledNow = await contract.settled();
  if (isSettledNow) {
    const winner = await contract.winner();
    const myOutcome = await contract.userOutcome(deployer.address);
    // userOutcome is 1-based (0=no bet, 1=Team A, 2=Draw, 3=Team B)
    // winner is 0-based
    
    if (myOutcome > 0 && (myOutcome - BigInt(1)) === BigInt(winner)) {
      console.log("   💰 You won! Claiming payout...");
      try {
        const tx = await contract.claim();
        console.log("   Claim sent:", tx.hash);
        const receipt = await tx.wait();
        
        const claimEvent = receipt?.logs.find((log: any) => {
            try { return contract.interface.parseLog(log)?.name === "Claimed"; } catch { return false; }
        });
        
        if (claimEvent) {
            const parsed = contract.interface.parseLog(claimEvent);
            // HEDERA FIX: Event amounts are in tinybars (8 decimals)
            console.log("   ✅ Claimed:", ethers.formatUnits(parsed?.args[1], 8), "HBAR\n");
        } else {
            console.log("   ✅ Claim transaction confirmed!\n");
        }

      } catch (error: any) {
        console.log("   ❌ Claim failed:", error.message, "\n");
      }
    } else {
      console.log("   Typical FPL luck... You didn't win this time.");
      console.log(`   Winner: ${winner}, Your Pick: ${myOutcome > 0 ? myOutcome - BigInt(1) : "None"}\n`);
    }
  } else {
    console.log("   ⏭️  Skipping claim (Contract not settled)\n");
  }

  console.log("═══════════════════════════════════════════════════\n");
  console.log("✨ All Tests Complete!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Testing failed:", error);
    process.exit(1);
  });
