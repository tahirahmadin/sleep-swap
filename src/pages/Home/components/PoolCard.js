import React, { useState } from "react";
import { makeStyles } from "@mui/styles";
import { Box, Button, Typography, useTheme } from "@mui/material";
import StakePopup from "./StakePopup";

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

  const [stakePopup, setStakePopup] = useState(false);
  const [txCase, setTxCase] = useState(0);

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
                $12,320
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
                + 1,436
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
                $1000
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
                $118
              </Typography>
            </Box>
          </Box>
          <Box px={2} mt={2} className="text-center">
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
          </Box>
        </Box>
      </div>
      <StakePopup
        txCase={txCase}
        setStakePopup={setStakePopup}
        stakePopup={stakePopup}
      />
    </Box>
  );
}
