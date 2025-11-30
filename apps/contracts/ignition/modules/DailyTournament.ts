// Deployment module for DailyTournament contract
// Deploys the daily skateboarding game tournament with cUSD staking

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DailyTournamentModule = buildModule("DailyTournamentModule", (m) => {
  // cUSD token address on Celo Sepolia testnet
  // Source: https://docs.celo.org/token-addresses
  const cUSDAddress = "0xEF4d55D6dE8e8d73232827Cd1e9b2F2dBb45bC80";

  // Deploy the DailyTournament contract with cUSD address
  const dailyTournament = m.contract("DailyTournament", [cUSDAddress]);

  return { dailyTournament };
});

export default DailyTournamentModule;
