export interface Token {
  name: string;
  decimals: number;
  symbol: string;
  address: string;
  chainId: number;
}

export interface PoolInfo {
  totalEthInPool: string; // total usdt deposits
  totalFee: string; // total eth reserve
  totalUsdtInPool: string;
  totalOrders: string;
  averageGain: string | undefined;
  ethPriceUsd: string;
}

export interface UserTradeSettings {
  grids: number;
  sellThresold: number;
  buyThresold: number;
}

export interface UserStakedInfo {
  staked: string;
  earnings: string;
  usdtBalance: string;
  tokenBalance: string;
  buyOrderAmount: string;
  sellOrderAmount: string;
  completedBuyOrders: string;
  completedSellOrders: string;
}

export interface TransactionStatus {
  status: number;
  hash: string | null;
}

export interface AuthStatus {
  authenticated: boolean;
  account: string | null | undefined;
}
