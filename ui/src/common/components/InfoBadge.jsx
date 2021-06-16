import React from "react";
import { Badge, Text, Flex } from "@chakra-ui/react";

export const InfoBadge = ({ text, variant, ...badgeProps }) => {
  return (
    <Badge variant={variant} {...badgeProps}>
      <Flex alignItems="center">
        <Text ml={1} textTransform="uppercase">
          {text}
        </Text>
      </Flex>
    </Badge>
  );
};
