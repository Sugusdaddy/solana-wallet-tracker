import { useState, useEffect, useCallback } from 'react';
import {
  getSolBalance,
  getTokenBalances,
  getSolPrice,
  getTransactionHistory,
  getNFTs,
  subscribeToWallet,
  unsubscribeFromWallet,
  isValidSolanaAddress,
  TokenBalance,
  Transaction,
  NFT,
} from '../utils/solana';

export interface WalletData {
  address: string;
  solBalance: number;
  solPrice: number;
  tokens: TokenBalance[];
  transactions: Transaction[];
  nfts: NFT[];
  totalValueUsd: number;
  loading: boolean;
  error: string | null;
}

export const useWallet = (address: string) => {
  const [data, setData] = useState<WalletData>({
    address: '',
    solBalance: 0,
    solPrice: 0,
    tokens: [],
    transactions: [],
    nfts: [],
    totalValueUsd: 0,
    loading: false,
    error: null,
  });

  const fetchWalletData = useCallback(async () => {
    if (!address || !isValidSolanaAddress(address)) {
      setData(prev => ({ ...prev, error: 'Invalid Solana address', loading: false }));
      return;
    }

    setData(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Fetch all data in parallel
      const [solBalance, solPrice, tokens, transactions, nfts] = await Promise.all([
        getSolBalance(address),
        getSolPrice(),
        getTokenBalances(address),
        getTransactionHistory(address, 50),
        getNFTs(address),
      ]);

      const solValueUsd = solBalance * solPrice;
      const tokensValueUsd = tokens.reduce((sum, t) => sum + t.usdValue, 0);
      const totalValueUsd = solValueUsd + tokensValueUsd;

      setData({
        address,
        solBalance,
        solPrice,
        tokens,
        transactions,
        nfts,
        totalValueUsd,
        loading: false,
        error: null,
      });
    } catch (error) {
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch wallet data',
      }));
    }
  }, [address]);

  // Subscribe to real-time balance updates
  useEffect(() => {
    if (!address || !isValidSolanaAddress(address)) return;

    const subscriptionId = subscribeToWallet(address, (newBalance) => {
      setData(prev => ({
        ...prev,
        solBalance: newBalance,
        totalValueUsd: newBalance * prev.solPrice + prev.tokens.reduce((sum, t) => sum + t.usdValue, 0),
      }));
    });

    return () => {
      unsubscribeFromWallet(subscriptionId);
    };
  }, [address]);

  // Initial fetch
  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  return {
    ...data,
    refresh: fetchWalletData,
  };
};

// Hook for tracking multiple wallets
export const useMultipleWallets = (addresses: string[]) => {
  const [wallets, setWallets] = useState<Map<string, WalletData>>(new Map());
  const [loading, setLoading] = useState(false);

  const fetchAllWallets = useCallback(async () => {
    setLoading(true);
    const newWallets = new Map<string, WalletData>();

    await Promise.all(
      addresses.map(async (address) => {
        if (!isValidSolanaAddress(address)) return;

        try {
          const [solBalance, solPrice, tokens] = await Promise.all([
            getSolBalance(address),
            getSolPrice(),
            getTokenBalances(address),
          ]);

          const solValueUsd = solBalance * solPrice;
          const tokensValueUsd = tokens.reduce((sum, t) => sum + t.usdValue, 0);

          newWallets.set(address, {
            address,
            solBalance,
            solPrice,
            tokens,
            transactions: [],
            nfts: [],
            totalValueUsd: solValueUsd + tokensValueUsd,
            loading: false,
            error: null,
          });
        } catch (error) {
          newWallets.set(address, {
            address,
            solBalance: 0,
            solPrice: 0,
            tokens: [],
            transactions: [],
            nfts: [],
            totalValueUsd: 0,
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch',
          });
        }
      })
    );

    setWallets(newWallets);
    setLoading(false);
  }, [addresses]);

  useEffect(() => {
    fetchAllWallets();
  }, [fetchAllWallets]);

  const totalValue = Array.from(wallets.values()).reduce(
    (sum, w) => sum + w.totalValueUsd,
    0
  );

  return {
    wallets,
    totalValue,
    loading,
    refresh: fetchAllWallets,
  };
};

// Hook for whale tracking
export const useWhaleTracker = (
  addresses: string[],
  minAmount: number = 100 // SOL
) => {
  const [alerts, setAlerts] = useState<Transaction[]>([]);

  useEffect(() => {
    const checkTransactions = async () => {
      for (const address of addresses) {
        if (!isValidSolanaAddress(address)) continue;

        const transactions = await getTransactionHistory(address, 10);
        const whaleTransactions = transactions.filter(
          (tx) => tx.token === 'SOL' && tx.amount >= minAmount
        );

        if (whaleTransactions.length > 0) {
          setAlerts(prev => [...whaleTransactions, ...prev].slice(0, 50));
        }
      }
    };

    checkTransactions();
    const interval = setInterval(checkTransactions, 30000); // Check every 30s

    return () => clearInterval(interval);
  }, [addresses, minAmount]);

  return alerts;
};
