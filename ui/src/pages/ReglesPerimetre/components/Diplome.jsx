import React, { useEffect, useRef } from "react";
import { Line } from "./Line";
import { Box } from "@chakra-ui/react";

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
  isSelected,
}) => {
  const ref = useRef(null);

  useEffect(() => {
    if (isSelected) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    }
  }, [isSelected]);

  const { value, count, regles } = diplome;

  // check if it has one rule at diplome level
  const [diplomeRule] = regles.filter(({ nom_regle_complementaire }) => nom_regle_complementaire === null);
  const otherRules = regles.filter(({ nom_regle_complementaire }) => nom_regle_complementaire !== null);

  return (
    <Box bg={bg} ref={ref}>
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
