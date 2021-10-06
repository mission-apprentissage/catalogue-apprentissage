import React from "react";
import { Text } from "@chakra-ui/react";
import { academies } from "../../../constants/academies";
import { getIntegrationCount } from "../../../common/api/perimetre";
import { useQuery } from "react-query";

export const CountText = ({ totalFormationsCount, plateforme, niveaux, academie, ...rest }) => {
  const { data: integrationCount } = useQuery(
    ["integration", plateforme, academie],
    () => getIntegrationCount({ plateforme, academie }),
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const diplomesCount = niveaux.reduce(
    (acc, { diplomes }) =>
      acc +
      diplomes.length +
      diplomes.reduce(
        (acc2, { regles }) =>
          acc2 + regles.filter(({ nom_regle_complementaire }) => nom_regle_complementaire !== null).length,
        0
      ),
    0
  );

  return (
    <Text {...rest}>
      Actuellement{" "}
      {academie
        ? `pour l'académie de ${
            Object.values(academies).find(({ num_academie }) => num_academie === Number(academie))?.nom_academie
          }`
        : "au national"}
      , {integrationCount?.nbRules ?? "-"} diplômes ou titres en apprentissage ({integrationCount?.nbFormations ?? "-"}{" "}
      formations) doivent ou peuvent intégrer la plateforme {plateforme} sur les {diplomesCount} recensés (
      {totalFormationsCount} formations) dans le Catalogue général.
    </Text>
  );
};
