import React from "react";
import { Badge, Flex, Text } from "@chakra-ui/react";

export const AnneeBadge = ({ value, ...props }) => {
  if (value !== "Y") {
    return null;
  }

  const text = "Année d'entrée non renseignée";
  const variant = "default";
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
