import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import { ChakraProvider } from "@chakra-ui/react";

import "./index.css";

import App from "./App";
import theme from "./theme";

if (process.env.REACT_APP_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    // Setting this option to true will send default PII data to Sentry.
    // For example, automatic IP address collection on events
    sendDefaultPii: true,
  });

  console.log("Sentry enabled");
}

// console.log(process.env)

const root = createRoot(document.getElementById("root"));

root.render(
  <ChakraProvider theme={theme} resetCSS>
    <App />
  </ChakraProvider>
);
