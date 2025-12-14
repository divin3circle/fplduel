import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { FPLMatchupBet } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("FPLMatchupBet", function () {
  let contract: FPLMatchupBet;
  let owner: SignerWithAddress;
  let bettor1: SignerWithAddress;
  let bettor2: SignerWithAddress;
  let bettor3: SignerWithAddress;

  const VIRTUAL_POOL_A = ethers.parseEther("100");
  const VIRTUAL_POOL_DRAW = ethers.parseEther("50");
  const VIRTUAL_POOL_B = ethers.parseEther("100");
  const ONE_WEEK = 7 * 24 * 60 * 60;

  beforeEach(async function () {
    [owner, bettor1, bettor2, bettor3] = await ethers.getSigners();

    const currentTime = await time.latest();
    const bettingEnd = currentTime + ONE_WEEK;

    const FPLMatchupBet = await ethers.getContractFactory("FPLMatchupBet");
    contract = await FPLMatchupBet.deploy(
      bettingEnd,
      VIRTUAL_POOL_A,
      VIRTUAL_POOL_DRAW,
      VIRTUAL_POOL_B
    );
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await contract.owner()).to.equal(owner.address);
    });

    it("Should set correct virtual pools", async function () {
      expect(await contract.virtualPoolA()).to.equal(VIRTUAL_POOL_A);
      expect(await contract.virtualPoolDraw()).to.equal(VIRTUAL_POOL_DRAW);
      expect(await contract.virtualPoolB()).to.equal(VIRTUAL_POOL_B);
      expect(await contract.virtualTotal()).to.equal(
        VIRTUAL_POOL_A + VIRTUAL_POOL_DRAW + VIRTUAL_POOL_B
      );
    });

    it("Should set betting end timestamp", async function () {
      const bettingEnd = await contract.bettingEnd();
      expect(bettingEnd).to.be.gt(0);
    });

    it("Should revert if virtual total is 0", async function () {
      const currentTime = await time.latest();
      const FPLMatchupBet = await ethers.getContractFactory("FPLMatchupBet");
      await expect(
        FPLMatchupBet.deploy(currentTime + ONE_WEEK, 0, 0, 0)
      ).to.be.revertedWith("Virtual total must be > 0");
    });
  });

  describe("Betting", function () {
    it("Should allow placing a bet on Team A", async function () {
      const betAmount = ethers.parseEther("10");
      await expect(contract.connect(bettor1).bet(0, { value: betAmount }))
        .to.emit(contract, "BetPlaced")
        .withArgs(bettor1.address, 0, betAmount);

      expect(await contract.userOutcome(bettor1.address)).to.equal(1); // stored as 1-3
      expect(await contract.userAmount(bettor1.address)).to.equal(betAmount);
      expect(await contract.poolA()).to.equal(betAmount);
      expect(await contract.totalPool()).to.equal(betAmount);
    });

    it("Should allow placing a bet on Draw", async function () {
      const betAmount = ethers.parseEther("5");
      await contract.connect(bettor1).bet(1, { value: betAmount });

      expect(await contract.userOutcome(bettor1.address)).to.equal(2);
      expect(await contract.poolDraw()).to.equal(betAmount);
    });

    it("Should allow placing a bet on Team B", async function () {
      const betAmount = ethers.parseEther("8");
      await contract.connect(bettor1).bet(2, { value: betAmount });

      expect(await contract.userOutcome(bettor1.address)).to.equal(3);
      expect(await contract.poolB()).to.equal(betAmount);
    });

    it("Should allow adding to existing bet", async function () {
      const bet1 = ethers.parseEther("5");
      const bet2 = ethers.parseEther("3");

      await contract.connect(bettor1).bet(0, { value: bet1 });
      await contract.connect(bettor1).bet(0, { value: bet2 });

      expect(await contract.userAmount(bettor1.address)).to.equal(bet1 + bet2);
      expect(await contract.poolA()).to.equal(bet1 + bet2);
    });

    it("Should revert when trying to change outcome", async function () {
      await contract.connect(bettor1).bet(0, { value: ethers.parseEther("5") });
      await expect(
        contract.connect(bettor1).bet(1, { value: ethers.parseEther("5") })
      ).to.be.revertedWith("Cannot change outcome");
    });

    it("Should revert when betting is closed", async function () {
      await time.increase(ONE_WEEK + 1);
      await expect(
        contract.connect(bettor1).bet(0, { value: ethers.parseEther("5") })
      ).to.be.revertedWith("Betting closed");
    });

    it("Should revert when sending 0 HBAR", async function () {
      await expect(contract.connect(bettor1).bet(0, { value: 0 })).to.be.revertedWith(
        "No HBAR sent"
      );
    });

    it("Should revert with invalid outcome", async function () {
      await expect(
        contract.connect(bettor1).bet(3, { value: ethers.parseEther("5") })
      ).to.be.revertedWith("Invalid outcome");
    });
  });

  describe("Odds Calculation", function () {
    it("Should return correct initial odds", async function () {
      // Initial odds should be based on virtual pools only
      const oddsA = await contract.getOdds(0);
      const oddsDraw = await contract.getOdds(1);
      const oddsB = await contract.getOdds(2);

      const virtualTotal = VIRTUAL_POOL_A + VIRTUAL_POOL_DRAW + VIRTUAL_POOL_B;

      // Odds = (virtualTotal + realTotal) / (virtualPool + realPool)
      expect(oddsA).to.equal((virtualTotal * BigInt(1e18)) / VIRTUAL_POOL_A);
      expect(oddsDraw).to.equal((virtualTotal * BigInt(1e18)) / VIRTUAL_POOL_DRAW);
      expect(oddsB).to.equal((virtualTotal * BigInt(1e18)) / VIRTUAL_POOL_B);
    });

    it("Should update odds after bets", async function () {
      const betAmount = ethers.parseEther("50");
      await contract.connect(bettor1).bet(0, { value: betAmount });

      const oddsA = await contract.getOdds(0);
      const virtualTotal = VIRTUAL_POOL_A + VIRTUAL_POOL_DRAW + VIRTUAL_POOL_B;
      const effectiveTotal = virtualTotal + betAmount;
      const effectivePoolA = VIRTUAL_POOL_A + betAmount;

      expect(oddsA).to.equal((effectiveTotal * BigInt(1e18)) / effectivePoolA);
    });

    it("Should return higher odds for underdog", async function () {
      await contract.connect(bettor1).bet(0, { value: ethers.parseEther("100") });
      await contract.connect(bettor2).bet(2, { value: ethers.parseEther("20") });

      const oddsA = await contract.getOdds(0);
      const oddsB = await contract.getOdds(2);

      expect(oddsB).to.be.gt(oddsA); // Team B should have higher odds
    });
  });

  describe("Settlement", function () {
    beforeEach(async function () {
      await contract.connect(bettor1).bet(0, { value: ethers.parseEther("10") });
      await contract.connect(bettor2).bet(1, { value: ethers.parseEther("5") });
      await contract.connect(bettor3).bet(2, { value: ethers.parseEther("15") });
      await time.increase(ONE_WEEK + 1);
    });

    it("Should allow owner to settle", async function () {
      await expect(contract.settle(0))
        .to.emit(contract, "Settled")
        .withArgs(0);

      expect(await contract.settled()).to.be.true;
      expect(await contract.winner()).to.equal(0);
    });

    it("Should calculate correct net pool after fee", async function () {
      await contract.settle(0);

      const totalPool = ethers.parseEther("30"); // 10 + 5 + 15
      const expectedFee = (totalPool * BigInt(2)) / BigInt(100); // 2%
      const expectedNetPool = totalPool - expectedFee;

      expect(await contract.netPool()).to.equal(expectedNetPool);
    });

    it("Should transfer fee to owner", async function () {
      const balanceBefore = await ethers.provider.getBalance(owner.address);
      const tx = await contract.settle(0);
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;
      const balanceAfter = await ethers.provider.getBalance(owner.address);

      const totalPool = ethers.parseEther("30");
      const expectedFee = (totalPool * BigInt(2)) / BigInt(100);

      expect(balanceAfter).to.equal(balanceBefore - gasUsed + expectedFee);
    });

    it("Should revert if non-owner tries to settle", async function () {
      await expect(contract.connect(bettor1).settle(0)).to.be.revertedWith("Not owner");
    });

    it("Should revert if settling before betting ends", async function () {
      const currentTime = await time.latest();
      const bettingEnd = currentTime + ONE_WEEK;

      const FPLMatchupBet = await ethers.getContractFactory("FPLMatchupBet");
      const newContract = await FPLMatchupBet.deploy(
        bettingEnd,
        VIRTUAL_POOL_A,
        VIRTUAL_POOL_DRAW,
        VIRTUAL_POOL_B
      );

      await newContract.connect(bettor1).bet(0, { value: ethers.parseEther("5") });

      await expect(newContract.settle(0)).to.be.revertedWith("Betting not ended");
    });

    it("Should revert with invalid winner", async function () {
      await expect(contract.settle(3)).to.be.revertedWith("Invalid winner");
    });

    it("Should revert if already settled", async function () {
      await contract.settle(0);
      await expect(contract.settle(1)).to.be.revertedWith("Already settled");
    });
  });

  describe("Claims", function () {
    beforeEach(async function () {
      await contract.connect(bettor1).bet(0, { value: ethers.parseEther("10") });
      await contract.connect(bettor2).bet(0, { value: ethers.parseEther("20") });
      await contract.connect(bettor3).bet(2, { value: ethers.parseEther("15") });
      await time.increase(ONE_WEEK + 1);
      await contract.settle(0); // Team A wins
    });

    it("Should allow winners to claim", async function () {
      const balanceBefore = await ethers.provider.getBalance(bettor1.address);
      const tx = await contract.connect(bettor1).claim();
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;
      const balanceAfter = await ethers.provider.getBalance(bettor1.address);

      const totalPool = ethers.parseEther("45");
      const netPool = totalPool - (totalPool * BigInt(2)) / BigInt(100);
      const winningPool = ethers.parseEther("30"); // bettor1 + bettor2
      const expectedPayout = (ethers.parseEther("10") * netPool) / winningPool;

      expect(balanceAfter).to.equal(balanceBefore - gasUsed + expectedPayout);
    });

    it("Should emit Claimed event", async function () {
      const totalPool = ethers.parseEther("45");
      const netPool = totalPool - (totalPool * BigInt(2)) / BigInt(100);
      const expectedPayout = (ethers.parseEther("10") * netPool) / ethers.parseEther("30");

      await expect(contract.connect(bettor1).claim())
        .to.emit(contract, "Claimed")
        .withArgs(bettor1.address, expectedPayout);
    });

    it("Should prevent double claiming", async function () {
      await contract.connect(bettor1).claim();
      await expect(contract.connect(bettor1).claim()).to.be.revertedWith("No stake");
    });

    it("Should revert if not a winner", async function () {
      await expect(contract.connect(bettor3).claim()).to.be.revertedWith("Not winner");
    });

    it("Should revert if not settled", async function () {
      const currentTime = await time.latest();
      const FPLMatchupBet = await ethers.getContractFactory("FPLMatchupBet");
      const newContract = await FPLMatchupBet.deploy(
        currentTime + ONE_WEEK,
        VIRTUAL_POOL_A,
        VIRTUAL_POOL_DRAW,
        VIRTUAL_POOL_B
      );

      await newContract.connect(bettor1).bet(0, { value: ethers.parseEther("5") });
      await expect(newContract.connect(bettor1).claim()).to.be.revertedWith("Not settled");
    });

    it("Should distribute payouts proportionally", async function () {
      const bal1Before = await ethers.provider.getBalance(bettor1.address);
      const bal2Before = await ethers.provider.getBalance(bettor2.address);

      const tx1 = await contract.connect(bettor1).claim();
      const receipt1 = await tx1.wait();
      const tx2 = await contract.connect(bettor2).claim();
      const receipt2 = await tx2.wait();

      const bal1After = await ethers.provider.getBalance(bettor1.address);
      const bal2After = await ethers.provider.getBalance(bettor2.address);

      const gas1 = receipt1!.gasUsed * receipt1!.gasPrice;
      const gas2 = receipt2!.gasUsed * receipt2!.gasPrice;

      const payout1 = bal1After - bal1Before + gas1;
      const payout2 = bal2After - bal2Before + gas2;

      // bettor1 bet 10, bettor2 bet 20, so payout2 should be 2x payout1
      expect(payout2).to.be.closeTo(payout1 * BigInt(2), ethers.parseEther("0.001"));
    });
  });

  describe("Edge Cases", function () {
    it("Should handle draw outcome correctly", async function () {
      await contract.connect(bettor1).bet(1, { value: ethers.parseEther("10") });
      await time.increase(ONE_WEEK + 1);
      await contract.settle(1);

      await expect(contract.connect(bettor1).claim()).to.not.be.reverted;
    });

    it("Should handle zero winning pool gracefully", async function () {
      // No one bets on Team A
      await contract.connect(bettor1).bet(2, { value: ethers.parseEther("10") });
      await time.increase(ONE_WEEK + 1);
      await contract.settle(0); // Team A wins but no bets

      // This should revert because there's no winning pool
      await expect(contract.connect(bettor1).claim()).to.be.revertedWith("Not winner");
    });

    it("Should accept accidental HBAR via receive", async function () {
      const sendAmount = ethers.parseEther("1");
      await bettor1.sendTransaction({
        to: await contract.getAddress(),
        value: sendAmount,
      });

      const contractBalance = await ethers.provider.getBalance(await contract.getAddress());
      expect(contractBalance).to.be.gte(sendAmount);
    });
  });
});
