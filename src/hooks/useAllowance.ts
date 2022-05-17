import { useCallback, useEffect, useMemo, useState } from "react";
import BigNumber from "bignumber.js";
import { SLEEP_SWAP_ADDRESSES } from "../constants";
import { useChain, useMoralis, useMoralisWeb3Api } from "react-moralis";

import tokenAbi from "../contracts/abi/erc20.json";

export function useTokenAllowance(
  token?: string
): [boolean, () => {}, boolean] {
  // const contract = useTokenContract(token?.address, false);
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
      // --> "0x39af55979f5b690fdce14eb23f91dfb0357cb1a27f387656e197636e597b5b7c"

      // Wait until the transaction is confirmed
      await transaction?.wait();

      console.log(transaction);

      // const response = await tokenContract?.approve(
      //   spender,
      //   balance
      // );
      setAllowance(true);

      // if (token?.address && spender) {
      //   addTransaction(response, {
      //     summary: "Approve " + token?.symbol,
      //     approval: { tokenAddress: token?.address, spender: spender },
      //   });
      // }
    } catch (error) {
      console.log("approve error ", { error });
    }
    setLoading(false);
  }, [chainId]);

  const fetchTokenAllowance = async () => {
    //Get token allowace on ETH
    const options: any = {
      //token holder
      owner_address: account,
      //uniswap v3 router 2 contract address
      spender_address: spender,
      //ENS token contract address
      address: "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72",
      token,
    };

    try {
      const _allowance = await Web3Api.token.getTokenAllowance(options);
      console.log("fetched allowance", {
        flag: new BigNumber(Moralis.Units.FromWei(_allowance.allowance)).gt(0),
        _allowance,
      });
      setAllowance(_allowance?.allowance === "true");
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
