# FPL Betting Smart Contracts

Smart contracts for the FPL P2P betting application on the Hedera network. This project uses Hardhat for development, testing, and deployment.

## 📋 Overview

The `FPLMatchupBet` contract implements a **Parimutuel (Pool-based) Betting System** for Fantasy Premier League matchups. Unlike traditional bookmakers with fixed odds, this system allows odds to float dynamically based on market sentiment until the betting pool closes.

### Key Features

- **Virtual Pools**: Initial odds are seeded using "virtual liquidity pools". This ensures realistic opening odds without the house taking actual risk. These virtual pools affect odds calculation but *never* dilute the payout pool for winners.
- **Three Outcomes**: 
  - `0`: Team A Win
  - `1`: Draw
  - `2`: Team B Win
- **2% House Fee**: Automatically deducted from the total real pool upon settlement.
- **Secure HBAR Transfers**: Uses modern `.call{value: ...}("")` patterns for transferring HBAR, guarded against reentrancy.
- **Hedera Optimization**: Specifically optimized for Hedera's EVM compatibility, including handling of tinybar vs. wei unit scaling.

## 💡 How It Works

1.  **Deployment**: The contract is deployed with a closing timestamp and "virtual pool" sizes that represent the initial odds.
2.  **Betting**: Users send HBAR to the contract along with their predicted outcome.
    -   *Dynamic Odds*: As more money flows into one outcome (e.g., Team A), the odds for that outcome decrease, while odds for others increase.
3.  **Settlement**: After the gameweek is over, the owner calls `settle(winnerOutcome)`.
    -   The 2% house fee is sent to the owner.
    -   The contract enters a "Settled" state.
4.  **Claiming**: Winners call `claim()` to withdraw their share.
    -   Payout = `(YourStake / TotalWinningPool) * (TotalRealPool - Fee)`

## 🏗️ Project Structure

```
contracts/
├── contracts/
│   └── FPLMatchupBet.sol      # Main betting contract
├── scripts/
│   ├── deploy.ts              # Full deployment & initial betting setup
│   └── interact.ts            # Interactive tool for testing betting/odds
├── test/
│   └── FPLMatchupBet.test.ts  # Comprehensive test suite
├── hardhat.config.ts          # Hedera network configuration
└── .env                       # Environment variables (Private keys, settings)
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- Hedera Testnet Account ([Get one here](https://portal.hedera.com/register))

### Installation

```bash
cd contracts
npm install
```

### Environment Setup

Create a `.env` file (copy from `.env.example`) and fill in your Hedera credentials:

```bash
HEDERA_TESTNET_ACCOUNT_ID=0.0.xxxxx
HEDERA_TESTNET_PRIVATE_KEY=302e...
```

## 🔧 Scripts & Usage

### 1. Deploy to Hedera Testnet

Deploys the contract with your configured odds (via virtual pools).

```bash
npm run deploy:testnet
```

*Tip: You can customize the initial odds and betting deadline in `.env` or directly in `scripts/deploy.ts`.*

### 2. Interactive Testing

We provide a powerful interactive script to test the full lifecycle of the contract on the live testnet.

```bash
npx hardhat run scripts/interact.ts --network hederaTestnet
```

This script allows you to:
- Check contract status and pool balances.
- View real-time dynamic odds.
- Place test bets.
- Simulate settlement and verify claim payouts.

## ⚠️ Technical Note: Hedera Scaling

Hedera's EVM has a unique behavior regarding native cryptocurrency units:
- **Hedera Native**: 1 HBAR = 100,000,000 tinybars ($10^8$)
- **EVM Standard**: 1 Ether = $10^{18}$ wei

To ensure standard EVM math works correctly for odds calculation:
1.  **In Contract**: We multiply incoming `msg.value` (tinybars) by $10^{10}$ to normalize it to "wei-bars" ($10^{18}$).
2.  **Transfers**: When sending HBAR back to users (claims/fees), we divide by $10^{10}$ to convert back to tinybars.
3.  **Frontend/Scripts**: Always use standard ethers.js formatting (`ethers.parseEther("1")`) which produces $10^{18}$ units. The contract handles the rest.

## � Security

- **Reentrancy**: Protected via formatting checks-effects-interactions pattern.
- **Fairness**: Settlement is restricted to the owner (server-side oracle) and only after the betting deadline.
- **Solidity**: Built with v0.8.20, utilizing built-in overflow protection.

## 📄 License

MIT License
