import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.28',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    // Celo Mainnet
    celo: {
      url: 'https://forno.celo.org',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 42220
    },
    // Celo Sepolia Testnet
    'celo-sepolia': {
      url: 'https://forno.celo-sepolia.celo-testnet.org',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11142220
    },
    // Local development
    localhost: {
      url: 'http://127.0.0.1:8545',
      chainId: 31337
    }
  },
  etherscan: {
    apiKey: {
      celo: process.env.ETHERSCAN_API_KEY || '',
      'celo-sepolia': process.env.ETHERSCAN_API_KEY || '' // Same key for both
    },
    customChains: [
      {
        network: 'celo',
        chainId: 42220,
        urls: {
          apiURL: 'https://api.etherscan.io/v2/api?chainid=42220',
          browserURL: 'https://celoscan.io'
        }
      },
      {
        network: 'celo-sepolia',
        chainId: 11142220,
        urls: {
          apiURL: 'https://api-sepolia.celoscan.io/v2/api',
          browserURL: 'https://sepolia.celoscan.io'
        }
      }
    ]
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: 'USD'
  }
}

export default config;
