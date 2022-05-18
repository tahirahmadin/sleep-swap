import React, { useCallback, useEffect, useMemo, useState } from "react";
import { makeStyles } from "@mui/styles";
import { Box, Button, Typography, useTheme } from "@mui/material";
import StakePopup from "./StakePopup";
import { useMoralis } from "react-moralis";
import { TOKENS } from "../../../constants";
import { useChain } from "react-moralis";
import { useTokenAllowance } from "../../../hooks/useAllowance";
import { useUserTrade } from "../../../hooks/useUserTrade";
import { fromWei } from "../../../utils/helper";
import { usePoolInfo } from "../../../hooks/usePoolInfo";
import BigNumber from "bignumber.js";

const useStyles = makeStyles((theme) => ({
  background: {
    backgroundImage: 'url("images/network.png"), url(images/tokens.png)',
    backgroundPosition: "center center,center center",
    backgroundRepeat: "no-repeat,no-repeat",
    backgroundSize: "cover,contain",
    height: "88vh",
    width: "100%",
    paddingTop: "4%",
  },
  mainHeading: {
    fontWeight: 600,
    fontSize: 48,
    letterSpacing: "0.02em",
    color: "#212121",
    textAlign: "center",
    [theme.breakpoints.down("md")]: {
      color: "#212121",
    },
  },
  poolText: {
    fontWeight: 600,
    fontSize: 22,
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
    letterSpacing: "0.02em",
    color: "#414141",
    textAlign: "center",
  },

  buttonWrapper: {
    display: "flex",
    justifyContent: "center",
  },
  buttonFirst: {
    width: "fit-content",
    color: "#212121",
    backgroundColor: "#eeeeee",
    padding: "12px 50px 12px 50px",
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    cursor: "pointer",
  },
  buttonSecond: {
    width: "fit-content",
    color: "white",
    backgroundColor: "#6A55EA",
    padding: "12px 50px 12px 50px",
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    cursor: "pointer",
  },
  filterCard: {
    marginTop: 20,
    marginBottom: 20,
    height: "100%",
    width: "80%",
    border: "1px solid #eeeeee",
    paddingTop: 30,
    paddingBottom: 30,
    backgroundColor: "#FFFFFF",
    boxShadow: "0px 12px 24px rgba(0, 0, 0, 0.03)",
    borderRadius: 10,
    "&:hover": {
      boxShadow: "0px 24px 33px -9px #0000005C",
    },
  },
  cardTitle: {
    fontWeight: 400,
    fontSize: 16,
    letterSpacing: "0.02em",
    color: "#414141",
    textAlign: "left",
  },
}));

export default function PoolCard() {
  const classes = useStyles();
  const theme = useTheme();
  const { account } = useChain();

  const { isAuthenticated } = useMoralis();

  const [stakePopup, setStakePopup] = useState(false);
  const [txCase, setTxCase] = useState(0);

  const poolToken = TOKENS?.["USDT"];
  const ethToken = TOKENS?.["ETH"];

  const [allowance, confirmAllowance, approveTrxStatus] = useTokenAllowance(
    poolToken.address
  );

  const [
    userStaked,
    userTradeSettings,
    startTradeOrder,
    withdrawUserFunds,
    transactionState,
    resetTrxState,
  ] = useUserTrade(poolToken.address);
  const [poolInfo, poolLoading] = usePoolInfo();

  const totalPoolValueLocked = useMemo(() => {
    if (!poolInfo) {
      return "0";
    }
    const totalEthUsd = new BigNumber(
      fromWei(poolInfo?.totalEthInPool, ethToken.decimals)
    )
      .plus(fromWei(poolInfo?.totalFee, ethToken.decimals))
      .multipliedBy(fromWei(poolInfo?.ethPriceUsd, 8));

    return totalEthUsd
      .plus(fromWei(poolInfo?.totalUsdtInPool, poolToken.decimals))
      .toFixed(3)
      .toString();
  }, [poolInfo]);

  const handleAllowance = useCallback(() => {
    confirmAllowance();
  }, [confirmAllowance]);

  return (
    <Box>
      <div className={classes.filterCard}>
        <Box pt={0} px={3}>
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
                src="https://cdn3d.iconscout.com/3d/premium/thumb/chainlink-coin-4199896-3478982@0.png"
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
          <Box display={"flex"} justifyContent={"space-around"} mt={3}>
            <Box>
              <Typography
                variant="h6"
                className={classes.para}
                textAlign="center"
                fontSize={14}
                fontWeight={400}
                ml={1}
              >
                Total Deposits
              </Typography>
              <Typography
                variant="body2"
                className={classes.para}
                textAlign="center"
                fontWeight={700}
                ml={1}
              >
                $ {totalPoolValueLocked}
              </Typography>
            </Box>
            <Box>
              <Typography
                variant="h6"
                className={classes.para}
                textAlign="center"
                fontSize={14}
                fontWeight={400}
                ml={1}
              >
                Avg Gains
              </Typography>
              <Typography
                variant="body2"
                className={classes.para}
                textAlign="center"
                fontWeight={700}
                ml={1}
              >
                {poolInfo?.averageGain || "0"}
              </Typography>
            </Box>
          </Box>

          <Box>
            <Box
              display={"flex"}
              justifyContent={"space-between"}
              mt={3}
              style={{
                border: "1px solid rgba(106, 85, 234,0.1)",
                padding: "10px 10px 10px 10px",
                borderRadius: 10,
                backgroundColor: "rgba(106, 85, 234,0.03)",
              }}
            >
              <Typography
                variant="h6"
                className={classes.para}
                textAlign="center"
                fontSize={14}
                fontWeight={400}
                ml={1}
              >
                Your stake
              </Typography>
              <Typography
                variant="body2"
                className={classes.para}
                textAlign="center"
                fontWeight={700}
                ml={1}
              >
                {fromWei(userStaked?.staked, poolToken.decimals)}
              </Typography>
            </Box>
            <Box
              display={"flex"}
              justifyContent={"space-between"}
              mt={2}
              style={{
                border: "1px solid rgba(106, 85, 234,0.1)",
                padding: "10px 10px 10px 10px",
                borderRadius: 10,
                backgroundColor: "rgba(106, 85, 234,0.03)",
              }}
            >
              <Typography
                variant="h6"
                className={classes.para}
                textAlign="center"
                fontSize={14}
                fontWeight={400}
                ml={1}
              >
                Earning
              </Typography>
              <Typography
                variant="body2"
                className={classes.para}
                textAlign="center"
                fontWeight={700}
                ml={1}
              >
                {fromWei(userStaked?.earnings, poolToken.decimals)}
              </Typography>
            </Box>
          </Box>
          <Box px={2} mt={2} className="text-center">
            {allowance ? (
              <Button
                onClick={() => setStakePopup(true)}
                style={{
                  borderRadius: 10,
                  background: "#6A55EA",
                  padding: "9px 20px 9px 20px",
                  color: "white",
                }}
              >
                Start Strategy
              </Button>
            ) : (
              <Button
                onClick={handleAllowance}
                style={{
                  borderRadius: 10,
                  background: "#6A55EA",
                  padding: "9px 20px 9px 20px",
                  color: "white",
                }}
              >
                {approveTrxStatus?.status > 0 && approveTrxStatus?.status !== 4
                  ? "Approving..."
                  : "Approve USDT"}
              </Button>
            )}
          </Box>
        </Box>
      </div>
      <StakePopup
        txCase={txCase}
        setStakePopup={setStakePopup}
        stakePopup={stakePopup}
        poolToken={poolToken}
        ethToken={ethToken}
        userStaked={userStaked}
        userTradeSettings={userTradeSettings}
        startTradeOrder={startTradeOrder}
        withdrawUserFunds={withdrawUserFunds}
        transactionState={transactionState}
        resetTrxState={resetTrxState}
      />
    </Box>
  );
}
