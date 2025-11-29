# MiniPay Integration Guide

CeloRiders is optimized for **MiniPay** - a lightweight mobile wallet integrated with Opera Mini browser, perfect for the Celo Africa DAO Mobile Game & Prediction Markets Hackathon.

## 🎮 What is MiniPay?

MiniPay is a stablecoin wallet built into Opera Mini with:
- **5M+ activations** across Africa
- **Phone number as wallet address** mapping
- **Sub-cent transaction fees**
- **Only 2MB** - works on limited data
- **Built-in dApp discovery** page

## 🚀 How CeloRiders Works with MiniPay

### Auto-Connect Feature
When users open CeloRiders in MiniPay:
1. ✅ Wallet **automatically connects** (no "Connect Wallet" button needed)
2. ✅ Navbar **hidden for fullscreen** gaming experience
3. ✅ Optimized UI messaging for MiniPay users
4. ✅ Mobile-first responsive design

### Game Flow in MiniPay
1. User opens CeloRiders from MiniPay app discovery
2. Game loads with auto-connected wallet
3. User stakes 1 CELO to enter daily tournament
4. Plays skateboarding game
5. Score automatically submitted to blockchain leaderboard
6. Compete for top 10 prizes distributed daily at midnight WAT

## 🧪 Testing with MiniPay

### Step 1: Enable Developer Mode in MiniPay

1. Open MiniPay app on your Android device
2. Go to **Settings**
3. Tap on **Version number** repeatedly until you see "Developer mode enabled"
4. Return to Settings → **Developer Settings**
5. Toggle **Developer Mode** ON
6. Toggle **Use Testnet** ON (for testing with Celo Sepolia)

### Step 2: Setup Local Testing with ngrok

Since MiniPay is a mobile app, you need to expose your local development server:

```bash
# Install ngrok (if not already installed)
# Download from https://ngrok.com/download

# Start your Next.js dev server
pnpm dev

# In another terminal, create a tunnel
ngrok http 3000
```

Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)

### Step 3: Load Your dApp in MiniPay

1. Open MiniPay app
2. Go to **Settings → Developer Settings**
3. Tap **Load Test Page**
4. Enter your ngrok URL
5. Your game will load with MiniPay auto-connected! 🎉

### Step 4: Get Testnet Funds

1. Get CELO from the [Celo Sepolia Faucet](https://faucet.celo.org/alfajores)
2. Swap CELO for cUSD using [Mento](https://app.mento.org/)
3. You're ready to test staking and gameplay!

## 🏗️ Technical Implementation

### MiniPay Detection
```typescript
// We created a custom hook for this
import { useMiniPay } from '@/hooks/useMiniPay';

const { isMiniPay } = useMiniPay();

// Checks: window.ethereum?.isMiniPay === true
```

### Auto-Connect on Load
Our WalletProvider (`apps/web/src/components/wallet-provider.tsx`) automatically:
```typescript
useEffect(() => {
  if (window.ethereum && window.ethereum.isMiniPay) {
    const injectedConnector = connectors.find((c) => c.id === "injected");
    if (injectedConnector) {
      connect({ connector: injectedConnector });
    }
  }
}, [connect, connectors]);
```

### Conditional UI Rendering
```typescript
// Hide "Connect Wallet" message in MiniPay
{!isConnected && !isMiniPay && (
  <div>Connect your wallet to play!</div>
)}

// Show MiniPay-optimized messages
{isMiniPay ? '🎮 Stake 1 CELO to enter tournament!' : 'Stake 1 CELO to play!'}
```

### Fullscreen Mobile Experience
```typescript
// Navbar hides in MiniPay for fullscreen gaming
export function Navbar() {
  const { isMiniPay } = useMiniPay()

  if (isMiniPay) {
    return null;
  }

  return <header>...</header>
}
```

## 📱 Mobile Optimizations

### Viewport Settings
```typescript
// app/layout.tsx
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000',
};
```

### PWA Support
- Manifest file at `/public/manifest.json`
- Standalone display mode for app-like experience
- Portrait orientation locked for gaming

### Responsive Game Canvas
```typescript
// Phaser config
scale: {
  mode: Phaser.Scale.FIT,
  autoCenter: Phaser.Scale.CENTER_BOTH,
}
```

## 🌍 Deployment

### For Hackathon Submission
1. Deploy to Vercel/Netlify
2. Ensure HTTPS (required for MiniPay)
3. Test with your deployed URL in MiniPay
4. Submit your dApp for MiniPay app discovery listing

### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_WC_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_TOURNAMENT_CONTRACT_SEPOLIA=0xAE5d214ecE811D3B65E42f7018e8fD77f16ebb78
```

## 🎯 Best Practices

✅ **DO:**
- Test on actual Android devices (emulators won't work)
- Use Celo Sepolia testnet for development
- Support only stablecoins (cUSD, USDC, USDT)
- Keep UI simple and mobile-first
- Hide wallet connection UI in MiniPay

❌ **DON'T:**
- Use other networks (only Celo/Celo Sepolia supported)
- Implement EIP-1559 transactions (MiniPay uses legacy)
- Require manual wallet connection in MiniPay
- Show desktop-only features

## 📚 Resources

- [MiniPay Official Docs](https://docs.celo.org/build-on-celo/build-on-minipay/overview)
- [Celo Sepolia Faucet](https://faucet.celo.org/alfajores)
- [Mento Swap](https://app.mento.org/)
- [Celo Africa DAO Hackathon](https://celo.org/hackathons)

## 🏆 Hackathon Checklist

- [x] Mobile-optimized UI
- [x] MiniPay auto-connect
- [x] Fullscreen game experience
- [x] Deployed on Celo Sepolia
- [x] Uses stablecoins (CELO for staking)
- [x] Play-to-earn mechanics
- [x] Daily tournament system
- [x] On-chain leaderboard
- [ ] Submit for MiniPay app discovery
- [ ] Demo video for submission

---

Built for **Celo Africa DAO Mobile Game & Prediction Markets Hackathon** 🚀
