import React, { useEffect, useState } from "react";
import { makeStyles } from "@mui/styles";
import {
  Box,
  Button,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  useTheme,
} from "@mui/material";
import PoolCard from "./components/PoolCard";
import PoolCardDisabled from "./components/PoolCardDisabled";
import { useTokenAllowance } from "../../hooks/useAllowance";
import { SLEEP_SWAP_ADDRESSES, TOKENS } from "../../constants";
import { useChain } from "react-moralis";

const useStyles = makeStyles((theme) => ({
  background: {
    backgroundImage: 'url("images/network.png"), url(images/tokens.png)',
    backgroundPosition: "center center,center center",
    backgroundRepeat: "no-repeat,no-repeat",
    backgroundSize: "cover,contain",
    height: "93vh",
    width: "100%",
    paddingTop: "2%",
    [theme.breakpoints.down("md")]: {
      paddingTop: "10%",

      paddingLeft: 15,
      paddingRight: 15,
    },
  },
  mainHeading: {
    fontWeight: 600,
    fontSize: 48,
    letterSpacing: "0.02em",
    color: "#212121",
    textAlign: "center",
    [theme.breakpoints.down("md")]: {
      color: "#212121",
      fontSize: 32,
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

    backgroundColor: "#FFFFFF",
    boxShadow: "0px 12px 24px rgba(0, 0, 0, 0.03)",
    borderRadius: 10,
  },
  cardTitle: {
    fontWeight: 400,
    fontSize: 16,
    letterSpacing: "0.02em",
    color: "#414141",
    textAlign: "left",
  },
}));

export default function Home() {
  const classes = useStyles();
  const theme = useTheme();

  const { account } = useChain();

  return (
    <Box>
      <Box className={classes.background}>
        <h3 variant="h1" className={classes.mainHeading}>
          Stake. Sleep. <span style={{ color: "#6227B9" }}> Repeat.</span>
        </h3>
        <Typography variant="body2" className={classes.para}>
          Experience first decentralized smart strategy trading interface{" "}
        </Typography>
        <div className="mt-3">
          <Typography
            variant="h6"
            className={classes.para}
            style={{ fontSize: 13 }}
          >
            Powered By
          </Typography>
        </div>
        <div className="d-flex justify-content-center">
          <div style={{ marginRight: 10 }}>
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Chainlink_Logo_Blue.svg/2560px-Chainlink_Logo_Blue.svg.png"
              height="20px"
            />
          </div>

          <div style={{ marginLeft: 10 }}>
            <img
              src="https://stakehound.com/wp-content/uploads/2021/04/Polygon-logo.png"
              height="18px"
            />
          </div>
        </div>

        <Container style={{ marginTop: 40 }}>
          <div className="text-center"></div>
          <h6 variant="h1" className={classes.poolText}>
            Available Pools
          </h6>
          <Grid container display={"flex"} justifyContent="center">
            <Grid item md={4}>
              <PoolCard />
            </Grid>
            <Grid item md={4}>
              <PoolCardDisabled />
            </Grid>
            <Grid item md={4}>
              <PoolCardDisabled />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
