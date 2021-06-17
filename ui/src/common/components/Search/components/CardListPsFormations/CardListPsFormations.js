import React from "react";
import { StatusBadge } from "../../../StatusBadge";
import { Box, Flex, Heading, Link, Text } from "@chakra-ui/react";
import { ArrowRightLine, DoubleArrows } from "../../../../../theme/components/icons";

export const CardListPsFormations = ({ data, onCardClicked, context }) => {
  const CardContent = () => (
    <Flex w="100%">
      <Box width="70%">
        <Heading textStyle="h6" color="grey.800" mt={2} textOverflow="ellipsis" whiteSpace="nowrap" overflow="hidden">
          {data.libelle_formation} - {data.libelle_specialite}
        </Heading>
        <Box>
          <Text textStyle="sm">
            {data.libelle_commune} - {data.code_postal} - académie de {data.nom_academie}
          </Text>

          <Box>
            <Flex justifyContent="space-between">
              <Box>
                {context === "reconciliation_ps_inconnus" && (
                  <Box mt={5} fontSize="sm">
                    {data.statut_reconciliation === "REJETE" ? (
                      <StatusBadge status="Rejeté" ml={0} mr={[0, 2]} />
                    ) : (
                      <StatusBadge status="Inconnu" ml={0} mr={[0, 2]} />
                    )}
                    <DoubleArrows width="12px" height="14px" color="grey.800" mr={5} />
                    N.A
                  </Box>
                )}
                {context !== "reconciliation_ps_inconnus" &&
                  data.matching_mna_formation.map((mnaF, i) => (
                    <Box mt={5} key={i} fontSize="sm">
                      <DoubleArrows width="12px" height="14px" color="grey.800" mr={5} />
                      {mnaF.intitule_court}
                      <StatusBadge source="Parcoursup" status={mnaF.parcoursup_statut} ml={[0, 5]} mr={[0, 2]} />
                    </Box>
                  ))}
                {context !== "reconciliation_ps_inconnus" && data.matching_mna_formation.length === 0 && (
                  <Box mt={5} fontSize="sm">
                    <DoubleArrows width="12px" height="14px" color="grey.800" mr={5} />
                    N.A
                  </Box>
                )}
              </Box>
            </Flex>
          </Box>
        </Box>
      </Box>
      <Flex flexGrow={1} textAlign="right" flexDirection="column" justifyContent="space-between">
        <Text textStyle="xs">CFD: {data.codes_cfd_mna.join(",")}</Text>
        <Flex justifyContent="flex-end">
          {context !== "reconciliation_ps_inconnus" && (
            <ArrowRightLine alignSelf="center" color="bluefrance" boxSize={4} />
          )}
        </Flex>
      </Flex>
    </Flex>
  );

  if (context === "reconciliation_ps_inconnus") {
    return (
      <Box p={8} bg={"#F9F8F6"} mt={4} onClick={onCardClicked} py={5}>
        <CardContent />
      </Box>
    );
  }
  return (
    <Link variant="card" mt={4} onClick={onCardClicked} py={5}>
      <CardContent />
    </Link>
  );
};
