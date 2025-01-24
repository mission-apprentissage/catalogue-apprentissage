import React, { useEffect, useRef, useState } from "react";
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
  isSelected,
}) => {
  const ref = useRef(null);
  const [background, setBackground] = useState(bg);
  const [transitionDuration, setTransitionDuration] = useState("0s");

  useEffect(() => {
    if (isSelected) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    }
  }, [isSelected]);

  const { value, count, regles } = diplome;
  const academieStatuts = [AFFELNET_STATUS.A_DEFINIR];

  // check if it has one rule at diplome level
  const [diplomeRule] = regles.filter(({ nom_regle_complementaire }) => nom_regle_complementaire === null);
  const otherRules = regles
    .filter(({ nom_regle_complementaire }) => nom_regle_complementaire !== null)
    .filter((rule) => !academie || academieStatuts.includes(rule.statut));

  useEffect(() => {
    if (isSelected) {
      setBackground("yellow.100");
      setTransitionDuration("0s");
      setTimeout(() => {
        setBackground(bg);
        setTransitionDuration("2s");
      }, 2000);
    }
  }, [isSelected, bg]);

  return (
    <Box bg={background} transitionDuration={transitionDuration} ref={ref}>
      {(!academie || academieStatuts.includes(diplomeRule?.statut) || otherRules?.length > 0) && (
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
