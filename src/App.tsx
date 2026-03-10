import React, { useState } from 'react';
import { useWallet } from './hooks/useWallet';
import { formatAddress, isValidSolanaAddress } from './utils/solana';
import {
  Search,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Copy,
  ExternalLink,
  TrendingUp,
  Image,
  History,
  PieChart,
} from 'lucide-react';

const App: React.FC = () => {
  const [searchAddress, setSearchAddress] = useState('');
  const [activeAddress, setActiveAddress] = useState('');
  const [activeTab, setActiveTab] = useState<'tokens' | 'nfts' | 'transactions'>('tokens');

  const { solBalance, solPrice, tokens, transactions, nfts, totalValueUsd, loading, error, refresh } =
    useWallet(activeAddress);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValidSolanaAddress(searchAddress)) {
      setActiveAddress(searchAddress);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(activeAddress);
  };

  const formatUsd = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  const formatNumber = (value: number, decimals: number = 4) =>
    new Intl.NumberFormat('en-US', { maximumFractionDigits: decimals }).format(value);

  const formatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm bg-black/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Solana Wallet Tracker</h1>
                <p className="text-xs text-gray-400">Real-time portfolio analytics</p>
              </div>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
                  placeholder="Enter Solana wallet address..."
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </form>

            <button
              onClick={refresh}
              disabled={loading || !activeAddress}
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-5 h-5 text-white ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {!activeAddress ? (
          /* Empty State */
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-400/20 flex items-center justify-center mb-6">
              <Search className="w-10 h-10 text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Track Any Solana Wallet</h2>
            <p className="text-gray-400 max-w-md mx-auto">
              Enter a wallet address above to view real-time balances, tokens, NFTs, and transaction history.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {[
                { label: 'Example Whale', address: 'HN7cABqLq46Es1jh92dQQisAq662SmxELLTPRFS5Pwho' },
                { label: 'Phantom Treasury', address: '5ZWj7a1f8tWkjBESHKgrLmXshuXxqeY9SYcfbshpAqPG' },
              ].map((example) => (
                <button
                  key={example.address}
                  onClick={() => {
                    setSearchAddress(example.address);
                    setActiveAddress(example.address);
                  }}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-gray-300 transition-colors"
                >
                  {example.label}
                </button>
              ))}
            </div>
          </div>
        ) : error ? (
          /* Error State */
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-red-500/20 flex items-center justify-center mb-6">
              <span className="text-4xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Error Loading Wallet</h2>
            <p className="text-red-400">{error}</p>
            <button
              onClick={refresh}
              className="mt-6 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          /* Dashboard */
          <div className="space-y-6">
            {/* Wallet Header */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center">
                    <Wallet className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-mono">{formatAddress(activeAddress, 6)}</span>
                      <button onClick={copyAddress} className="p-1 hover:bg-white/10 rounded">
                        <Copy className="w-4 h-4 text-gray-400" />
                      </button>
                      <a
                        href={`https://solscan.io/account/${activeAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 hover:bg-white/10 rounded"
                      >
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </a>
                    </div>
                    <p className="text-gray-400 text-sm">Solana Mainnet</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-white">{formatUsd(totalValueUsd)}</p>
                  <p className="text-gray-400">Total Portfolio Value</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-1">SOL Balance</p>
                  <p className="text-xl font-bold text-white">{formatNumber(solBalance)} SOL</p>
                  <p className="text-sm text-gray-500">{formatUsd(solBalance * solPrice)}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-1">Tokens</p>
                  <p className="text-xl font-bold text-white">{tokens.length}</p>
                  <p className="text-sm text-gray-500">
                    {formatUsd(tokens.reduce((s, t) => s + t.usdValue, 0))}
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-1">NFTs</p>
                  <p className="text-xl font-bold text-white">{nfts.length}</p>
                  <p className="text-sm text-gray-500">Collections</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-1">SOL Price</p>
                  <p className="text-xl font-bold text-white">{formatUsd(solPrice)}</p>
                  <p className="text-sm text-green-400 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" /> Live
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-2">
              {[
                { id: 'tokens', label: 'Tokens', icon: PieChart },
                { id: 'nfts', label: 'NFTs', icon: Image },
                { id: 'transactions', label: 'Transactions', icon: History },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors ${
                    activeTab === tab.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
              {activeTab === 'tokens' && (
                <div className="divide-y divide-white/5">
                  {loading ? (
                    <div className="p-8 text-center text-gray-400">Loading tokens...</div>
                  ) : tokens.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">No tokens found</div>
                  ) : (
                    tokens.map((token) => (
                      <div
                        key={token.mint}
                        className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          {token.logoUri ? (
                            <img
                              src={token.logoUri}
                              alt={token.symbol}
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-white font-bold">
                              {token.symbol.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="text-white font-medium">{token.symbol}</p>
                            <p className="text-gray-500 text-sm">{token.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-medium">{formatNumber(token.balance)}</p>
                          <p className="text-gray-400 text-sm">{formatUsd(token.usdValue)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'nfts' && (
                <div className="p-4">
                  {loading ? (
                    <div className="p-8 text-center text-gray-400">Loading NFTs...</div>
                  ) : nfts.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">No NFTs found</div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {nfts.map((nft) => (
                        <div
                          key={nft.mint}
                          className="rounded-xl overflow-hidden bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                        >
                          <div className="aspect-square">
                            <img
                              src={nft.image}
                              alt={nft.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://via.placeholder.com/200?text=NFT';
                              }}
                            />
                          </div>
                          <div className="p-3">
                            <p className="text-white text-sm font-medium truncate">{nft.name}</p>
                            {nft.collection && (
                              <p className="text-gray-500 text-xs truncate">{nft.collection}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'transactions' && (
                <div className="divide-y divide-white/5">
                  {loading ? (
                    <div className="p-8 text-center text-gray-400">Loading transactions...</div>
                  ) : transactions.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">No transactions found</div>
                  ) : (
                    transactions.map((tx) => (
                      <div
                        key={tx.signature}
                        className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              tx.type === 'receive'
                                ? 'bg-green-500/20 text-green-400'
                                : tx.type === 'send'
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-purple-500/20 text-purple-400'
                            }`}
                          >
                            {tx.type === 'receive' ? (
                              <ArrowDownLeft className="w-5 h-5" />
                            ) : tx.type === 'send' ? (
                              <ArrowUpRight className="w-5 h-5" />
                            ) : (
                              <RefreshCw className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <p className="text-white font-medium capitalize">{tx.type}</p>
                            <p className="text-gray-500 text-sm">{formatDate(tx.timestamp)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-medium ${
                              tx.type === 'receive' ? 'text-green-400' : 'text-white'
                            }`}
                          >
                            {tx.type === 'receive' ? '+' : '-'}
                            {formatNumber(tx.amount)} {tx.token}
                          </p>
                          <a
                            href={`https://solscan.io/tx/${tx.signature}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-500 text-sm hover:text-purple-400 flex items-center justify-end"
                          >
                            {formatAddress(tx.signature, 4)}
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500">
            Built with ❤️ by{' '}
            <a
              href="https://github.com/Sugusdaddy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300"
            >
              @Sugusdaddy
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
