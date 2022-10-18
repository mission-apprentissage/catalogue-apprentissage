import React from "react";
import { Box, Text } from "@chakra-ui/react";
import logo from "../../../theme/assets/Logo_RCO_png.png";

export const Logo = ({ size = "sm" }) => {
  let fontSize = "0.7875rem";
  let beforeWidth = "2.0625rem";
  let beforeHeight = "0.75rem";
  let beforeMarginBottom = "0.25rem";
  let beforeBackgroundSize = "2.0625rem 0.84375rem, 2.0625rem 0.75rem, 0";
  let beforeBackgroundPosition = "0 -0.04688rem, 0 0, 0 0";
  let afterMinWidth = "1.96875rem";
  let afterBackgroundSize = "3.9375rem 2.8125rem";
  let afterBackgroundPosition = "0 calc(100% + 1.40625rem)";
  let afterPaddingTop = "1.65625rem";

  if (size === "xl") {
    fontSize = ["1.05rem", "1.05rem", "1.3125rem"];
    beforeWidth = ["2.75rem", "2.75rem", "3.4375rem"];
    beforeHeight = ["1rem", "1rem", "1.25rem"];
    beforeMarginBottom = ["0.33333rem", "0.33333rem", "0.41667rem"];
    beforeBackgroundSize = [
      "2.75rem 1.125rem, 2.75rem 1rem, 0",
      "2.75rem 1.125rem, 2.75rem 1rem, 0",
      "3.4375rem 1.40625rem, 3.4375rem 1.25rem, 0",
    ];
    beforeBackgroundPosition = ["0 -0.0625rem, 0 0, 0 0", "0 -0.0625rem, 0 0, 0 0", "0 -0.07812rem, 0 0, 0 0"];
    afterMinWidth = ["2.625rem", "2.625rem", "3.28125rem"];
    afterBackgroundSize = ["5.25rem 3.75rem", "5.25rem 3.75rem", "6.5625rem 4.6875rem"];
    afterBackgroundPosition = ["0 calc(100% + 1.875rem)", "0 calc(100% + 1.875rem)", "0 calc(100% + 2.34375rem)"];
    afterPaddingTop = ["2.20833rem", "2.20833rem", "2.76042rem"];
  }

  return (
    <Box p={[0, 0, 4]}>
      <img src={logo} width="50%" />
    </Box>
  );
};
