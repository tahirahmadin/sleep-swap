//done
import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  Dialog,
  Typography,
  Slide,
  Backdrop,
  Box,
  Input,
  Grid,
  Slider,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Close } from "@mui/icons-material";
import { useMoralis, useMoralisWeb3Api } from "react-moralis";
import Web3 from "web3";
import TxPopup from "../../../common/TxPopup";
import { useUserTrade } from "../../../hooks/useUserTrade";
import { toWei } from "../../../utils/helper";
import BigNumber from "bignumber.js";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const useStyles = makeStyles((theme) => ({
  background: {
    position: "fixed",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    zIndex: 10,
    display: "grid",
    placeItems: "center",
    background: "rgba(0,0,0,0.2)",
  },
  container: {
    width: "100%",
    height: "fit-content",
    padding: 10,
    minHeight: 440,

    maxWidth: 540,
    position: "relative",
    background: "#fff",
    border: "15px solid #6A55EA",
    display: "flex",
    alignItems: "center",
    zIndex: 11,
    [theme.breakpoints.down("md")]: {
      border: "10px solid #D1FE1D",
      width: "100%",
      maxWidth: "95%",
      height: 350,
    },
    [theme.breakpoints.down("sm")]: {
      height: "max-content",
    },
  },
  closeIcon: {
    position: "absolute",
    top: 8,
    right: 8,
    height: 22,
    width: 22,
    cursor: "pointer",
    [theme.breakpoints.down("md")]: {
      top: 5,
      right: 5,
      height: 18,
      width: 18,
    },
  },
  inputWrapper: {
    padding: 10,
  },
  input: {
    backgroundColor: "#ffffff",
    border: "1px solid #757575",
    borderRadius: 18,
    width: "80%",
    padding: 6,
    outline: "none",
    color: "#212121",
    textAlign: "left",
    paddingLeft: 10,
    paddingTop: 8,
    paddingBottom: 8,
    fontSize: 14,
    fontFamily: "Karla",
  },
  heading: {
    color: "#000000",
    textAlign: "center",
    fontSize: 30,
    lineHeight: "20%",
    [theme.breakpoints.down("md")]: {
      fontSize: 24,
    },
  },

  para: {
    color: "#212121",
    textAlign: "center",
    fontSize: 13,
    fontWeight: 300,
    paddingTop: 5,
    [theme.breakpoints.down("md")]: {
      fontSize: 13,
      paddingTop: 15,
    },
  },
  activateButton: {
    width: "fit-content",
    height: "50px",
    background: "#FF5AFF",
    boxSizing: "border-box",
    borderRadius: "15px",
    fontSize: 16,
    lineHeight: "33px",
    color: "#ffffff",
    fontWeight: 700,

    padding: "12px 30px 12px 30px",
    "&:hover": {
      background: "#FFB469",
    },
    [theme.breakpoints.down("md")]: {
      padding: "12px 20px 12px 20px",
      fontSize: 18,
    },
  },
  connectButton: {
    width: "fit-content",

    background: theme.palette.primary.main,
    border: "1px solid #FFFFFF",
    boxSizing: "border-box",
    borderRadius: "15px",
    fontSize: 16,
    lineHeight: "33px",
    color: "#ffffff",
    fontWeight: 600,
    marginTop: 20,
    padding: "10px 40px 10px 40px",
    fontFamily: "poppins",
    "&:hover": {
      background: theme.palette.primary.main,
    },
    [theme.breakpoints.down("md")]: {
      padding: "12px 20px 12px 20px",
      fontSize: 18,
    },
  },
  registerButton: {
    width: "fit-content",
    height: "45px",
    background: "#FF87FF",
    border: "1px solid #FFFFFF",
    boxSizing: "border-box",
    borderRadius: "20px",
    fontSize: 16,
    lineHeight: "33px",
    color: "#000000",

    marginTop: 20,
    padding: "12px 30px 12px 30px",
    "&:hover": {
      background: "#FFB469",
    },
    [theme.breakpoints.down("md")]: {
      padding: "12px 20px 12px 20px",
      fontSize: 18,
    },
  },

  svgImage: {
    width: 100,
    [theme.breakpoints.down("md")]: {
      width: 70,
    },
  },
  spoon1Image: {
    width: 40,
    height: "fit-content",
    [theme.breakpoints.down("md")]: {
      display: "none",
    },
  },
  spoon2Image: {
    width: 30,
    height: "fit-content",
    [theme.breakpoints.down("md")]: {
      display: "none",
    },
  },
  iconWrapper: {
    marginRight: 10,
    backgroundColor: "#FF87FF",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: 42,
    height: 42,
  },
  icon: {
    width: 25,
    height: 25,
    color: "white",
  },
}));

const StakePopup = ({
  txCase,
  stakePopup,
  setStakePopup,
  poolToken,
  ethToken,
}) => {
  const classes = useStyles();

  const { user, logout, isAuthenticated } = useMoralis();

  const Web3Api = useMoralisWeb3Api();
  const userAddress = user ? user.attributes.ethAddress : "...";

  const [userStaked, userTradeSettings, startTradeOrder] = useUserTrade(
    poolToken.address
  );

  const [amount, setAmount] = useState("");
  const [percent, setPercent] = useState("");
  const [grids, setGrids] = useState("");

  const resetPopup = () => {
    setStakePopup(false);
  };

  const handleStake = useCallback(() => {
    console.log("calling trade callback", amount);
    if (new BigNumber(toWei(amount, poolToken.decimals)).lte(0)) {
      return;
    }

    console.log("calling trade callback", toWei(amount, poolToken.decimals));
    startTradeOrder(toWei(amount, poolToken.decimals));
  }, [amount, startTradeOrder]);

  const marks = [
    {
      value: 0,
      label: "2",
    },
    {
      value: 20,
      label: "6",
    },
    {
      value: 50,
      label: "10",
    },
    {
      value: 75,
      label: "14",
    },
    {
      value: 100,
      label: "20",
    },
  ];

  function valuetext(value) {
    return `${value}°C`;
  }

  const handlePercentage = (event) => {
    let { value } = event.target;
    let min = 1;
    let max = 99;
    value = Math.max(Number(min), Math.min(Number(max), Number(value)));

    setPercent(value);
  };
  const handleGrids = (event) => {
    let { value } = event.target;
    let min = 1;
    let max = 25;
    value = Math.max(Number(min), Math.min(Number(max), Number(value)));

    setGrids(value);
  };

  const stakeFunds = () => {};
  return (
    <Dialog
      open={stakePopup}
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
      <div className={classes.background}>
        <div className={classes.container}>
          {txCase === 0 && (
            <div className="h-100 w-100">
              <div className="d-flex justify-content-end" onClick={resetPopup}>
                <Close style={{ cursor: "pointer" }} />
              </div>
              <div className="d-flex flex-column justify-content-around">
                <div>
                  <Typography
                    variant="h4"
                    className={classes.heading}
                    fontWeight={700}
                  >
                    Stake
                  </Typography>
                  <Box
                    display="flex"
                    flexDirection={"row"}
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Box
                      display="flex"
                      flexDirection={"row"}
                      justifyContent="flex-start"
                      alignItems="center"
                    >
                      <img
                        src="https://cdn3d.iconscout.com/3d/premium/thumb/polygon-4924309-4102060.png"
                        alt="Polygon"
                        height="20px"
                      />{" "}
                      <img
                        src="https://cdn3d.iconscout.com/3d/premium/thumb/tether-4924313-4102064.png"
                        alt="USDT"
                        height="20px"
                      />
                    </Box>
                    <Typography
                      variant="body2"
                      className={classes.para}
                      textAlign="left"
                      fontWeight={600}
                      ml={1}
                    >
                      MATIC/USDT
                    </Typography>
                  </Box>
                </div>

                <Box
                  display={"flex"}
                  justifyContent={"space-between"}
                  mt={2}
                  style={{
                    border: "1px solid rgba(106, 85, 234,0.2)",
                    padding: "6px 20px 6px 20px",

                    borderRadius: 10,
                    backgroundColor: "rgba(106, 85, 234,0.03)",
                  }}
                >
                  <Box>
                    <Typography
                      variant="body2"
                      textAlign={"left"}
                      className={classes.para}
                      fontWeight={500}
                      fontSize={12}
                      color={"#757575"}
                    >
                      Amount:
                    </Typography>
                    <Input
                      value={amount}
                      onInput={(event) => setAmount(event.target.value)}
                      fullWidth
                      placeholder="0"
                      style={{ fontSize: 24, fontWeight: 600 }}
                    />
                  </Box>
                  <Box>
                    <Typography
                      variant="body2"
                      textAlign={"left"}
                      className={classes.para}
                      fontWeight={500}
                      fontSize={12}
                      color={"#757575"}
                    >
                      Available: 3,235
                    </Typography>
                    <Box
                      display="flex"
                      flexDirection={"row"}
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Box
                        display="flex"
                        flexDirection={"row"}
                        justifyContent="flex-start"
                        alignItems="center"
                      >
                        <img
                          src="https://cdn3d.iconscout.com/3d/premium/thumb/usdt-coin-4999518-4160019.png"
                          alt="USDT"
                          height="30px"
                        />{" "}
                      </Box>
                      <Typography
                        variant="body2"
                        className={classes.para}
                        fontSize={20}
                        textAlign="left"
                        fontWeight={600}
                        ml={1}
                      >
                        USDT
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Box
                  mt={2}
                  style={{
                    border: "1px solid rgba(106, 85, 234,0.2)",
                    padding: "6px 30px 6px 30px",
                    borderRadius: 10,
                    backgroundColor: "rgba(106, 85, 234,0.03)",
                  }}
                >
                  <Box>
                    <Typography
                      variant="body2"
                      textAlign={"left"}
                      className={classes.para}
                      fontWeight={500}
                      fontSize={12}
                      color={"#757575"}
                    >
                      Grids:
                    </Typography>
                    <Slider
                      defaultValue={userTradeSettings?.grids}
                      getAriaValueText={valuetext}
                      step={null}
                      marks={marks}
                      fullWidth
                    />
                  </Box>
                </Box>
                <Box></Box>
                <Grid
                  container
                  display={"flex"}
                  justifyContent={"space-between"}
                  mt={2}
                  style={{
                    border: "1px solid rgba(106, 85, 234,0.2)",
                    padding: "6px 30px 6px 30px",
                    borderRadius: 10,
                    backgroundColor: "rgba(106, 85, 234,0.03)",
                  }}
                >
                  <Box
                    style={{
                      borderRight: "1px solid #e5e5e5",
                      paddingRight: 10,
                    }}
                  >
                    <Typography
                      variant="body2"
                      textAlign={"left"}
                      className={classes.para}
                      fontWeight={500}
                      fontSize={12}
                      color={"#757575"}
                    >
                      Grids:
                    </Typography>
                    <Input
                      value={userTradeSettings?.grids}
                      fullWidth
                      onChange={(e) => handleGrids(e)}
                    />
                  </Box>

                  <Box
                    ml={1}
                    mt={2}
                    style={{
                      width: "50%",
                      border: "1px solid rgba(106, 85, 234,0.2)",
                      padding: "6px 30px 6px 30px",
                      borderRadius: 10,
                      backgroundColor: "rgba(106, 85, 234,0.03)",
                    }}
                  >
                    <Typography
                      variant="body2"
                      textAlign={"left"}
                      className={classes.para}
                      fontWeight={500}
                      fontSize={12}
                      color={"#757575"}
                    >
                      Trigger Percent:
                    </Typography>
                    <Input
                      type="number"
                      disableUnderline
                      value={userTradeSettings?.buyThresold}
                      fullWidth
                      placeholder="10"
                      onChange={(e) => handlePercentage(e)}
                      style={{ fontSize: 22, fontWeight: 600 }}
                    />
                  </Box>
                </Grid>

                <Box display={"flex"} justifyContent="space-around" mt={2}>
                  <Box>
                    <Typography
                      variant="body2"
                      textAlign={"center"}
                      className={classes.para}
                      fontWeight={500}
                      fontSize={14}
                      color={"#454545"}
                    >
                      <strong>Your Buy Orders</strong>
                    </Typography>
                    <Typography
                      variant="body2"
                      textAlign={"center"}
                      className={classes.para}
                      fontWeight={500}
                      fontSize={12}
                      color={"#757575"}
                    >
                      2326, 2053,1856
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="body2"
                      textAlign={"center"}
                      className={classes.para}
                      fontWeight={500}
                      fontSize={14}
                      color={"#454545"}
                    >
                      <strong>Your Sell Orders</strong>
                    </Typography>
                    <Typography
                      variant="body2"
                      textAlign={"center"}
                      className={classes.para}
                      fontWeight={500}
                      fontSize={12}
                      color={"#757575"}
                    >
                      2637, 2970,3246
                    </Typography>
                  </Box>
                </Box>

                <div className="text-center">
                  <button
                    className={classes.connectButton}
                    onClick={handleStake}
                  >
                    STAKE NOW
                  </button>
                </div>
              </div>
            </div>
          )}

          {txCase > 0 && <TxPopup txCase={txCase} resetPopup={resetPopup} />}
        </div>
      </div>{" "}
    </Dialog>
  );
};

export default StakePopup;
