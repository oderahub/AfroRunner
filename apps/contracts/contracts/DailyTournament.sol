// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}

/**
 * @title DailyTournament
 * @dev Daily skateboarding game tournament with cUSD staking and leaderboard prizes
 *
 * Tournament resets daily at midnight WAT (UTC+1)
 * Players stake 1 cUSD per game
 * Top 10 scores win prizes (95% of pool)
 * 5% house fee
 */
contract DailyTournament {
    // Constants
    uint256 public constant ENTRY_FEE = 1 ether; // 1 cUSD (18 decimals)
    uint256 public constant HOUSE_FEE_PERCENT = 5; // 5%
    uint256 public constant PRIZE_POOL_PERCENT = 95; // 95%
    uint256 public constant TOP_PLAYERS = 10;

    // cUSD token address on Celo Sepolia
    IERC20 public immutable cUSD;

    // Tournament resets at midnight WAT (UTC+1 = 23:00 UTC)
    uint256 public constant RESET_HOUR_UTC = 23; // 11 PM UTC = midnight WAT

    // Prize distribution percentages (in basis points, 100 = 1%)
    uint256[10] public prizePercentages = [
        3000, // 1st: 30%
        2000, // 2nd: 20%
        1500, // 3rd: 15%
        1000, // 4th: 10%
        800,  // 5th: 8%
        600,  // 6th: 6%
        150,  // 7th: 1.5%
        150,  // 8th: 1.5%
        150,  // 9th: 1.5%
        150   // 10th: 1.5%
    ]; // Total: 9500 (95%)

    // Structs
    struct Player {
        address playerAddress;
        uint256 score;
        uint256 timestamp;
    }

    struct TournamentDay {
        uint256 dayId; // Unix timestamp of tournament start (midnight WAT)
        uint256 totalPrizePool;
        uint256 totalEntries;
        Player[10] topPlayers;
        bool distributed;
        uint256 houseFeeCollected;
    }

    // State variables
    address public owner;
    uint256 public currentDayId;
    uint256 public totalHouseFees;

    mapping(uint256 => TournamentDay) public tournaments;
    mapping(uint256 => mapping(address => uint256)) public playerHighScores; // dayId => player => score
    mapping(uint256 => mapping(address => bool)) public hasPlayed; // dayId => player => played

    // Events
    event EntryPaid(address indexed player, uint256 dayId, uint256 amount);
    event ScoreSubmitted(address indexed player, uint256 dayId, uint256 score, uint256 rank);
    event PrizesDistributed(uint256 dayId, uint256 totalPrizePool);
    event HouseFeeWithdrawn(address indexed owner, uint256 amount);
    event TournamentReset(uint256 newDayId, uint256 previousDayId);

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor(address _cUSDAddress) {
        require(_cUSDAddress != address(0), "Invalid cUSD address");
        owner = msg.sender;
        cUSD = IERC20(_cUSDAddress);
        currentDayId = getCurrentDayId();
        _initializeTournament(currentDayId);
    }

    /**
     * @dev Initialize a new tournament
     */
    function _initializeTournament(uint256 dayId) internal {
        TournamentDay storage tournament = tournaments[dayId];
        tournament.dayId = dayId;
        tournament.totalPrizePool = 0;
        tournament.totalEntries = 0;
        tournament.distributed = false;
        tournament.houseFeeCollected = 0;

        // Initialize empty leaderboard
        for (uint256 i = 0; i < TOP_PLAYERS; i++) {
            tournament.topPlayers[i] = Player(address(0), 0, 0);
        }
    }

    /**
     * @dev Calculate current tournament day ID (midnight WAT)
     * WAT = UTC+1, so midnight WAT = 23:00 UTC previous day
     */
    function getCurrentDayId() public view returns (uint256) {
        uint256 currentTime = block.timestamp;
        // Adjust for WAT timezone (UTC+1)
        uint256 watTime = currentTime + 1 hours;
        // Get start of day (midnight)
        uint256 dayStart = (watTime / 1 days) * 1 days;
        return dayStart;
    }

    /**
     * @dev Check if tournament needs to be reset
     */
    function needsReset() public view returns (bool) {
        return getCurrentDayId() > currentDayId;
    }

    /**
     * @dev Reset tournament for new day
     */
    function resetTournament() public {
        require(needsReset(), "Current tournament still active");

        // Distribute prizes for previous tournament if not done
        if (!tournaments[currentDayId].distributed && tournaments[currentDayId].totalPrizePool > 0) {
            _distributePrizes(currentDayId);
        }

        uint256 previousDayId = currentDayId;
        currentDayId = getCurrentDayId();

        _initializeTournament(currentDayId);

        emit TournamentReset(currentDayId, previousDayId);
    }

    /**
     * @dev Pay entry fee to play (in cUSD)
     * Player must approve this contract to spend 1 cUSD before calling
     */
    function payEntry() external {
        // Reset tournament if needed
        if (needsReset()) {
            resetTournament();
        }

        // Transfer cUSD from player to contract
        require(
            cUSD.transferFrom(msg.sender, address(this), ENTRY_FEE),
            "cUSD transfer failed - ensure you have approved the contract"
        );

        TournamentDay storage tournament = tournaments[currentDayId];

        // Calculate house fee and prize pool
        uint256 houseFee = (ENTRY_FEE * HOUSE_FEE_PERCENT) / 100;
        uint256 prizePoolAmount = ENTRY_FEE - houseFee;

        // Update tournament stats
        tournament.totalPrizePool += prizePoolAmount;
        tournament.totalEntries++;
        tournament.houseFeeCollected += houseFee;
        totalHouseFees += houseFee;

        emit EntryPaid(msg.sender, currentDayId, ENTRY_FEE);
    }

    /**
     * @dev Submit score after game
     */
    function submitScore(uint256 score) external {
        require(score > 0, "Score must be greater than 0");

        // Update player's high score for the day
        if (score > playerHighScores[currentDayId][msg.sender]) {
            playerHighScores[currentDayId][msg.sender] = score;

            // Check if score qualifies for top 10
            _updateLeaderboard(msg.sender, score);
        }
    }

    /**
     * @dev Internal function to update leaderboard
     */
    function _updateLeaderboard(address player, uint256 score) internal {
        TournamentDay storage tournament = tournaments[currentDayId];

        // Find position in top 10
        uint256 position = TOP_PLAYERS; // Start beyond top 10

        for (uint256 i = 0; i < TOP_PLAYERS; i++) {
            if (score > tournament.topPlayers[i].score) {
                position = i;
                break;
            }
        }

        // If score doesn't make top 10, return
        if (position == TOP_PLAYERS) {
            return;
        }

        // Shift players down and insert new score
        for (uint256 i = TOP_PLAYERS - 1; i > position; i--) {
            tournament.topPlayers[i] = tournament.topPlayers[i - 1];
        }

        tournament.topPlayers[position] = Player({
            playerAddress: player,
            score: score,
            timestamp: block.timestamp
        });

        emit ScoreSubmitted(player, currentDayId, score, position + 1);
    }

    /**
     * @dev Distribute prizes to top 10 players
     */
    function distributePrizes() external {
        require(needsReset(), "Tournament still active");
        require(!tournaments[currentDayId].distributed, "Prizes already distributed");

        _distributePrizes(currentDayId);
    }

    /**
     * @dev Internal prize distribution
     */
    function _distributePrizes(uint256 dayId) internal {
        TournamentDay storage tournament = tournaments[dayId];
        require(!tournament.distributed, "Prizes already distributed");

        uint256 prizePool = tournament.totalPrizePool;

        if (prizePool == 0) {
            tournament.distributed = true;
            return;
        }

        // Distribute to each top player
        for (uint256 i = 0; i < TOP_PLAYERS; i++) {
            address playerAddress = tournament.topPlayers[i].playerAddress;

            if (playerAddress == address(0)) {
                break; // No more valid players
            }

            uint256 prize = (prizePool * prizePercentages[i]) / 10000;

            if (prize > 0) {
                require(cUSD.transfer(playerAddress, prize), "Prize transfer failed");
            }
        }

        tournament.distributed = true;
        emit PrizesDistributed(dayId, prizePool);
    }

    /**
     * @dev Owner withdraws accumulated house fees
     */
    function withdrawHouseFees() external onlyOwner {
        uint256 amount = totalHouseFees;
        require(amount > 0, "No house fees to withdraw");

        totalHouseFees = 0;

        require(cUSD.transfer(owner, amount), "Withdrawal failed");

        emit HouseFeeWithdrawn(owner, amount);
    }

    /**
     * @dev Get current tournament leaderboard
     */
    function getCurrentLeaderboard() external view returns (Player[10] memory) {
        return tournaments[currentDayId].topPlayers;
    }

    /**
     * @dev Get tournament info for a specific day
     */
    function getTournamentInfo(uint256 dayId) external view returns (
        uint256 totalPrizePool,
        uint256 totalEntries,
        bool distributed,
        uint256 houseFeeCollected
    ) {
        TournamentDay storage tournament = tournaments[dayId];
        return (
            tournament.totalPrizePool,
            tournament.totalEntries,
            tournament.distributed,
            tournament.houseFeeCollected
        );
    }

    /**
     * @dev Get player's high score for current tournament
     */
    function getMyScore() external view returns (uint256) {
        return playerHighScores[currentDayId][msg.sender];
    }

    /**
     * @dev Transfer ownership
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        owner = newOwner;
    }

    /**
     * @dev Get contract cUSD balance
     */
    function getContractBalance() external view returns (uint256) {
        return cUSD.balanceOf(address(this));
    }
}
