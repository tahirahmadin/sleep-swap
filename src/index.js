import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import getLibrary from "./utils/getLibrary";
import { NetworkContextName } from "./constants/index";
import store from "./store";
import { createWeb3ReactRoot, Web3ReactProvider } from "web3-react-core";
import { Provider } from "react-redux";
import MulticallUpdater from "./state/multicall/updater";
import { BlockUpdater } from "./hooks/useBlockNumber";

import { MoralisProvider } from "react-moralis";

const applicationId = "WCJyTcbMoLK1YCm39SV7XTB6kRZuMw7gf0IbF2Dd";
const serverUrl = "https://tubezrrbvi7q.usemoralis.com:2053/server";

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName);

ReactDOM.render(
  <React.StrictMode>
    <MoralisProvider appId={applicationId} serverUrl={serverUrl}>
      <Provider store={store}>
        <Web3ReactProvider getLibrary={getLibrary}>
          <Web3ProviderNetwork getLibrary={getLibrary}>
            <MulticallUpdater />
            <BlockUpdater />
            <App />
          </Web3ProviderNetwork>
        </Web3ReactProvider>
      </Provider>
    </MoralisProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
