import { extendTheme } from "@chakra-ui/react";
import { fonts, colors, fontSizes, space, rootFontSizePx } from "./theme-beta";
import { components } from "./components/index";

const styles = {
  global: {
    "html, body": {
      fontSize: `${rootFontSizePx}px`,
      fontFamily: "Inter",
      background: "white",
      color: "primaryText",
    },
  },
};

const catalogueColors = {
  primaryText: "#19414c",
  primaryBackground: "white",
  secondaryBackground: "#e5edef",
  blue: {
    500: "#007BFF",
  },
};

const overrides = {
  fonts,
  colors: { ...colors, ...catalogueColors },
  styles,
  fontSizes,
  space,
  components,
};

export default extendTheme(overrides);
