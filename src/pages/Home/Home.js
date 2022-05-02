import React, { useState } from "react";
import { makeStyles } from "@mui/styles";
import {
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  useTheme,
} from "@mui/material";

const useStyles = makeStyles((theme) => ({
  background: {
    backgroundImage: 'url("images/network.png"), url(images/tokens.png)',
    backgroundPosition: "center center,center center",
    backgroundRepeat: "no-repeat,no-repeat",
    backgroundSize: "cover,contain",
    height: "100%",
    width: "100%",
    paddingTop: "10%",
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

export default function Home() {
  const classes = useStyles();
  const theme = useTheme();

  const [orderType, setOrderType] = useState("BUY");
  const [fiat, setFiat] = useState("BTC");
  const [token, setToken] = useState("USDT");
  const [payment, setPayment] = useState("UPI");

  const [filterParams, setFilterParams] = useState({
    orderType: "BUY",
    fiat: "INR",
    token: "PBR",
    payment: "UPI",
  });

  const updateFilters = () => {
    let tempObj = {
      orderType: orderType,
      fiat: fiat,
      token: token,
      payment: payment,
    };
    setFilterParams(tempObj);
  };
  return (
    <Box>
      <Box className={classes.background}>
        <h1 variant="h1" className={classes.mainHeading}>
          Trade Strategically <br />
          While Sleeping
        </h1>
        <Typography variant="body2" className={classes.para}>
          Experience first decentralized smart strategy trading interface
        </Typography>

        <Container style={{ marginTop: 100 }}>
          <div className="d-flex justify-content-center">
            <div className={classes.filterCard}>
              <Box
                display="flex"
                flexDirection={"column"}
                justifyContent="space-around"
                alignItems="center"
                mt={3}
              >
                <Box px={2}>
                  <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                    <InputLabel id="demo-simple-select-standard-label">
                      Token 1
                    </InputLabel>

                    <Select
                      variant="standard"
                      disableUnderline={true}
                      value={fiat}
                      label="Age"
                      style={{
                        fontWeight: 600,
                        letterSpacing: 1,
                        color: "#212121",
                      }}
                      onChange={(e) => setFiat(e.target.value)}
                    >
                      <MenuItem value={"BTC"}>BTC</MenuItem>
                      <MenuItem value={"ETH"}>ETH</MenuItem>
                      <MenuItem value={"PBR"}>PBR</MenuItem>
                      <MenuItem value={"PBR"}>PWAR</MenuItem>
                      <MenuItem value={"PBR"}>DOT</MenuItem>
                      <MenuItem value={"PBR"}>LINK</MenuItem>
                      <MenuItem value={"PBR"}>SOL</MenuItem>
                      <MenuItem value={"PBR"}>USDT</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Box px={2}>
                  <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                    <InputLabel id="demo-simple-select-standard-label">
                      Token 2
                    </InputLabel>

                    <Select
                      variant="standard"
                      disableUnderline={true}
                      value={token}
                      label="Age"
                      style={{
                        fontWeight: 600,
                        letterSpacing: 1,
                        color: "#212121",
                      }}
                      onChange={(e) => setToken(e.target.value)}
                    >
                      <MenuItem value={"BTC"}>BTC</MenuItem>
                      <MenuItem value={"ETH"}>ETH</MenuItem>
                      <MenuItem value={"PBR"}>PBR</MenuItem>
                      <MenuItem value={"PWAR"}>PWAR</MenuItem>
                      <MenuItem value={"DOT"}>DOT</MenuItem>
                      <MenuItem value={"LINK"}>LINK</MenuItem>
                      <MenuItem value={"SOL"}>SOL</MenuItem>
                      <MenuItem value={"USDT"}>USDT</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Box px={2}>
                  <Button
                    onClick={updateFilters}
                    style={{
                      borderRadius: 10,
                      background: "#6A55EA",
                      padding: "9px 35px 9px 35px",
                      color: "white",
                    }}
                  >
                    Begin Strategy
                  </Button>
                </Box>
              </Box>
            </div>
          </div>
        </Container>
      </Box>
    </Box>
  );
}
