import React from "react";
import { Badge, Flex } from "@chakra-ui/react";
import { CheckLine } from "../../theme/components/icons";

export const QualiopiBadge = (props) => {
  return (
    <Badge
      bg="#00009114"
      borderRadius="16px"
      color="bluefrance"
      textStyle="sm"
      px="15px"
      mr="10px"
      textTransform="none"
      mt={3}
      {...props}
    >
      <Flex alignItems="center">
        Qualiopi <CheckLine ml={1} />
      </Flex>
    </Badge>
  );
};
