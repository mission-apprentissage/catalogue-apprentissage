import React from "react";
import { Box, Text } from "@chakra-ui/react";
import logo from "../../../theme/assets/Logo_RCO_png.png";

export const Logo = ({ size = "sm" }) => {
  return (
    <Box p={[0, 0, 4]}>
      <img src={logo} width="50%" />
    </Box>
  );
};
