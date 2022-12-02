import React from "react";
import { NavLink } from "react-router-dom";
import useAuth from "../../../../hooks/useAuth";
import { Box, Flex, Heading, Link, Text } from "@chakra-ui/react";
import { ArrowRightLine, InfoCircle } from "../../../../../theme/components/icons";
import { QualiteBadge } from "../../../QualiteBadge";
import { HabiliteBadge } from "../../../HabiliteBadge";

export const CardListFormation = ({ data, context }) => {
  let [auth] = useAuth();

  return (
    <Link as={NavLink} to={`/formation/${data._id}`} variant="card" mt={4} data-testid={"card_formation"}>
      <Flex display={["none", "flex"]} textStyle="xs" justifyContent="space-between">
        <Text>{data.etablissement_gestionnaire_entreprise_raison_sociale}</Text>
        <Text>CFD : {data.cfd}</Text>
      </Flex>
      <Heading textStyle="h6" color="grey.800" mt={2}>
        {data.intitule_long}
      </Heading>
      <Box>
        <Text textStyle="sm">
          {data.lieu_formation_adresse}, {data.code_postal} {data.localite}
        </Text>
        <Text textStyle="sm">Académie : {data.nom_academie}</Text>
        <Box>
          <Flex justifyContent="space-between">
            <Flex mt={1} flexWrap={"wrap"}>
              {!data.catalogue_published && (
                <>
                  <QualiteBadge value={data.etablissement_gestionnaire_certifie_qualite} mt={2} mr={[0, 2]} />
                  {["Titre", "TP"].includes(data.rncp_details?.code_type_certif) && (
                    <HabiliteBadge value={data.etablissement_reference_habilite_rncp} mt={2} mr={[0, 2]} />
                  )}
                </>
              )}
            </Flex>
            <ArrowRightLine alignSelf="center" color="bluefrance" boxSize={4} />
          </Flex>
          <Flex justifyContent="space-between">
            {data.ids_action?.length > 0 && (
              <Text textStyle="xs" mt={4}>
                identifiant actions Carif Oref: {data.ids_action.join(",")}
              </Text>
            )}
            {auth?.sub !== "anonymous" && data.annee === "X" && (
              <Flex textStyle="xs" mt={4} alignItems="center">
                <InfoCircle />
                <Text as={"span"} ml={1}>
                  Année d'entrée en apprentissage non collectée
                </Text>
              </Flex>
            )}
          </Flex>
        </Box>
      </Box>
    </Link>
  );
};
