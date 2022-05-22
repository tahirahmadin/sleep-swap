import { Token } from "../utils/interface";

export const NetworkContextName = "NETWORK";
export const supportedChains = [
  1, 4, 1285, 1287, 97, 56, 137, 80001, 1666700000, 1666600000,
];

//
export const CHAIN: number = 42;

export const NATIVE_TOKEN = {
  42: "ETH",
  80001: "MATIC",
};

export const ALLOWANCE_AMOUNT = "999999999";

export const SLEEP_SWAP_ADDRESSES: { [index: number]: string } = {
  1: "",
  42: "0xBDcE250Ae6ae354ef009c57cC7567FE3b7AEAaA0",
  80001: "0xc112aE0E502f5c98a7cd78a6c26631Bc1e937029",
};

export const TOKENS: { [index: number]: { [index: string]: Token } } = {
  42: {
    USDT: {
      name: "USDT",
      symbol: "Us Tether",
      address: "0x13512979ADE267AB5100878E2e0f485B568328a4",
      decimals: 6,
      chainId: 42,
    },
    ETH: {
      name: "Eth",
      symbol: "ETH",
      address: "",
      decimals: 18,
      chainId: 42,
    },
    LINK: {
      name: "Link",
      symbol: "LINK",
      address: "0xa36085F69e2889c224210F603D836748e7dC0088",
      decimals: 18,
      chainId: 42,
    },
  },
  80001: {
    USDT: {
      name: "USDT",
      symbol: "Us Tether",
      address: "0x361e1790eE98532D34B3b850Df4D5D7f7E986AA8",
      decimals: 6,
      chainId: 42,
    },
    MATIC: {
      name: "MATIC",
      symbol: "MATIC",
      address: "",
      decimals: 18,
      chainId: 42,
    },
    LINK: {
      name: "Link",
      symbol: "LINK",
      address: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
      decimals: 18,
      chainId: 42,
    },
  },
};
export const CONNECTOR_TYPE = {
  injected: "injected",
  walletConnect: "walletConnect",
};
