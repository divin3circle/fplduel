// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title FPLMatchupBet
 * @dev Simple parimutuel betting contract with initial odds seeding via virtual pools.
 * Outcomes: 0 = Team A win, 1 = Draw, 2 = Team B win.
 * Bets in HBAR; 2% fee on total real pool.
 * Initial odds seeded with virtual pools (do not affect real payouts).
 * Uses modern .call for HBAR transfers to avoid deprecation warnings.
 */
contract FPLMatchupBet {
    address public owner;
    uint256 public immutable bettingEnd; // Timestamp when betting closes

    // Real pools (actual escrowed HBAR)
    uint256 public totalPool;
    uint256 public poolA;
    uint256 public poolDraw;
    uint256 public poolB;

    // Virtual pools for initial odds seeding only
    uint256 public immutable virtualPoolA;
    uint256 public immutable virtualPoolDraw;
    uint256 public immutable virtualPoolB;
    uint256 public immutable virtualTotal;

    mapping(address => uint256) public userOutcome; // 0 if no bet, else 1-3 (adjusted for no-bet detection)
    mapping(address => uint256) public userAmount;  // Total real stake per user

    bool public settled;
    uint8 public winner; // 0=A, 1=Draw, 2=B
    uint256 public netPool; // Real total minus 2% fee

    event BetPlaced(address indexed bettor, uint8 outcome, uint256 amount);
    event Settled(uint8 winner);
    event Claimed(address indexed claimer, uint256 payout);

    constructor(uint256 _bettingEnd, uint256 _virtualPoolA, uint256 _virtualPoolDraw, uint256 _virtualPoolB) {
        owner = msg.sender;
        bettingEnd = _bettingEnd;

        virtualPoolA = _virtualPoolA;
        virtualPoolDraw = _virtualPoolDraw;
        virtualPoolB = _virtualPoolB;
        virtualTotal = _virtualPoolA + _virtualPoolDraw + _virtualPoolB;

        // Basic sanity: require some virtual liquidity to avoid zero odds
        require(virtualTotal > 0, "Virtual total must be > 0");
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    /**
     * @dev Place or add to a bet. Must be same outcome if repeating.
     * @param outcome 0=A, 1=Draw, 2=B
     * 
     * HEDERA NOTE: On Hedera, msg.value is received in tinybars (10^8 scale).
     * We scale it to wei (10^18) for consistency with virtual pools and odds calculation.
     */
    function bet(uint8 outcome) external payable {
        require(block.timestamp < bettingEnd, "Betting closed");
        require(!settled, "Already settled");
        require(msg.value > 0, "No HBAR sent");
        require(outcome <= 2, "Invalid outcome");

        // HEDERA FIX: Scale tinybars (10^8) to wei (10^18) for consistency
        // On Hedera: 1 HBAR sent = 10^8 tinybars received in msg.value
        // We multiply by 10^10 to get wei-equivalent (10^18 scale)
        uint256 scaledValue = msg.value * 1e10;

        if (userOutcome[msg.sender] == 0) {
            userOutcome[msg.sender] = outcome + 1; // Store as 1-3
        } else {
            require(userOutcome[msg.sender] - 1 == outcome, "Cannot change outcome");
        }

        userAmount[msg.sender] += scaledValue;

        if (outcome == 0) poolA += scaledValue;
        else if (outcome == 1) poolDraw += scaledValue;
        else poolB += scaledValue;

        totalPool += scaledValue;

        emit BetPlaced(msg.sender, outcome, scaledValue);
    }

    /**
     * @dev View function for estimated odds: (virtual + real total) / (virtual + real outcome pool)
     * Returns scaled value (divide by 1e18 in frontend for decimal odds, e.g., 2.5 odds).
     */
    function getOdds(uint8 outcome) external view returns (uint256) {
        require(outcome <= 2, "Invalid outcome");

        uint256 realPool = outcome == 0 ? poolA : outcome == 1 ? poolDraw : poolB;
        uint256 virtualPool = outcome == 0 ? virtualPoolA : outcome == 1 ? virtualPoolDraw : virtualPoolB;

        uint256 effectivePool = virtualPool + realPool;
        uint256 effectiveTotal = virtualTotal + totalPool;

        if (effectivePool == 0 || effectiveTotal == 0) return 0;

        return (effectiveTotal * 1e18) / effectivePool;
    }

    /**
     * @dev Owner settles after GW, deducts 2% fee from real pool using safe .call.
     * 
     * HEDERA NOTE: Scales fee back to tinybars before transfer.
     */
    function settle(uint8 _winner) external onlyOwner {
        require(!settled, "Already settled");
        require(block.timestamp >= bettingEnd, "Betting not ended");
        require(_winner <= 2, "Invalid winner");

        settled = true;
        winner = _winner;

        uint256 fee = (totalPool * 2) / 100;
        netPool = totalPool - fee;

        if (fee > 0) {
            // Scale back to tinybars for Hedera transfer (divide by 10^10)
            uint256 feeInTinybars = fee / 1e10;
            (bool sent, ) = payable(owner).call{value: feeInTinybars}("");
            require(sent, "Fee transfer failed");
        }

        emit Settled(_winner);
    }

    /**
     * @dev Check how much an address can claim (in wei-scale).
     * Returns 0 if not settled, no stake, or not a winner.
     */
    function getClaimableAmount(address user) external view returns (uint256) {
        if (!settled) return 0;
        if (userAmount[user] == 0) return 0;
        if (userOutcome[user] == 0) return 0; // No bet placed
        if (userOutcome[user] - 1 != winner) return 0; // Not winner

        uint256 winningPool = winner == 0 ? poolA : winner == 1 ? poolDraw : poolB;
        if (winningPool == 0) return 0;

        return (userAmount[user] * netPool) / winningPool;
    }

    /**
     * @dev Users claim proportional share from real net pool using safe .call.
     * 
     * HEDERA NOTE: Scales payout back to tinybars before transfer.
     */
    function claim() external {
        require(settled, "Not settled");
        require(userAmount[msg.sender] > 0, "No stake");
        require(userOutcome[msg.sender] - 1 == winner, "Not winner");

        uint256 winningPool = winner == 0 ? poolA : winner == 1 ? poolDraw : poolB;
        require(winningPool > 0, "No winning pool");

        uint256 payout = (userAmount[msg.sender] * netPool) / winningPool;

        userAmount[msg.sender] = 0; // Prevent re-claim

        // Scale back to tinybars for Hedera transfer (divide by 10^10)
        uint256 payoutInTinybars = payout / 1e10;
        (bool sent, ) = payable(msg.sender).call{value: payoutInTinybars}("");
        require(sent, "Payout transfer failed");

        emit Claimed(msg.sender, payout);
    }

    // Fallback to accept accidental HBAR
    receive() external payable {}
}
