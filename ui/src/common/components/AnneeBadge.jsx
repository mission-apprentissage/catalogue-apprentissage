import React from "react";
import { Badge, Flex, Text } from "@chakra-ui/react";
import { CheckLine, Question } from "../../theme/components/icons";


export const AnneeBadge = ({ value, ...props }) => {
  let variant;
  let Icon;

      variant = "ok";
      Icon = CheckLine;

  return (
    <Badge variant={variant} {...props}>
      <Flex alignItems="center">
        <Text mx={1} as={"span"}>
          {value ? "Année valide" : "Année manquante"}
        </Text>
        {Icon && <Icon ml={1} />}
      </Flex>
    </Badge>
  );
};
