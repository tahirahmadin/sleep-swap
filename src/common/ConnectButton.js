import React, { useEffect, useState } from "react";
import { makeStyles } from "@mui/styles";
import {
  Box,
  Button,
  Slide,
  Backdrop,
  useTheme,
  Dialog,
  CircularProgress,
} from "@mui/material";
import { useMoralis, useChain, useMoralisWeb3Api } from "react-moralis";
import AccountPopup from "./AccountPopup";
import Web3 from "web3";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const useStyles = makeStyles((theme) => ({
  background: {
    height: "100%",
    width: "100%",
    paddingTop: "5%",
    paddingBottom: "5%",
    backgroundColor: "#6A55EA",
    borderRadius: 20,
    "&:hover": {
      boxShadow: "0px 24px 33px -9px #0000005C",
    },
  },
  heading: {
    fontWeight: 600,
    fontSize: 32,
    letterSpacing: "0.02em",
    color: "#212121",
    textAlign: "center",
    [theme.breakpoints.down("md")]: {
      color: "#212121",
    },
  },
  para: {
    fontWeight: 400,
    fontSize: 16,
    letterSpacing: "-0.02em",
    color: "#414141",
    textAlign: "center",
    lineHeight: 1.5,
  },

  title: {
    fontWeight: 600,
    fontSize: 20,
    letterSpacing: "0.02em",
    color: "#212121",
    textAlign: "center",
    [theme.breakpoints.down("md")]: {
      color: "#212121",
    },
  },
  description: {
    fontWeight: 400,
    fontSize: 14,
    letterSpacing: "0.02em",
    color: "#414141",
    textAlign: "center",
    [theme.breakpoints.down("md")]: {
      color: "#212121",
    },
  },

  loginButton: {
    color: "white",
    minWidth: 160,
    backgroundColor: theme.palette.primary.main,
    padding: "7px 15px 7px 15px",
    border: "none",
    borderRadius: 10,
    fontWeight: 400,
    letterSpacing: 0.4,
    textTransform: "none",
    fontSize: 15,
    fontFamily: "poppins",
    "&:hover": {
      background: theme.palette.primary.light,
    },
    [theme.breakpoints.down("sm")]: {
      marginRight: 0,
      marginLeft: 15,
      width: 150,
    },
  },

  connectedButton: {
    color: "white",
    padding: "7px 5px 7px 10px",
    border: "none",
    borderRadius: 10,
    fontWeight: 400,
    letterSpacing: 0.4,
    textTransform: "none",
    fontSize: 15,
    fontFamily: "poppins",
    "&:hover": {
      background: "#e5e5e5",
    },
  },
  connectedAddress: {
    backgroundColor: theme.palette.primary.light,
    color: "white",
    padding: "4px 18px 4px 18px",
    border: "none",
    borderRadius: 10,
    fontWeight: 400,
    letterSpacing: 0.4,
    textTransform: "none",
    fontSize: 15,

    [theme.breakpoints.down("sm")]: {
      marginRight: 0,
      marginLeft: 15,
      width: 150,
    },
  },
}));

export default function ConnectButton() {
  const classes = useStyles();
  const theme = useTheme();

  const [balancePopup, setBalancePopup] = React.useState(false);

  const {
    authenticate,
    isAuthenticated,
    isAuthenticating,
    user,
    enableWeb3,
    start,
    isInitialized,
    Moralis,
  } = useMoralis();

  const { switchNetwork, chainId, chain, account } = useChain();

  const Web3Api = useMoralisWeb3Api();
  const userAddress = user ? user.attributes.ethAddress : "...";

  const changeNetwork = async () => {
    enableWeb3();
    await window.ethereum
      .request({
        method: "wallet_addEthereumChain",
        params: [
          // {
          //   chainId: "0x13881",
          //   chainName: "Polygon Test Network",
          //   nativeCurrency: {
          //     name: "MATIC",
          //     symbol: "MATICT",
          //     decimals: 18,
          //   },
          //   rpcUrls: ["https://matic-mumbai.chainstacklabs.com/"],
          //   blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
          // },
          {
            chainId: "0x2A",
            chainName: "Kovan Test Network",
            nativeCurrency: {
              name: "ETHEREUM",
              symbol: "ETH",
              decimals: 18,
            },
            rpcUrls: [" https://kovan.infura.io/v3/"],
            blockExplorerUrls: ["https://kovan.etherscan.io"],
          },
        ],
      })
      .catch(async (err) => {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",

          // params: [{ chainId: "0x13881" }], // chainId must be in hexadecimal numbers
          params: [{ chainId: "0x2A" }], // chainId must be in hexadecimal numbers
        });
      });
  };

  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (isInitialized) {
      fetchBalance();
    }
  }, [isInitialized]);

  const fetchBalance = async () => {
    const result = await Web3Api.account.getNativeBalance({
      network: "kovan",
      chain: "kovan",
    });

    console.log(result.balance);
    let bal = Moralis.Units.FromWei(result.balance);
    setBalance(parseFloat(bal).toFixed(3));
    return bal;
  };

  // if (chainId != "0x13881") {
  //   return (
  //     <div>
  //       {console.log(chainId)}
  //       <button className={classes.loginButton} onClick={changeNetwork}>
  //         Change Network
  //       </button>
  //     </div>
  //   );
  // }
  if (chainId != "0x2a") {
    return (
      <div>
        {console.log(chainId)}
        <button className={classes.loginButton} onClick={changeNetwork}>
          Change Network
        </button>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div>
        <button
          className={classes.loginButton}
          onClick={() =>
            authenticate({ signingMessage: "YeildSwap Authentication" })
          }
        >
          {isAuthenticating ? (
            <span>
              {" "}
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <CircularProgress
                  color="info"
                  size={25}
                  style={{ marginRight: 15 }}
                />{" "}
              </Box>
            </span>
          ) : (
            "  Connect Wallet"
          )}
        </button>
      </div>
    );
  }

  const enableBalancePopup = () => {
    setBalancePopup(true);
  };
  return (
    <div>
      <Box mb={3} mt={3}>
        <Button
          onClick={enableBalancePopup}
          style={{
            color: "white",
            padding: "3px 5px 3px 10px",
            border: "none",
            borderRadius: 10,
            fontWeight: 400,
            letterSpacing: 0.4,
            textTransform: "none",
            fontSize: 15,
            background: "#eeeeee",
          }}
        >
          <span
            style={{
              color: "#212121",
              height: "100%",
              fontWeight: 600,
              fontSize: 16,
              letterSpacing: "-0.02em",
              color: "#414141",
              textAlign: "center",
              lineHeight: 1.5,

              paddingRight: 10,
            }}
          >
            {balance} MATIC
          </span>{" "}
          <span className={classes.connectedAddress}>
            {userAddress.slice(0, 4)}...{userAddress.slice(-4)}
          </span>
        </Button>
      </Box>
      <Dialog
        open={balancePopup}
        TransitionComponent={Transition}
        keepMounted={false}
        onClose={null}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
        maxWidth="lg"
        fullWidth={false}
      >
        <AccountPopup setBalancePopup={setBalancePopup} />
      </Dialog>
    </div>
  );
}
