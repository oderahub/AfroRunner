// Deployment module for DailyTournament contract
// Deploys the daily skateboarding game tournament with cUSD staking

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DailyTournamentModule = buildModule("DailyTournamentModule", (m) => {
  // cUSD token address on Celo Mainnet
  // Source: https://explorer.celo.org/mainnet/token/0x765DE816845861e75A25fCA122bb6898B8B1282a
  const cUSDAddress = "0x765DE816845861e75A25fCA122bb6898B8B1282a";

  // Deploy the DailyTournament contract with cUSD address
  const dailyTournament = m.contract("DailyTournament", [cUSDAddress]);

  return { dailyTournament };
});

export default DailyTournamentModule;
