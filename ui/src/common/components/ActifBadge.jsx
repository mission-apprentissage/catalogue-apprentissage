import React from "react";
import { Badge, Flex, Text } from "@chakra-ui/react";
import { CheckLine, Question } from "../../theme/components/icons";

export const ActifBadge = ({ value, ...props }) => {
  let text;
  let variant;
  let Icon;

  const isActif = values.etablissement_gestionnaire_actif === 'actif' && values.etablissement_formateur_actif === 'actif';

  if (isActif) {
    text = "SIRET actif";
    variant = "ok";
    Icon = CheckLine;
  } else {
    text = "SIRET inactif";
    variant = "notOk";
    Icon = null;
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
