import "./App.css";
import React from "react";
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

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <Fragment>
          <Router>
            <Appbar />
            <Routes>
              <Route path="/" element={<Home />} />
            </Routes>
          </Router>
        </Fragment>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
