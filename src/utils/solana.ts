import { Connection, PublicKey, LAMPORTS_PER_SOL, ParsedAccountData } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

// RPC endpoints with automatic failover
const RPC_ENDPOINTS = [
  'https://api.mainnet-beta.solana.com',
  'https://solana-mainnet.g.alchemy.com/v2/demo',
  'https://rpc.ankr.com/solana',
];

let currentEndpointIndex = 0;

export const getConnection = (): Connection => {
  const endpoint = import.meta.env.VITE_RPC_ENDPOINT || RPC_ENDPOINTS[currentEndpointIndex];
  return new Connection(endpoint, 'confirmed');
};

export const rotateEndpoint = (): void => {
  currentEndpointIndex = (currentEndpointIndex + 1) % RPC_ENDPOINTS.length;
  console.log(`Rotated to RPC endpoint: ${RPC_ENDPOINTS[currentEndpointIndex]}`);
};

export interface WalletBalance {
  sol: number;
  solUsd: number;
  tokens: TokenBalance[];
  totalUsd: number;
}

export interface TokenBalance {
  mint: string;
  symbol: string;
  name: string;
  balance: number;
  decimals: number;
  usdValue: number;
  logoUri?: string;
  pricePerToken: number;
}

export interface Transaction {
  signature: string;
  timestamp: number;
  type: 'send' | 'receive' | 'swap' | 'nft' | 'other';
  amount: number;
  token: string;
  from: string;
  to: string;
  fee: number;
  status: 'success' | 'failed';
}

export interface NFT {
  mint: string;
  name: string;
  image: string;
  collection?: string;
  attributes: Array<{ trait_type: string; value: string }>;
}

// Fetch SOL balance
export const getSolBalance = async (address: string): Promise<number> => {
  const connection = getConnection();
  const publicKey = new PublicKey(address);
  
  try {
    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Error fetching SOL balance:', error);
    rotateEndpoint();
    throw error;
  }
};

// Fetch all token accounts
export const getTokenBalances = async (address: string): Promise<TokenBalance[]> => {
  const connection = getConnection();
  const publicKey = new PublicKey(address);
  
  try {
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      publicKey,
      { programId: TOKEN_PROGRAM_ID }
    );

    const tokens: TokenBalance[] = [];
    
    for (const account of tokenAccounts.value) {
      const parsedInfo = account.account.data as ParsedAccountData;
      const tokenData = parsedInfo.parsed.info;
      const balance = tokenData.tokenAmount.uiAmount;
      
      if (balance > 0) {
        const mintAddress = tokenData.mint;
        const metadata = await getTokenMetadata(mintAddress);
        const price = await getTokenPrice(mintAddress);
        
        tokens.push({
          mint: mintAddress,
          symbol: metadata?.symbol || 'Unknown',
          name: metadata?.name || 'Unknown Token',
          balance: balance,
          decimals: tokenData.tokenAmount.decimals,
          usdValue: balance * price,
          logoUri: metadata?.logoUri,
          pricePerToken: price,
        });
      }
    }

    // Sort by USD value descending
    return tokens.sort((a, b) => b.usdValue - a.usdValue);
  } catch (error) {
    console.error('Error fetching token balances:', error);
    rotateEndpoint();
    throw error;
  }
};

// Fetch token metadata from Jupiter
export const getTokenMetadata = async (mint: string): Promise<{
  symbol: string;
  name: string;
  logoUri?: string;
} | null> => {
  try {
    const response = await fetch(`https://token.jup.ag/strict`);
    const tokens = await response.json();
    const token = tokens.find((t: any) => t.address === mint);
    
    if (token) {
      return {
        symbol: token.symbol,
        name: token.name,
        logoUri: token.logoURI,
      };
    }
    return null;
  } catch {
    return null;
  }
};

// Fetch token price from Jupiter
export const getTokenPrice = async (mint: string): Promise<number> => {
  try {
    const response = await fetch(`https://price.jup.ag/v6/price?ids=${mint}`);
    const data = await response.json();
    return data.data[mint]?.price || 0;
  } catch {
    return 0;
  }
};

// Fetch SOL price
export const getSolPrice = async (): Promise<number> => {
  try {
    const response = await fetch(
      'https://price.jup.ag/v6/price?ids=So11111111111111111111111111111111111111112'
    );
    const data = await response.json();
    return data.data['So11111111111111111111111111111111111111112']?.price || 0;
  } catch {
    return 0;
  }
};

// Fetch transaction history
export const getTransactionHistory = async (
  address: string,
  limit: number = 50
): Promise<Transaction[]> => {
  const connection = getConnection();
  const publicKey = new PublicKey(address);
  
  try {
    const signatures = await connection.getSignaturesForAddress(publicKey, { limit });
    const transactions: Transaction[] = [];
    
    for (const sig of signatures) {
      const tx = await connection.getParsedTransaction(sig.signature, {
        maxSupportedTransactionVersion: 0,
      });
      
      if (tx) {
        const instruction = tx.transaction.message.instructions[0];
        let type: Transaction['type'] = 'other';
        let amount = 0;
        let token = 'SOL';
        
        // Parse transaction type
        if ('parsed' in instruction) {
          const parsed = instruction.parsed;
          if (parsed.type === 'transfer') {
            type = parsed.info.destination === address ? 'receive' : 'send';
            amount = parsed.info.lamports / LAMPORTS_PER_SOL;
          } else if (parsed.type === 'transferChecked') {
            type = parsed.info.destination === address ? 'receive' : 'send';
            amount = parsed.info.tokenAmount.uiAmount;
            token = parsed.info.mint.slice(0, 8) + '...';
          }
        }
        
        transactions.push({
          signature: sig.signature,
          timestamp: sig.blockTime ? sig.blockTime * 1000 : Date.now(),
          type,
          amount,
          token,
          from: tx.transaction.message.accountKeys[0].pubkey.toString(),
          to: tx.transaction.message.accountKeys[1]?.pubkey.toString() || '',
          fee: (tx.meta?.fee || 0) / LAMPORTS_PER_SOL,
          status: tx.meta?.err ? 'failed' : 'success',
        });
      }
    }
    
    return transactions;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    rotateEndpoint();
    throw error;
  }
};

// Fetch NFTs using Helius DAS API
export const getNFTs = async (address: string): Promise<NFT[]> => {
  const heliusKey = import.meta.env.VITE_HELIUS_API_KEY;
  
  if (!heliusKey) {
    console.warn('Helius API key not configured, NFT fetching disabled');
    return [];
  }
  
  try {
    const response = await fetch(`https://mainnet.helius-rpc.com/?api-key=${heliusKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'nft-fetch',
        method: 'getAssetsByOwner',
        params: {
          ownerAddress: address,
          page: 1,
          limit: 100,
        },
      }),
    });
    
    const data = await response.json();
    const nfts: NFT[] = [];
    
    for (const asset of data.result?.items || []) {
      if (asset.interface === 'V1_NFT' || asset.interface === 'ProgrammableNFT') {
        nfts.push({
          mint: asset.id,
          name: asset.content?.metadata?.name || 'Unknown NFT',
          image: asset.content?.files?.[0]?.uri || asset.content?.links?.image || '',
          collection: asset.grouping?.find((g: any) => g.group_key === 'collection')?.group_value,
          attributes: asset.content?.metadata?.attributes || [],
        });
      }
    }
    
    return nfts;
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    return [];
  }
};

// Subscribe to account changes (websocket)
export const subscribeToWallet = (
  address: string,
  callback: (balance: number) => void
): number => {
  const connection = getConnection();
  const publicKey = new PublicKey(address);
  
  return connection.onAccountChange(
    publicKey,
    (accountInfo) => {
      callback(accountInfo.lamports / LAMPORTS_PER_SOL);
    },
    'confirmed'
  );
};

// Unsubscribe from account changes
export const unsubscribeFromWallet = (subscriptionId: number): void => {
  const connection = getConnection();
  connection.removeAccountChangeListener(subscriptionId);
};

// Validate Solana address
export const isValidSolanaAddress = (address: string): boolean => {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
};

// Format address for display
export const formatAddress = (address: string, chars: number = 4): string => {
  if (!address) return '';
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};
