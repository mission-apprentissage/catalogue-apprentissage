import React from "react";
import { StatusBadge } from "../../../StatusBadge";
import { Box, Flex, Heading, Link, Text } from "@chakra-ui/react";
import { ArrowRightLine, DoubleArrows } from "../../../../../theme/components/icons";
import { PARCOURSUP_STATUS } from "../../../../../constants/status";
import { CONTEXT } from "../../../../../constants/context";

export const CardListPsFormations = ({ data, onCardClicked, context }) => {
  const CardContent = () => (
    <Flex w="100%">
      <Box width="75%">
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
                {context === CONTEXT.RECONCILIATION_PS_INCONNUS && (
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
                {context !== CONTEXT.RECONCILIATION_PS_INCONNUS &&
                  context !== CONTEXT.RECONCILIATION_PS_VALIDES &&
                  data.matching_mna_formation.map((mnaF, i) => (
                    <Box mt={5} key={i} fontSize="sm">
                      <DoubleArrows width="12px" height="14px" color="grey.800" mr={5} />
                      {mnaF.intitule_court}

                      {mnaF.parcoursup_statut === PARCOURSUP_STATUS.HORS_PERIMETRE && (
                        <StatusBadge
                          source="Parcoursup"
                          status="nonConforme"
                          text="non-conforme au guide règlementaire"
                          ml={[0, 1]}
                          mr={[0, 1]}
                        />
                      )}
                      {mnaF.parcoursup_statut !== PARCOURSUP_STATUS.HORS_PERIMETRE && (
                        <StatusBadge
                          source="Parcoursup"
                          status="conforme"
                          text="conforme au guide règlementaire"
                          ml={[0, 1]}
                          mr={[0, 1]}
                        />
                      )}
                    </Box>
                  ))}
                {context !== CONTEXT.RECONCILIATION_PS_INCONNUS && data.matching_mna_formation.length === 0 && (
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
      <Flex
        flexGrow={1}
        textAlign="right"
        flexDirection="column"
        justifyContent="space-between"
        textOverflow="ellipsis"
        whiteSpace="nowrap"
        overflow="hidden"
      >
        <Text textStyle="xs">CFD: {data.codes_cfd_mna.join(",")}</Text>
        <Flex justifyContent="flex-end">
          {context !== CONTEXT.RECONCILIATION_PS_INCONNUS && (
            <ArrowRightLine alignSelf="center" color="bluefrance" boxSize={4} />
          )}
        </Flex>
      </Flex>
    </Flex>
  );

  if (context === CONTEXT.RECONCILIATION_PS_INCONNUS) {
    return (
      <Box p={8} bg={"#F9F8F6"} mt={4} onClick={onCardClicked} py={5}>
        <CardContent />
      </Box>
    );
  }
  return (
    <Link variant="card" mt={4} onClick={onCardClicked} py={5} data-testid={"cardps"}>
      <CardContent />
    </Link>
  );
};
