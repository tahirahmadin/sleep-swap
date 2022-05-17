import { useCallback, useEffect, useMemo, useState } from "react";
import BigNumber from "bignumber.js";
import { SLEEP_SWAP_ADDRESSES } from "../constants";
import { useChain, useMoralis, useMoralisWeb3Api } from "react-moralis";

import tokenAbi from "../contracts/abi/erc20.json";
import sleepAbi from "../contracts/abi/sleepSwap.json";
import { UserStakedInfo, UserTradeSettings } from "../utils/interface";

export function useUserTrade(
  token?: string
):
  | [
      UserStakedInfo | undefined,
      UserTradeSettings | undefined,
      (amount: string) => {}
    ]
  | null {
  // const contract = useTokenContract(token?.address, false);
  const { chainId, account, chain } = useChain();
  const [userTradeSettings, setUserTradeSettings] = useState<
    UserTradeSettings | undefined
  >(undefined); // fetch user trade settings from blockchain and update
  const [userTradeInfo, setTradeInfo] = useState<UserStakedInfo | undefined>(
    undefined
  ); // fetch user trade info on each block update
  const { Moralis } = useMoralis();
  const Web3Api = useMoralisWeb3Api();
  const [tradeLoading, setLoading] = useState(false);

  const sleepSwapAddress = SLEEP_SWAP_ADDRESSES?.[42];
  const startTradeOrder = useCallback(
    async (amount: string) => {
      setLoading(true);
      try {
        console.log("starting order");
        const sendOptions: any = {
          contractAddress: sleepSwapAddress,
          functionName: "startYieldSwap",
          abi: sleepAbi,
          params: {
            _token: token,
            _tokenAmount: parseInt(amount),
            ethPriceInUSD: 200000000000, // temp params for testing only
          },
        };
        console.log("options ", sendOptions);
        const transaction: any = await Moralis.executeFunction(sendOptions);
        console.log(transaction.hash);

        await transaction?.wait();
        console.log(transaction);
      } catch (error) {
        console.log("update trade  error ", { error });
      }
      setLoading(false);
    },
    [chainId]
  );

  const fetchUserTradeSettings = async () => {
    const readOptions: any = {
      contractAddress: SLEEP_SWAP_ADDRESSES?.[42],
      functionName: "userTradeSettings",
      abi: sleepAbi,
      params: {
        account: account,
      },
    };

    try {
      // Read new value
      const message = await Moralis.executeFunction(readOptions);
      console.log(message);
    } catch (error) {
      console.log("allowance error ", error);
    }
  };

  const fetchUserTradeInfo = async () => {
    const readOptions: any = {
      contractAddress: SLEEP_SWAP_ADDRESSES?.[42],
      functionName: "getUserInfo",
      abi: sleepAbi,
      params: {
        _account: account,
      },
    };

    try {
      // Read new value
      const info: any = await Moralis.executeFunction(readOptions);
      console.log("user Trade info", info);
      setTradeInfo({
        staked: info?._totalStaked?.toString(),
        tokenBalance: info?._tokenBalance?.toString(),
        usdtBalance: info?._fiatBalance?.toString(),
        sellOrderAmount: info?._ethOrderAmount?.toString(),
        buyOrderAmount: info?._usdtOrderAmount?.toString(),
        earnings: "0",
      });

      // todo: fetch this from blockchain
      setUserTradeSettings({ grids: 5, sellThresold: 10, buyThresold: 10 });
    } catch (error) {
      console.log("allowance error ", error);
    }
  };

  useEffect(() => {
    if (!account || !token) {
      return;
    }

    fetchUserTradeInfo();
  }, [account, account, token]);

  return useMemo(
    () => [userTradeInfo, userTradeSettings, startTradeOrder],
    [token, userTradeInfo, userTradeSettings]
  );
}
