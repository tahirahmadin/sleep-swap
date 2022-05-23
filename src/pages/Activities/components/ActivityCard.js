import React, { useCallback, useEffect, useMemo, useState } from "react";
import { makeStyles } from "@mui/styles";
import { Box, Button, Typography, useTheme } from "@mui/material";

const useStyles = makeStyles((theme) => ({
  background: {
    backgroundImage: 'url("images/network.png"), url(images/tokens.png)',
    backgroundPosition: "center center,center center",
    backgroundRepeat: "no-repeat,no-repeat",
    backgroundSize: "cover,contain",
    height: "88vh",
    width: "100%",
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
    marginTop: 10,
    marginBottom: 10,
    height: "100%",
    minWidth: 600,
    width: "90%",
    border: "1px solid #eeeeee",
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
    boxShadow: "0px 12px 24px rgba(0, 0, 0, 0.03)",
    borderRadius: 10,
    "&:hover": {
      boxShadow: "0px 24px 33px -9px #0000005C",
    },

    [theme.breakpoints.down("md")]: {
      minWidth: 200,
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

export default function ActivityCard() {
  const classes = useStyles();
  const theme = useTheme();

  return (
    <Box>
      <div className={classes.filterCard}>
        <Box pt={0} px={3} style={{ width: "100%" }}>
          <Box
            display={"flex"}
            justifyContent={"space-between"}
            alignItems="center"
          >
            <Typography
              variant="h6"
              className={classes.para}
              textAlign="center"
              fontSize={20}
              fontWeight={600}
            >
              <img
                src="https://cdn3d.iconscout.com/3d/premium/thumb/salary-4851461-4042252.png"
                alt="Polygon"
                height="22px"
              />{" "}
              Staked
            </Typography>
            <Box
              display={"flex"}
              flexDirection="column"
              alignItems={"flex-end"}
            >
              <Typography
                variant="h6"
                className={classes.para}
                textAlign="center"
                fontSize={24}
                fontWeight={600}
              >
                + $213
              </Typography>
              <Typography
                variant="body2"
                className={classes.para}
                textAlign="center"
                fontWeight={500}
                fontSize={12}
                color="#919191"
              >
                21 May, 2022 08:21 AM
              </Typography>
            </Box>
          </Box>
        </Box>
      </div>
    </Box>
  );
}
