import React from "react";
import { Badge, Flex, Text } from "@chakra-ui/react";
import { CheckLine, Question } from "../../theme/components/icons";

export const DureeBadge = ({ value, ...props }) => {
  let text;
  let variant;
  let Icon;

  if (value === "Y") {
    text = "Dur\u00e9e";
    variant = "ok";
    Icon = CheckLine;
  }

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
