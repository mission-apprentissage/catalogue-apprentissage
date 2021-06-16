import React from "react";
import { StatusBadge } from "../../../StatusBadge";
import { Box, Flex, Heading, Link, Text } from "@chakra-ui/react";
import { ArrowRightLine, DoubleArrows } from "../../../../../theme/components/icons";
import { InfoBadge } from "../../../InfoBadge";

export const CardListPsFormations = ({ data, onCardClicked, context }) => {
  return (
    <Link variant="card" mt={4} onClick={onCardClicked}>
      <Flex display={["none", "flex"]} textStyle="xs" justifyContent="space-between">
        <Text>{data.etablissement_gestionnaire_entreprise_raison_sociale}</Text>
        <Text>Code diplôme : {data.codes_cfd_mna.join(",")}</Text>
      </Flex>
      <Heading textStyle="h6" color="grey.800" mt={2}>
        {data.libelle_formation} - {data.libelle_specialite}
        {data.statut_reconciliation === "REJETE" && (
          <InfoBadge text="Rejeté" variant="published" bg="redmarianne" color="white" />
        )}
      </Heading>
      <Box>
        <Text textStyle="sm">
          {data.libelle_commune} - {data.code_postal} - académie de {data.nom_academie}
        </Text>

        <Box>
          <Flex justifyContent="space-between">
            <Box>
              {context === "reconciliation_ps_inconnus" && (
                <Box mt={5}>
                  <DoubleArrows width="12px" height="14px" color="grey.800" mx={5} />
                  N.A
                </Box>
              )}
              {context !== "reconciliation_ps_inconnus" &&
                data.matching_mna_formation.map((mnaF, i) => (
                  <Box mt={5} key={i}>
                    {mnaF.intitule_court}
                    <DoubleArrows width="12px" height="14px" color="grey.800" mx={5} />
                    <StatusBadge source="Parcoursup" status={mnaF.parcoursup_statut} mr={[0, 2]} />
                  </Box>
                ))}
              {context !== "reconciliation_ps_inconnus" && data.matching_mna_formation.length === 0 && (
                <Box mt={5}>
                  <DoubleArrows width="12px" height="14px" color="grey.800" mx={5} />
                  N.A
                </Box>
              )}
            </Box>
            <ArrowRightLine alignSelf="center" color="bluefrance" boxSize={4} />
          </Flex>
        </Box>
      </Box>
    </Link>
  );
};
