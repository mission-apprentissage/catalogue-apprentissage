import React from "react";
import { Box, Button, Flex, Heading, Text } from "@chakra-ui/react";
import { getParcoursupError } from "../../utils/parcoursupErrorUtils";

export const RejectionBlock = ({ formation }) => {
  if (!formation?.parcoursup_error) {
    return;
  }

  const error = getParcoursupError(formation);

  if (!error) {
    return;
  }

  return (
    <>
      <Box mt={4} p={6} border="1px" color="red">
        <Flex>
          <Box>
            <Heading textStyle="h4" color="red">
              {formation?.parcoursup_error}
            </Heading>
            <Text>{error.description}</Text>
            <Text>{error.action}</Text>
          </Box>
          <Box>
            <Button>Je prends en charge</Button>
          </Box>
        </Flex>
      </Box>
    </>
  );
};
