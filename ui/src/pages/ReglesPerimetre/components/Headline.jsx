import React from "react";
import { Box, Flex, Text } from "@chakra-ui/react";

export const Headline = ({ academie }) => {
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
            <Flex mr={8}>formations</Flex>
            {!academie && (
              <Flex mr={8} pl={4}>
                condition d’intégration
              </Flex>
            )}
            <Flex mr={8} pl={4}>
              règles de publication
            </Flex>
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
};
