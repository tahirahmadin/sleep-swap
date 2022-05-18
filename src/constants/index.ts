import { Token } from "../utils/interface";

export const NetworkContextName = "NETWORK";
export const supportedChains = [
  1, 4, 1285, 1287, 97, 56, 137, 80001, 1666700000, 1666600000,
];

export const ALLOWANCE_AMOUNT = "999999999";

export const SLEEP_SWAP_ADDRESSES: { [index: number]: string } = {
  1: "",
  42: "0x6598CE2D75355c5FE166ead7B41419D1DD44947c",
};

export const TOKENS: { [index: string]: Token } = {
  USDT: {
    name: "USDT",
    symbol: "Us Tether",
    address: "0x13512979ADE267AB5100878E2e0f485B568328a4",
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
  ETH: {
    name: "Eth",
    symbol: "ETH",
    address: "",
    decimals: 18,
    chainId: 42,
  },
};
export const TOKEN_ADDRESSES: { [index: string]: { [index: number]: string } } =
  {
    USDT: {
      1: "",
      42: "0x13512979ADE267AB5100878E2e0f485B568328a4",
      137: "",
      80001: "",
    },
    LINK: {
      1: "",
      42: "",
      137: "",
      80001: "",
    },
    MATIC: {
      137: "",
      80001: "",
    },
  };

export const CONNECTOR_TYPE = {
  injected: "injected",
  walletConnect: "walletConnect",
};
