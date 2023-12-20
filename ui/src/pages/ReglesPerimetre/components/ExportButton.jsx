import React from "react";
import { Button } from "@chakra-ui/react";
import { DownloadLine } from "../../../theme/components/icons";
import { createCSV, downloadCSV } from "../../../common/utils/downloadUtils";
import { academies } from "../../../constants/academies";

const exportRules = (plateforme, rules) => {
  const headers = [
    {
      key: "niveau",
      label: "Niveau",
    },
    {
      key: "diplome",
      label: "Diplome (BCN)",
    },
    {
      key: "nom_regle_complementaire",
      label: "Nom du diplome ou titre",
    },
    {
      key: "condition_integration",
      label: "Condition d'integration",
    },
    {
      key: "statut",
      label: "Statut",
    },
    {
      key: "last_update_at",
      label: "Derniere mise a jour",
    },
    {
      key: "last_update_who",
      label: "Dernier contributeur",
    },
    {
      key: "statut_academies",
      label: "Statuts spécifiques en académies",
      formatter: (value) => {
        const statuses = Object.entries(value).reduce((acc, [key, statut]) => {
          const nom_academie = academies[key.padStart(2, "0")].nom_academie;
          return [...acc, `${nom_academie}:${statut}`];
        }, []);

        return `="${statuses.join(", ")}"`;
      },
    },
    {
      key: "regle_complementaire_query",
      label: "Règles complémentaires",

      formatter: (value) => {
        const regles = JSON.parse(value).map(({ field, operator, value, combinator, index }) => ({
          field,
          operator,
          value,
          combinator,
          index,
        }));

        return JSON.stringify(regles);
      },
    },
  ];

  const date = new Date().toLocaleDateString();
  const data = createCSV({ headers, rows: rules });
  downloadCSV(`export-condition-integration-${plateforme}-${date}.csv`, data);
};

export const ExportButton = ({ plateforme, rules }) => {
  return (
    <Button size="sm" variant="pill" disabled={rules.length === 0} onClick={() => exportRules(plateforme, rules)}>
      <DownloadLine mx="0.5rem" w="0.75rem" h="0.75rem" />
      Exporter
    </Button>
  );
};
