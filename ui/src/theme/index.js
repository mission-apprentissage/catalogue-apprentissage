import { extendTheme } from "@chakra-ui/react";
import * as themeBeta from "./theme-beta";
import { components } from "./components/index";

const overrides = {
  ...themeBeta,
  components,
};

export default extendTheme(overrides);
