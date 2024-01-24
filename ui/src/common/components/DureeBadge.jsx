import React from "react";
import { Badge, Flex, Text } from "@chakra-ui/react";

export const DureeBadge = ({ value, ...props }) => {
  if (!["D", null].includes(value)) {
    return null;
  }

  const text = "Durée non renseignée";
  const variant = "notOk";
  const Icon = null;

  return (
    <Badge variant={variant} {...props}>
      <Flex alignItems="center">
        <Text mx={1} as={"span"}>
          {text}
        </Text>
        {Icon && <Icon ml={1} />}
      </Flex>
    </Badge>
  );
};
