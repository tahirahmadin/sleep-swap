import { useEffect, useMemo, useState } from "react";
import { CHAIN, SLEEP_SWAP_ADDRESSES } from "../constants";
import { useChain, useMoralis, useMoralisWeb3Api } from "react-moralis";

import sleepAbi from "../contracts/abi/sleepSwap.json";
import { PoolInfo } from "../utils/interface";

export function usePoolInfo(): [PoolInfo | undefined, () => void, boolean] {
  // const contract = useTokenContract(token?.address, false);
  const { account, chainId } = useChain();
  const [poolInfo, setPoolInfo] = useState<PoolInfo | undefined>(undefined); // fetch user trade settings from blockchain and update

  const { Moralis } = useMoralis();
  const Web3Api = useMoralisWeb3Api();
  const [poolLoading, setLoading] = useState(false);

  //Todo: replace this function with graph query when graph ready:
  const fetchPoolInfo = async () => {
    const readOptions: any = {
      contractAddress: SLEEP_SWAP_ADDRESSES?.[CHAIN],
      functionName: "getPoolInfo",
      abi: sleepAbi,
    };

    try {
      // Read new value
      const info: any = await Moralis.executeFunction(readOptions);

      // console.log("fetched pool info ", { info });
      setPoolInfo({
        totalEthInPool: info?._totalEthReserve?.toString(),
        totalFee: info?._totalFee?.toString(),
        totalDeposits: info?._totalDeposits?.toString(),
        totalOrders: info?._totalOrders?.toString(),
        ethPriceUsd: info?._ethPrice?.toString(),
        averageGain: "0",
      });
    } catch (error) {
      console.log("pool fetch error ", error);
    }
  };

  useEffect(() => {
    if (!account) {
      return;
    }

    fetchPoolInfo();
  }, [account]);

  return useMemo(
    () => [poolInfo, fetchPoolInfo, poolLoading],
    [poolInfo, poolLoading]
  );
}
