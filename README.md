# CeloRiders 🛹

A blockchain-powered, play-to-earn skateboarding game built for the **Celo Africa DAO Mobile Game & Prediction Markets Hackathon**.

**🎮 Stake 1 CELO • Compete Daily • Win Prizes!**

CeloRiders is a GBA-style skateboarding game with on-chain tournaments, leaderboards, and prize distribution. Optimized for **MiniPay** mobile wallet with 5M+ users across Africa.

## 🚀 Features

- **Daily Tournaments**: Stake 1 CELO to enter, compete for top 10 spots
- **On-Chain Leaderboard**: Scores submitted directly to Celo blockchain
- **Prize Distribution**: Top 10 players split 95% of prize pool
  - 1st: 30% | 2nd: 20% | 3rd: 15% | 4th: 10% | 5th: 8% | 6th: 6% | 7-10: 1.5% each
- **MiniPay Integration**: Auto-connect wallet, fullscreen mobile experience
- **Daily Reset**: Tournament resets at midnight WAT (UTC+1)

## 📱 MiniPay Ready

This dApp is fully optimized for MiniPay:
- ✅ Auto-connect wallet
- ✅ Fullscreen gaming experience
- ✅ Mobile-first responsive design
- ✅ Works with 2MB MiniPay wallet
- ✅ Sub-cent transaction fees

**[See MiniPay Integration Guide →](./MINIPAY.md)**

## 🎯 Quick Start

### 1. Install dependencies:
```bash
pnpm install
```

### 2. Set up environment variables:
```bash
# Copy .env.local and update with your values
cp apps/web/.env.local.example apps/web/.env.local
```

### 3. Start the development server:
```bash
pnpm dev
```

### 4. Test with MiniPay:
```bash
# In another terminal
ngrok http 3000
# Load the ngrok URL in MiniPay Developer Settings
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

This is a monorepo managed by Turborepo:

- `apps/web` - Next.js 14 app with Phaser.js game engine
- `apps/contracts` - Hardhat smart contract environment
  - `contracts/DailyTournament.sol` - Tournament smart contract
  - Deployed at: `0xAE5d214ecE811D3B65E42f7018e8fD77f16ebb78` (Celo Sepolia)

## Available Scripts

- `pnpm dev` - Start development servers
- `pnpm build` - Build all packages and apps
- `pnpm lint` - Lint all packages and apps
- `pnpm type-check` - Run TypeScript type checking

### Smart Contract Scripts

- `pnpm contracts:compile` - Compile smart contracts
- `pnpm contracts:test` - Run smart contract tests
- `pnpm contracts:deploy` - Deploy contracts to local network
- `pnpm contracts:deploy:alfajores` - Deploy to Celo Alfajores testnet
- `pnpm contracts:deploy:sepolia` - Deploy to Celo Sepolia testnet
- `pnpm contracts:deploy:celo` - Deploy to Celo mainnet

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Game Engine**: Phaser.js 3.90
- **Web3**: Wagmi 2.0 + Viem 2.0 + RainbowKit
- **Styling**: Tailwind CSS + shadcn/ui
- **Smart Contracts**: Solidity 0.8.28 + Hardhat
- **Blockchain**: Celo (Sepolia Testnet)
- **Wallet**: MiniPay + MetaMask support
- **Monorepo**: Turborepo + PNPM

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Celo Documentation](https://docs.celo.org/)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
