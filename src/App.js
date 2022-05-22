import "./App.css";
import React, { useEffect } from "react";
import theme from "./theme";
import { Fragment } from "react";
import Home from "./pages/Home/Home";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import Appbar from "./common/Appbar";
import { Container } from "@mui/material";
import Footer from "./common/Footer";
import { Provider } from "react-redux";
import store from "./store";
import { useMoralis } from "react-moralis";
import Activities from "./pages/Activities/Activities";

function App() {
  const { isWeb3Enabled, enableWeb3, isAuthenticated, isWeb3EnableLoading } =
    useMoralis();

  useEffect(() => {
    const connectorId = window.localStorage.getItem("connectorId");
    if (isAuthenticated && !isWeb3Enabled && !isWeb3EnableLoading)
      enableWeb3({ provider: connectorId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isWeb3Enabled]);

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <Fragment>
          <Router>
            <Appbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/activities" element={<Activities />} />
            </Routes>
          </Router>
        </Fragment>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
