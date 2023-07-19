import React from "react";
import { Badge, Flex, Text } from "@chakra-ui/react";
import { CheckLine, Question } from "../../theme/components/icons";

export const HabiliteBadge = ({ value, ...props }) => {
  let text;
  let variant;
  let Icon;

  switch (value) {
    case true:
      text = "Habilité RCNP";
      variant = "ok";
      Icon = CheckLine;
      break;

    case false:
      text = "Non habilité RCNP";
      variant = "notOk";
      Icon = null;
      break;

    default:
      text = "Habilitation RNCP non recherchée";
      variant = "default";
      Icon = Question;
      break;
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
