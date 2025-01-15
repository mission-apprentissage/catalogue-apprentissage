import React, { useEffect, useRef } from "react";
import { Line } from "./Line";
import { Box } from "@chakra-ui/react";
import { AFFELNET_STATUS } from "../../../constants/status";

export const Diplome = ({
  bg,
  plateforme,
  niveau,
  diplome,
  onShowRule,
  onCreateRule,
  onUpdateRule,
  onDeleteRule,
  isExpanded,
  academie,
  seeAllRules,
  isSelected,
}) => {
  const ref = useRef(null);

  useEffect(() => {
    if (isSelected) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    }
  }, [isSelected]);

  const { value, count, regles } = diplome;
  const academieStatuts = [AFFELNET_STATUS.A_PUBLIER_VALIDATION];

  // check if it has one rule at diplome level
  const [diplomeRule] = regles.filter(({ nom_regle_complementaire }) => nom_regle_complementaire === null);
  const otherRules = regles
    .filter(({ nom_regle_complementaire }) => nom_regle_complementaire !== null)
    .filter((rule) => !!seeAllRules || academieStatuts.includes(rule.statut));

  return (
    <Box bg={bg} ref={ref}>
      {(!!seeAllRules || academieStatuts.includes(diplomeRule?.statut) || otherRules?.length > 0) && (
        <Line
          plateforme={plateforme}
          niveau={niveau}
          diplome={value}
          label={value}
          rule={diplomeRule}
          onShowRule={onShowRule}
          onCreateRule={onCreateRule}
          onUpdateRule={onUpdateRule}
          onDeleteRule={onDeleteRule}
          count={count}
          academie={academie}
          shouldFetchCount={isExpanded}
        />
      )}
      {otherRules?.length > 0 &&
        otherRules.map((rule) => (
          <Line
            key={rule._id}
            plateforme={plateforme}
            niveau={niveau}
            diplome={value}
            label={rule.nom_regle_complementaire}
            rule={rule}
            onShowRule={onShowRule}
            onCreateRule={onCreateRule}
            onUpdateRule={onUpdateRule}
            onDeleteRule={onDeleteRule}
            shouldFetchCount={isExpanded}
            showIcon={true}
            academie={academie}
          />
        ))}
    </Box>
  );
};
