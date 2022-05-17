import { useCallback, useEffect, useMemo, useState } from "react";
import BigNumber from "bignumber.js";
import { SLEEP_SWAP_ADDRESSES } from "../constants";
import { useChain, useMoralis, useMoralisWeb3Api } from "react-moralis";

import tokenAbi from "../contracts/abi/erc20.json";

export function useTokenAllowance(
  token?: string
): [boolean, () => {}, boolean] {
  const [allowance, setAllowance] = useState(true);
  const [confirmationLoading, setLoading] = useState(false);
  const { chainId, account, chain } = useChain();
  const { Moralis } = useMoralis();
  const Web3Api = useMoralisWeb3Api();

  const spender = SLEEP_SWAP_ADDRESSES?.[42];
  const confirmAllowance = useCallback(async () => {
    setLoading(true);
    try {
      const sendOptions: any = {
        contractAddress: token,
        functionName: "approve",
        abi: tokenAbi,
        params: {
          _spender: spender,
          _value: 9999999000000,
        },
      };

      const transaction: any = await Moralis.executeFunction(sendOptions);
      console.log(transaction.hash);

      // Wait until the transaction is confirmed
      await transaction?.wait();

      console.log(transaction);

      setAllowance(true);
    } catch (error) {
      console.log("approve error ", { error });
    }
    setLoading(false);
  }, [chainId]);

  const fetchTokenAllowance = async () => {
    //Get token allowace on ETH
    const options: any = {
      chain: "kovan",
      owner_address: account,
      spender_address: spender,
      address: token,
    };

    try {
      const _allowance = await Web3Api.token.getTokenAllowance(options);

      setAllowance(new BigNumber(_allowance?.allowance).gt(0) ? true : false);
    } catch (error) {
      console.log("allowance error ", error);
    }
  };

  useEffect(() => {
    if (!account || !token) {
      return;
    }

    fetchTokenAllowance();
  }, [account, account, token]);

  return useMemo(
    () => [allowance, confirmAllowance, confirmationLoading],
    [token, allowance, account, confirmationLoading]
  );
}
