import { Box, Flex, Text } from "@chakra-ui/react";
import React from "react";

const EffectifCard = ({ label, stat, indicatorColor }) => {
  return (
    <Box background="bluesoft.50" padding="3w" minWidth="14rem">
      <Flex alignItems="center">
        <Box borderRadius="50%" background={indicatorColor} h="1rem" w="1rem" mr="1w" />
        <Text color="grey.800" fontSize="gamma" fontWeight="700">
          {stat}
        </Text>
      </Flex>
      <Text color="grey.800" fontSize="epsilon">
        {label}
      </Text>
    </Box>
  );
};

export default EffectifCard;
