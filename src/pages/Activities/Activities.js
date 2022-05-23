import React, { useEffect, useState } from "react";
import { makeStyles } from "@mui/styles";
import { Box, Typography, useTheme } from "@mui/material";

import { useChain } from "react-moralis";
import ActivityCard from "./components/ActivityCard";

const useStyles = makeStyles((theme) => ({
  background: {
    backgroundImage: 'url("images/network.png"), url(images/tokens.png)',
    backgroundPosition: "center center,center center",
    backgroundRepeat: "no-repeat,no-repeat",
    backgroundSize: "cover,contain",
    height: "88vh",
    width: "100%",
    paddingTop: "3%",
    [theme.breakpoints.down("md")]: {
      paddingTop: "10%",
    },
  },
  mainHeading: {
    fontWeight: 600,
    fontSize: 28,
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

export default function Activities() {
  const classes = useStyles();
  const theme = useTheme();

  const { account } = useChain();

  return (
    <Box>
      <Box className={classes.background}>
        <h3 className={classes.mainHeading}>
          Sleepy<span style={{ color: "#6227B9" }}> activities</span>
        </h3>

        <Box
          display="flex"
          flexDirection={"row"}
          justifyContent="center"
          alignItems="center"
          mt={3}
        >
          <Box
            style={{ minWidth: 600 }}
            display="flex"
            justifyContent="flex-start"
            alignItems="center"
          >
            <span style={{ paddingRight: 10 }}> Pool Name:</span>{" "}
            <img
              src="https://cdn3d.iconscout.com/3d/premium/thumb/chainlink-coin-4199896-3478982@0.png"
              alt="Polygon"
              height="16px"
            />{" "}
            <img
              src="https://cdn3d.iconscout.com/3d/premium/thumb/tether-4924313-4102064.png"
              alt="USDT"
              height="16px"
            />
            <Typography
              variant="body2"
              className={classes.para}
              textAlign="left"
              fontWeight={600}
              fontSize={12}
              color="#919191"
              ml={1}
            >
              MATIC/USDT
            </Typography>
          </Box>
        </Box>

        <Box display={"flex"} flexDirection="column" alignItems="center">
          <ActivityCard />
          <ActivityCard />
          <ActivityCard />
          <ActivityCard />
        </Box>
      </Box>
    </Box>
  );
}
