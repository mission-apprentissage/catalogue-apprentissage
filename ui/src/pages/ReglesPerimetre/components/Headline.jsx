import React from "react";
import { Box, Flex, Text } from "@chakra-ui/react";

export const Headline = () => {
  return (
    <Box>
      <Box bg="galt">
        <Flex px={8} py={5} alignItems="center" w={"full"}>
          <Flex grow={1} alignItems="center" pr={2} maxWidth={"45%"} isTruncated>
            <Text fontWeight={700} isTruncated>
              Diplômes et titres
            </Text>
          </Flex>
          <Flex alignItems="center">
            <Flex>formations</Flex>
            <Flex px={8}>condition d’intégration</Flex>
            <Flex>règles de publication</Flex>
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
};
