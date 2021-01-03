import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "./theme/index";

//import "bootstrap/dist/css/bootstrap.min.css";

if (
  window.location.hostname.includes("catalogue.apprentissage.beta.gouv.fr") &&
  window.location.pathname !== "/report" &&
  window.location.pathname !== "/coverage"
) {
  window.location.replace("https://mna-admin-prod.netlify.app");
}

ReactDOM.render(
  <React.StrictMode>
    <ChakraProvider theme={theme} resetCSS>
      <App />
    </ChakraProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
