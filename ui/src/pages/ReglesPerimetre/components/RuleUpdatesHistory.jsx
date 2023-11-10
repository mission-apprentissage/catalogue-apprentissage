import React from "react";
import { Flex, Text } from "@chakra-ui/react";

const humanReadablekeyMap = {
  regle_complementaire: "Autre(s) critère(s)",
  nom_regle_complementaire: "Nom du diplôme ou titre",
  last_update_who: "Modifié par",
  condition_integration: "Condition d'intégration",
  statut: "Règle de publication",
  diplome: "Type de diplôme ou titre",
  niveau: "Niveau",
};

export const RuleUpdatesHistory = ({ label, value }) => {
  return (
    <Flex flexDirection={"column"} w={"full"} h={"full"}>
      <Text mb={1}>{label} :</Text>
      <Flex p={2} bg={"grey.750"} color="grey.100" h={"full"} flexDirection={"column"}>
        {value &&
          Object.entries(value)
            .filter(([key]) => key !== "regle_complementaire_query")
            .map(([key, value]) => (
              <Text as={"span"} key={key} overflowWrap={"anywhere"}>
                <strong>{humanReadablekeyMap[key] ?? key}:</strong> {JSON.stringify(value)}
              </Text>
            ))}
      </Flex>
    </Flex>
  );
};
