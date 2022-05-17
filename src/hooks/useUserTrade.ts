import { useCallback, useEffect, useMemo, useState } from "react";
import { SLEEP_SWAP_ADDRESSES } from "../constants";
import { useChain, useMoralis, useMoralisWeb3Api } from "react-moralis";

import sleepAbi from "../contracts/abi/sleepSwap.json";
import { UserStakedInfo, UserTradeSettings } from "../utils/interface";

export function useUserTrade(token?: string):
  | [
      UserStakedInfo | undefined,
      UserTradeSettings | undefined,
      (amount: string) => {},
      () => {},
      {
        state: number;
        hash: string | null;
      },
      () => void
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
  const [transactionState, setTrxState] = useState<{
    state: number;
    hash: string | null;
  }>({ state: 0, hash: null });

  const sleepSwapAddress = SLEEP_SWAP_ADDRESSES?.[42];
  const startTradeOrder = useCallback(
    async (amount: string) => {
      setLoading(true);
      try {
        setTrxState({ state: 1, hash: null });
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
        const transaction: any = await Moralis.executeFunction(sendOptions);
        // console.log(transaction.hash);
        setTrxState({ state: 2, hash: transaction.hash });

        await transaction?.wait();
        console.log(transaction);
        setTrxState({ hash: transaction.hash, state: 3 });
      } catch (error) {
        console.log("update trade  error ", { error });
        setTrxState({ ...transactionState, state: 4 });
      }
      setLoading(false);
    },
    [chainId]
  );

  const withdrawUserFunds = useCallback(async () => {
    setLoading(true);
    try {
      setTrxState({ state: 1, hash: null });
      const sendOptions: any = {
        contractAddress: sleepSwapAddress,
        functionName: "withdrawUserFunds",
        abi: sleepAbi,
        params: {
          _token: token,
        },
      };
      const transaction: any = await Moralis.executeFunction(sendOptions);
      // console.log(transaction.hash);
      setTrxState({ state: 2, hash: transaction.hash });

      await transaction?.wait();
      console.log(transaction);
      setTrxState({ hash: transaction.hash, state: 3 });
    } catch (error) {
      console.log("update trade  error ", { error });
      setTrxState({ ...transactionState, state: 4 });
    }
    setLoading(false);
  }, [chainId]);

  const resetTrxState = useCallback(() => {
    setTrxState({ state: 0, hash: null });
  }, []);

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
      // console.log(message);
    } catch (error) {
      console.log("allowance error ", error);
    }
  };

  const fetchUserTradeInfo = async () => {
    console.log("fetching new trade info ", { account });
    const readOptions0: any = {
      contractAddress: SLEEP_SWAP_ADDRESSES?.[42],
      functionName: "getUserInfo",
      abi: sleepAbi,
      params: {
        _account: account,
      },
    };
    const readOptions1: any = {
      contractAddress: SLEEP_SWAP_ADDRESSES?.[42],
      functionName: "getUserOrderStatus",
      abi: sleepAbi,
      params: {
        _account: account,
      },
    };

    try {
      // Read new value
      const [info, orders]: [any, any] = await Promise.all([
        Moralis.executeFunction(readOptions0),
        Moralis.executeFunction(readOptions1),
      ]);
      console.log("user Trade info", info);
      setTradeInfo({
        staked: info?._totalStaked?.toString(),
        tokenBalance: info?._tokenBalance?.toString(),
        usdtBalance: info?._fiatBalance?.toString(),
        sellOrderAmount: info?._ethOrderAmount?.toString(),
        buyOrderAmount: info?._usdtOrderAmount?.toString(),
        earnings: "0",
        completedBuyOrders: orders?._buyRuns?.toString(),
        completedSellOrders: orders?._sellRuns?.toString(),
      });

      // todo: fetch this from blockchain
      setUserTradeSettings({ grids: 5, sellThresold: 10, buyThresold: 10 });
    } catch (error) {
      console.log("fetchUserTradeInfo error ", error);
    }
  };

  useEffect(() => {
    if (!account || !token) {
      return;
    }

    fetchUserTradeInfo();
  }, [account, account, token, transactionState]);

  return useMemo(
    () => [
      userTradeInfo,
      userTradeSettings,
      startTradeOrder,
      withdrawUserFunds,
      transactionState,
      resetTrxState,
    ],
    [
      token,
      userTradeInfo,
      userTradeSettings,
      transactionState,
      resetTrxState,
      withdrawUserFunds,
      fetchUserTradeInfo,
    ]
  );
}
