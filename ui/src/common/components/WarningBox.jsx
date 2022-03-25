import React from "react";
import { Box } from "@chakra-ui/react";

export const WarningBox = (args) => (
  <Box
    bg={"orangemedium.200"}
    p={4}
    mb={4}
    borderLeft={"4px solid"}
    borderColor={"orangemedium.500"}
    w={"full"}
    {...args}
  />
);
