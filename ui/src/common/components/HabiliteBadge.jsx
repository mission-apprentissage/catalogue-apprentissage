import React from "react";
import { Badge, Flex, Text } from "@chakra-ui/react";
import { CheckLine, CrossLine, Question } from "../../theme/components/icons";

export const HabiliteBadge = ({ value, ...props }) => {
  let variant;
  let Icon;

  switch (value) {
    case true:
      variant = "ok";
      Icon = CheckLine;
      break;

    case false:
      variant = "notOk";
      Icon = CrossLine;
      break;

    default:
      variant = "default";
      Icon = Question;
      break;
  }

  return (
    <>
      {value === null ?? (
        <Badge variant={variant} {...props}>
          <Flex alignItems="center">
            <Text mx={1} as={"span"}>
              Habilité RNCP
            </Text>
            <Icon ml={1} />
          </Flex>
        </Badge>
      )}
    </>
  );
};
