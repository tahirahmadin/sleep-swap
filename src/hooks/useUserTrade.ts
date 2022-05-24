import { useCallback, useEffect, useMemo, useState } from "react";
import { CHAIN, SLEEP_SWAP_ADDRESSES } from "../constants";
import { useChain, useMoralis } from "react-moralis";

import sleepAbi from "../contracts/abi/sleepSwap.json";
import {
  TransactionStatus,
  UserStakedInfo,
  UserTradeSettings,
} from "../utils/interface";

export function useUserTrade(
  token?: string
):
  | [
      UserStakedInfo | undefined,
      UserTradeSettings | undefined,
      (amount: string, grids: number, percent: number) => {},
      () => {},
      TransactionStatus,
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

  const [transactionState, setTrxState] = useState<TransactionStatus>({
    status: 0,
    hash: null,
  });

  const sleepSwapAddress = SLEEP_SWAP_ADDRESSES?.[CHAIN];
  const startTradeOrder = useCallback(
    async (amount: string, grids: number, percent: number) => {
      try {
        setTrxState({ status: 1, hash: null });
        const sendOptions: any = {
          contractAddress: sleepSwapAddress,
          functionName: "startYieldSwap",
          abi: sleepAbi,
          params: {
            _token: token,
            _tokenAmount: amount,
            _gridCount: grids,
            _percentChange: percent,
          },
        };
        const transaction: any = await Moralis.executeFunction(sendOptions);
        // console.log(transaction.hash);
        setTrxState({ status: 2, hash: transaction.hash });

        await transaction?.wait();
        console.log(transaction);
        setTrxState({ hash: transaction.hash, status: 3 });
      } catch (error) {
        console.log("update trade  error ", { error });
        setTrxState({ ...transactionState, status: 4 });
      }
    },
    [chainId]
  );

  const withdrawUserFunds = useCallback(async () => {
    try {
      setTrxState({ status: 1, hash: null });
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
      setTrxState({ status: 2, hash: transaction.hash });

      await transaction?.wait();
      console.log(transaction);
      setTrxState({ hash: transaction.hash, status: 3 });
    } catch (error) {
      console.log("update trade  error ", { error });
      setTrxState({ ...transactionState, status: 4 });
    }
  }, [chainId]);

  const resetTrxState = useCallback(() => {
    setTrxState({ status: 0, hash: null });
  }, []);

  const fetchUserTradeSettings = async () => {
    const readOptions: any = {
      contractAddress: SLEEP_SWAP_ADDRESSES?.[CHAIN],
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
    const readOptions0: any = {
      contractAddress: SLEEP_SWAP_ADDRESSES?.[CHAIN],
      functionName: "getUserInfo",
      abi: sleepAbi,
      params: {
        _account: account,
      },
    };
    const readOptions1: any = {
      contractAddress: SLEEP_SWAP_ADDRESSES?.[CHAIN],
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

      // console.log("order info ", orders);
      setTradeInfo({
        staked: info?._totalStaked?.toString(),
        tokenBalance: info?._tokenBalance?.toString(),
        usdtBalance: info?._fiatBalance?.toString(),
        sellOrderAmount: info?._ethOrderAmount?.toString(),
        buyOrderAmount: info?._usdtOrderAmount?.toString(),
        earnings: "0",
        completedBuyOrders: orders?._buyRuns?.toString(),
        completedSellOrders: orders?._sellRuns?.toString(),
        gridCount: orders?._grids?.toString(),
        percentChange: orders?._percent?.toString(),
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
