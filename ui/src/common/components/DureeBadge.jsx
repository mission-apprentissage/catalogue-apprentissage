import React from "react";
import { Badge, Flex, Text } from "@chakra-ui/react";
import { CheckLine, Question } from "../../theme/components/icons";

export const DureeBadge = ({ value, ...props }) => {
  if (value !== "D") {
    return null;
  }

  const text = "Durée non renseignée";
  const variant = "ok";
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
