import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "./theme/index";

ReactDOM.render(
  <ChakraProvider theme={theme} resetCSS>
    <App />
  </ChakraProvider>,
  document.getElementById("root")
);
