import React, { useEffect, useState } from "react";
import { makeStyles } from "@mui/styles";
import { Box, Typography, useTheme } from "@mui/material";

import { useChain } from "react-moralis";
import ActivityCard from "./components/ActivityCard";
import { getUserActivities } from "../../apollo/queries";
import { formatCurrency, fromWei } from "../../utils/helper";

const useStyles = makeStyles((theme) => ({
  background: {
    backgroundImage: 'url("images/network.png"), url(images/tokens.png)',
    backgroundPosition: "center center,center center",
    backgroundRepeat: "no-repeat,no-repeat",
    backgroundSize: "cover,contain",
    minHeight: "88vh",
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
    marginBottom: 20,
    height: "100%",
    width: 600,
    border: "1px solid #eeeeee",
    padding: 15,
    fontWeight: 400,
    fontFamily: "poppins",
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
  const [userActivities, setActivities] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!account) {
      return;
    }

    async function fetchData() {
      const data = await getUserActivities(account, page);
      console.log("data fetched ", data);
      setActivities([...userActivities, ...data?.userActivities]);
    }

    fetchData();
  }, [account, page]);

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
          mb={3}
        >
          <Box
            style={{ minWidth: 600 }}
            display="flex"
            justifyContent="flex-start"
            alignItems="center"
          >
            <span style={{ paddingRight: 10 }}> Pool Name:</span>{" "}
            <img
              src="https://cdn3d.iconscout.com/3d/premium/thumb/ethereum-eth-coin-4722965-3917991.png"
              alt="ETH"
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
              ETH/USDT
            </Typography>
          </Box>
        </Box>

        <Box display={"flex"} flexDirection="column" alignItems="center">
          {userActivities.length === 0 && (
            <div className={classes.filterCard}>No activities found</div>
          )}
          {userActivities &&
            userActivities.map((item) => (
              <ActivityCard
                type={item?.type}
                title={item?.type?.toUpperCase()}
                amount={formatCurrency(fromWei(item?.tokenAmount, 6))}
                price={formatCurrency(fromWei(item?.atPrice, 8))}
                date={new Date(item?.timestamp * 1000)?.toLocaleString()}
                media={
                  "https://cdn3d.iconscout.com/3d/premium/thumb/wallet-4024965-3337585.png"
                }
              />
            ))}
          {/* <ActivityCard
            title={"Staked"}
            amount={"+ $100"}
            price={2050}
            date={"23 May,2022 11:30PM"}
            media={
              "https://cdn3d.iconscout.com/3d/premium/thumb/wallet-4024965-3337585.png"
            }
          /> */}
          {/* <ActivityCard
            title={"Buy Order"}
            amount={"$25"}
            price={1980}
            date={"23 May,2022 11:30PM"}
            media={
              "https://cdn3d.iconscout.com/3d/premium/thumb/income-5012983-4171838.png"
            }
          />
          <ActivityCard
            title={"Buy Order"}
            amount={"$25"}
            price={1950}
            date={"23 May,2022 11:30PM"}
            media={
              "https://cdn3d.iconscout.com/3d/premium/thumb/income-5012983-4171838.png"
            }
          />
          <ActivityCard
            title={"Sell Order"}
            amount={"- $29"}
            price={2060}
            date={"23 May,2022 11:30PM"}
            media={
              "https://cdn3d.iconscout.com/3d/premium/thumb/money-back-guarantee-3980375-3297228.png"
            }
          />
          <ActivityCard
            title={"Unstaked"}
            amount={"$100 + $4"}
            price={2080}
            date={"23 May,2022 11:30PM"}
            media={
              "https://cdn3d.iconscout.com/3d/premium/thumb/money-bag-5191982-4334772.png"
            }
          /> */}
        </Box>
      </Box>
    </Box>
  );
}
