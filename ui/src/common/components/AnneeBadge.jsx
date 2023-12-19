import React from "react";
import { Badge, Flex, Text } from "@chakra-ui/react";
import { CheckLine, Question } from "../../theme/components/icons";

export const AnneeBadge = ({ value, ...props }) => {
  let text;
  let variant;
  let Icon;

  if (value === "Y") {
    text = "Ann\u00e9e non renseign\u00e9e";
    variant = "ok";
    Icon = Question;
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
