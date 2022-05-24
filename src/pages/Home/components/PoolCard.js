import React, { useCallback, useEffect, useMemo, useState } from "react";
import { makeStyles } from "@mui/styles";
import { Box, Button, Typography, useTheme } from "@mui/material";
import StakePopup from "./StakePopup";
import { useMoralis } from "react-moralis";
import { CHAIN, NATIVE_TOKEN, TOKENS } from "../../../constants";
import { useChain } from "react-moralis";
import { useTokenAllowance } from "../../../hooks/useAllowance";
import { useUserTrade } from "../../../hooks/useUserTrade";
import { fromWei } from "../../../utils/helper";
import { usePoolInfo } from "../../../hooks/usePoolInfo";
import BigNumber from "bignumber.js";
import { Link } from "react-router-dom";

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

    [theme.breakpoints.down("md")]: {
      height: "100%",
      width: "100%",
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

  const poolToken = TOKENS?.[CHAIN]?.["USDT"];
  const nativeToken = TOKENS?.[CHAIN]?.[NATIVE_TOKEN?.[CHAIN]];

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

  const userTotalValueInPool = useMemo(() => {
    const totalEthUsd = new BigNumber(
      fromWei(userStaked?.tokenBalance, nativeToken.decimals)
    ).multipliedBy(fromWei(poolInfo?.ethPriceUsd, 8));

    return totalEthUsd
      .plus(fromWei(userStaked?.usdtBalance, poolToken?.decimals))
      .toFixed(3)
      .toString();
  }, [userStaked, poolInfo]);

  const totalEarnings = useMemo(() => {
    return new BigNumber(userTotalValueInPool)
      .minus(fromWei(userStaked?.staked, poolToken?.decimals))
      ?.toFixed(3)
      .toString();
  }, [userTotalValueInPool, userStaked, poolToken]);

  const totalPoolValueLocked = useMemo(() => {
    if (!poolInfo) {
      return "0";
    }
    const totalEthUsd = new BigNumber(
      fromWei(poolInfo?.totalEthInPool, nativeToken.decimals)
    )
      .plus(fromWei(poolInfo?.totalFee, nativeToken.decimals))
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
                src="https://cdn3d.iconscout.com/3d/premium/thumb/ethereum-eth-coin-4722965-3917991.png"
                alt="ETH"
                height="20px"
              />{" "}
              <img
                src="https://cdn3d.iconscout.com/3d/premium/thumb/tether-usdt-coin-4199895-3478983@0.png"
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
              ETH/USDT
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
                Profit/Loss
              </Typography>
              <Typography
                variant="body2"
                className={classes.para}
                textAlign="center"
                fontWeight={700}
                ml={1}
              >
                + ${" "}
                {parseInt(poolInfo?.averageGain) > 0
                  ? poolInfo?.averageGain
                  : 12 || "0"}
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
                {totalEarnings}
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
                {parseInt(fromWei(userStaked?.staked, poolToken.decimals)) === 0
                  ? "Start Strategy"
                  : "Exit Strategy"}{" "}
              </Button>
            ) : (
              <Button
                onClick={handleAllowance}
                disabled={
                  approveTrxStatus?.status > 0 && approveTrxStatus?.status !== 4
                }
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
            <Box display="flex" justifyContent="center" alignItems="center">
              <Link to="activities">
                <div
                  style={{
                    paddingTop: 10,
                    color: "#027FFF",
                    fontWeight: 400,
                    fontSize: 13,
                    textDecoration: "none",
                    marginRight: 10,
                    fontFamily: "poppins",
                  }}
                >
                  View your activities
                </div>
              </Link>
            </Box>
          </Box>
        </Box>
      </div>
      <StakePopup
        txCase={txCase}
        setStakePopup={setStakePopup}
        stakePopup={stakePopup}
        poolToken={poolToken}
        userStaked={userStaked}
        userTradeSettings={userTradeSettings}
        startTradeOrder={startTradeOrder}
        withdrawUserFunds={withdrawUserFunds}
        transactionState={transactionState}
        resetTrxState={resetTrxState}
        userTotalValueInPool={userTotalValueInPool}
        totalEarnings={totalEarnings}
      />
    </Box>
  );
}
