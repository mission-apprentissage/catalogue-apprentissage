import React from "react";
import { Badge, Flex, Text } from "@chakra-ui/react";
import { CheckLine, Question } from "../../theme/components/icons";

export const QualiteBadge = ({ value, ...props }) => {
  let variant;
  let Icon;

  switch (value) {
    case true:
      variant = "ok";
      Icon = CheckLine;
      break;

    case false:
      variant = "notOk";
      Icon = null;
      break;

    default:
      variant = "default";
      Icon = Question;
      break;
  }

  return (
    <Badge variant={variant} {...props}>
      <Flex alignItems="center">
        <Text mx={1} as={"span"}>
          {value ? "Certifié qualité" : "Non certifié qualité"}
        </Text>
        {Icon && <Icon ml={1} />}
      </Flex>
    </Badge>
  );
};
