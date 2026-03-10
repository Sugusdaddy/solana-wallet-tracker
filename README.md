# 🔍 Solana Wallet Tracker

Real-time Solana wallet tracking dashboard with token balances, NFTs, transaction history, and portfolio analytics.

![Solana](https://img.shields.io/badge/Solana-black?style=flat&logo=solana&logoColor=14F195)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)

## ✨ Features

- **Real-time Balance Tracking** - Live SOL and token balances with USD values
- **Token Portfolio** - Complete list of SPL tokens with metadata and prices
- **NFT Gallery** - View all NFTs in any wallet with collection info
- **Transaction History** - Detailed transaction log with filtering and search
- **Portfolio Analytics** - Charts showing balance over time and asset allocation
- **Whale Alerts** - Track large transactions from specified wallets
- **Multi-RPC Support** - Automatic failover between RPC endpoints for reliability

## 🚀 Quick Start

```bash
# Clone the repo
git clone https://github.com/Sugusdaddy/solana-wallet-tracker.git
cd solana-wallet-tracker

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🔧 Configuration

Create a `.env` file in the root directory:

```env
VITE_RPC_ENDPOINT=https://api.mainnet-beta.solana.com
VITE_HELIUS_API_KEY=your_helius_key_here
```

### Supported RPC Providers

- Solana Mainnet (default)
- Helius
- Triton (recommended for speed)
- QuickNode
- Alchemy

## 📊 Screenshots

### Dashboard
Track any wallet's portfolio in real-time with beautiful visualizations.

### Transaction History
View detailed transaction history with type filtering, amount sorting, and direct Solscan links.

### NFT Gallery
Browse NFTs with collection metadata, floor prices, and image previews.

## 🏗️ Architecture

```
src/
├── components/      # React components
│   ├── Dashboard/   # Main dashboard views
│   ├── Charts/      # Recharts visualizations
│   └── UI/          # Reusable UI components
├── hooks/           # Custom React hooks
│   ├── useWallet.ts # Wallet data fetching
│   ├── useTokens.ts # Token balance hooks
│   └── useTransactions.ts
├── utils/           # Utility functions
│   ├── solana.ts    # Solana connection helpers
│   ├── format.ts    # Number/date formatting
│   └── api.ts       # API integrations
└── types/           # TypeScript interfaces
```

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Blockchain**: @solana/web3.js, @solana/spl-token
- **Build**: Vite
- **Icons**: Lucide React

## 🔗 API Integrations

| Service | Purpose |
|---------|---------|
| Solana RPC | Blockchain data |
| Helius | Enhanced APIs, webhooks |
| Jupiter | Token prices |
| Magic Eden | NFT metadata |

## 📈 Roadmap

- [x] Basic wallet tracking
- [x] Token balances with prices
- [x] Transaction history
- [x] Portfolio charts
- [ ] Wallet comparison
- [ ] Export to CSV
- [ ] Telegram alerts
- [ ] DeFi position tracking (Raydium, Orca, Marinade)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

Built with ☕ by [@Sugusdaddy](https://github.com/Sugusdaddy)
