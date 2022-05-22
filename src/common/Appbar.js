import { Box, Container, Avatar, Hidden } from "@mui/material";
import React, { useCallback } from "react";
import { makeStyles } from "@mui/styles";

import { connect } from "react-redux";
import { requestChalleng } from "../actions/userActions";

import { useUserAuthentication } from "../hooks/useUserAuthentication";
import { CONNECTOR_TYPE } from "../constants";
import ConnectButton from "./ConnectButton";
import { Link } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  linkItems: {
    paddingRight: 20,
    paddingTop: 7,
    fontWeight: 600,
    paddingLeft: 15,
    fontSize: 15,
  },
  logo: {
    height: 50,
    [theme.breakpoints.down("sm")]: {
      height: 30,
    },
  },
  paper: {
    top: "67px !important",
    left: "unset !important",
    right: "0 !important",
    width: "45%",
    borderRadius: "0",
    backgroundColor: "black",
    transformOrigin: "16px -1px !important",
  },
  listItem: {
    justifyContent: "center",
  },
  navbarButton: {
    backgroundColor: theme.palette.primary.main,
    color: "white",
    padding: "7px 18px 7px 18px",
    border: "none",
    borderRadius: 10,
    fontWeight: 400,
    letterSpacing: 0.4,
    textTransform: "none",
    fontSize: 15,
    "&:hover": {
      background: theme.palette.primary.hover,
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
      background: theme.palette.primary.hover,
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
  numbers: {
    color: "#f9f9f9",
    fontSize: 14,
  },
}));

const Appbar = ({ requestChalleng }) => {
  const classes = useStyles();

  const [authStatus, connectWallet] = useUserAuthentication();

  const handleConnectWallet = useCallback(() => {
    connectWallet(CONNECTOR_TYPE.injected);
  }, [connectWallet]);

  return (
    <Box style={{ position: "relative", zIndex: 10 }}>
      <header>
        <Hidden mdDown>
          <Container>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    marginRight: "2rem",
                    color: "black",
                    textDecoration: "none",
                  }}
                >
                  <img
                    src="https://cdn3d.iconscout.com/3d/free/thumb/squigly-globe-3494833-2926648@0.png"
                    alt="SleepSwap"
                    className={classes.logo}
                  />
                  <div
                    style={{
                      paddingLeft: 2,
                      color: "black",
                      fontWeight: 700,
                      fontSize: 20,
                      textDecoration: "none",
                    }}
                  >
                    Sleep Swap
                  </div>
                </div>
                <Box>
                  {/* <Box display="flex" justifyContent="flex-start">
                  <Link to="/" style={{ textDecoration: "none" }}>
                    {" "}
                    <Typography
                      variant="h6"
                      color="textSecondary"
                      className={classes.linkItems}
                      style={{
                        color: "black",
                      }}
                    >
                      Home
                    </Typography>
                  </Link>
                </Box> */}
                </Box>
              </Box>

              <Box display="flex" justifyContent="flex-end" alignItems="center">
                <Box
                  display="flex"
                  justifyContent="flex-end"
                  alignItems="center"
                >
                  <Link to="activities">
                    {" "}
                    <div
                      style={{
                        paddingLeft: 2,
                        color: "black",
                        fontWeight: 500,
                        fontSize: 15,
                        textDecoration: "none",
                        marginRight: 10,
                      }}
                    >
                      My Activities
                    </div>
                  </Link>
                </Box>
                <div style={{ padding: 3, paddingRight: 10 }}>
                  <Avatar src="https://cdn3d.iconscout.com/3d/premium/thumb/notification-bell-4730505-3934029.png" />{" "}
                </div>
                <ConnectButton />
              </Box>
            </Box>
          </Container>
        </Hidden>
        <Hidden smUp>
          <Container>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    marginRight: "2rem",
                    color: "black",
                    textDecoration: "none",
                  }}
                >
                  <img
                    src="https://cdn3d.iconscout.com/3d/free/thumb/squigly-globe-3494833-2926648@0.png"
                    alt="SleepSwap"
                    className={classes.logo}
                  />
                  <div
                    style={{
                      paddingLeft: 2,
                      color: "black",
                      fontWeight: 700,
                      fontSize: 14,
                      textDecoration: "none",
                    }}
                  >
                    Sleep Swap
                  </div>
                </div>
                <Box>
                  {/* <Box display="flex" justifyContent="flex-start">
                  <Link to="/" style={{ textDecoration: "none" }}>
                    {" "}
                    <Typography
                      variant="h6"
                      color="textSecondary"
                      className={classes.linkItems}
                      style={{
                        color: "black",
                      }}
                    >
                      Home
                    </Typography>
                  </Link>
                </Box> */}
                </Box>
              </Box>

              <Box display="flex" justifyContent="flex-end" alignItems="center">
                <div style={{ padding: 3, paddingRight: 10 }}>
                  <Avatar src="https://cdn3d.iconscout.com/3d/premium/thumb/notification-bell-4730505-3934029.png" />{" "}
                </div>
                <div style={{ padding: 3, paddingRight: 10 }}>
                  <Avatar src="https://cdn3d.iconscout.com/3d/premium/thumb/burger-menu-2891366-2409762@0.png" />{" "}
                </div>
              </Box>
            </Box>
          </Container>
        </Hidden>
      </header>
    </Box>
  );
};

const mapStateToProps = (state) => ({
  user: state.user,
});

export default connect(mapStateToProps, { requestChalleng })(Appbar);
