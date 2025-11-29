// Deployment module for DailyTournament contract
// Deploys the daily skateboarding game tournament with cUSD staking

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DailyTournamentModule = buildModule("DailyTournamentModule", (m) => {
  // cUSD token address on Celo Sepolia testnet
  const cUSDAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";

  // Deploy the DailyTournament contract with cUSD address
  const dailyTournament = m.contract("DailyTournament", [cUSDAddress]);

  return { dailyTournament };
});

export default DailyTournamentModule;
