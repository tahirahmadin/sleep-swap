import { useEffect, useMemo, useState } from "react";
import { useChain, useMoralisWeb3Api } from "react-moralis";

// get the balance for a single token/account combo
export function useTokenBalance(token?: string): string | undefined {
  const Web3Api = useMoralisWeb3Api();
  const [tokenBalance, setBalance] = useState("");
  const { account, chainId } = useChain();

  const fetchTokenBalances = async () => {
    try {
      const options: any = {
        chain: "kovan",
        token_addresses: [token],
        // to_block: "31642422",
      };
      const balances = await Web3Api.account.getTokenBalances(options);
      // console.log(balances);
      setBalance(balances?.[0]?.balance?.toString());
    } catch (error) {
      console.log("balance fetch error ", { error, token });
    }
  };

  useEffect(() => {
    if (!account) {
      return;
    }
    fetchTokenBalances();
  }, [chainId, account]);

  return useMemo(() => {
    return tokenBalance;
  }, [tokenBalance]);
}
