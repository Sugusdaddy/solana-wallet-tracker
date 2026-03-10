import React from 'react';
import { motion } from 'framer-motion';

interface WalletData {
  address: string;
  label?: string;
  solBalance: number;
  tokenCount: number;
  nftCount: number;
  totalValueUsd: number;
  pnl24h: number;
  pnl7d: number;
}

interface WalletComparisonProps {
  wallets: WalletData[];
}

export const WalletComparison: React.FC<WalletComparisonProps> = ({ wallets }) => {
  const maxValue = Math.max(...wallets.map(w => w.totalValueUsd));

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        📊 Wallet Comparison
      </h2>

      <div className="space-y-4">
        {wallets.map((wallet, index) => (
          <motion.div
            key={wallet.address}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 bg-gray-700/50 rounded-lg"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-bold text-white">
                  {wallet.label || `${wallet.address.slice(0, 4)}...${wallet.address.slice(-4)}`}
                </p>
                <p className="text-sm text-gray-400">{wallet.address}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-white">
                  ${wallet.totalValueUsd.toLocaleString()}
                </p>
                <p className={`text-sm ${wallet.pnl24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {wallet.pnl24h >= 0 ? '+' : ''}{wallet.pnl24h.toFixed(2)}% (24h)
                </p>
              </div>
            </div>

            {/* Value bar */}
            <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(wallet.totalValueUsd / maxValue) * 100}%` }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
              <div>
                <p className="text-gray-400">SOL</p>
                <p className="text-white font-medium">{wallet.solBalance.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-400">Tokens</p>
                <p className="text-white font-medium">{wallet.tokenCount}</p>
              </div>
              <div>
                <p className="text-gray-400">NFTs</p>
                <p className="text-white font-medium">{wallet.nftCount}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default WalletComparison;
