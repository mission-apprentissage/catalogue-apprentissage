import React from "react";
import { Box } from "@chakra-ui/react";

export const DangerBox = (args) => (
  <Box
    bg={"orangesoft.200"}
    p={4}
    mb={4}
    borderLeft={"4px solid"}
    borderColor={"orangesoft.500"}
    w={"full"}
    {...args}
  />
);
