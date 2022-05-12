import React from "react";
import { makeStyles } from "@mui/styles";
import { Box, Button, Slide, Backdrop, useTheme, Dialog } from "@mui/material";
import { useMoralis, useChain } from "react-moralis";
import AccountPopup from "./AccountPopup";

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
    backgroundColor: theme.palette.primary.main,
    padding: "7px 15px 7px 15px",
    border: "none",
    borderRadius: 10,
    fontWeight: 400,
    letterSpacing: 0.4,
    textTransform: "none",
    fontSize: 15,
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
    "&:hover": {
      background: "#e5e5e5",
    },
    [theme.breakpoints.down("sm")]: {
      marginRight: 0,
      marginLeft: 15,
      width: 150,
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

  const [whitelistPopup, setWhitelistPopup] = React.useState(false);

  const { authenticate, isAuthenticated, isAuthenticating, user, enableWeb3 } =
    useMoralis();

  const { switchNetwork, chainId, chain, account } = useChain();

  const changeNetwork = async () => {
    enableWeb3();
    switchNetwork("0x13881");
  };
  //   if (chainId != "80001") {
  //     return (
  //       <div>
  //         {console.log(chainId)}
  //         <button className={classes.loginButton}>Change Network</button>
  //       </div>
  //     );
  //   }
  if (!isAuthenticated) {
    return (
      <div>
        <button
          className={classes.loginButton}
          isLoading={isAuthenticating}
          onClick={() =>
            authenticate({ signingMessage: "YeildSwap Authentication" })
          }
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div>
      <Box mb={3} mt={3}>
        <button
          onClick={() => setWhitelistPopup(!whitelistPopup)}
          className={classes.connectedButton}
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
            }}
          >
            3.65 MATIC
          </span>{" "}
          <span className={classes.connectedAddress}>0x98..32342</span>
        </button>
      </Box>
      <Dialog
        open={whitelistPopup}
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
        <AccountPopup setWhitelistPopup={setWhitelistPopup} />
      </Dialog>
    </div>
  );
}
