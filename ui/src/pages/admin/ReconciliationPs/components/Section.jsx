import { Box, HStack } from "@chakra-ui/react";
import React from "react";

const Section = ({ left, right, middle, withBorder, minH, leftWith }) => {
  return (
    <HStack
      spacing="8"
      px={right ? [4, 16] : null}
      minH={minH ?? "60px"}
      alignItems="stretch"
      textStyle="rf-text"
      fontWeight="700"
    >
      <Box
        w={middle ? (leftWith ? leftWith : "15%") : "51%"}
        flexGrow="1"
        borderBottom={withBorder ? "1px solid" : null}
        borderColor="#E7E7E7"
        color="grey.700"
        textStyle="rf-text"
        fontWeight="400"
      >
        {left}
      </Box>
      {middle && (
        <Box w="30%" flexGrow="1" borderBottom={withBorder ? "1px solid" : null} borderColor="bluefrance">
          {middle}
        </Box>
      )}
      {right && (
        <Box w="40%" flexGrow="1" borderBottom={withBorder ? "1px solid" : null} borderColor="bluefrance">
          {right}
        </Box>
      )}
    </HStack>
  );
};

export { Section };
