import React from "react";
import { NavLink } from "react-router-dom";
import { hasAccessTo } from "../../../../utils/rolesUtils";
import useAuth from "../../../../hooks/useAuth";
import { StatusBadge } from "../../../StatusBadge";
import { Box, Flex, Heading, Link, Text } from "@chakra-ui/react";
import { ArrowRightLine } from "../../../../../theme/components/icons";

export const CardListFormation = ({ data }) => {
  let [auth] = useAuth();

  return (
    <Link as={NavLink} to={`/formation/${data._id}`} variant="card" mt={4} isExternal>
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
            <Flex mt={3} flexWrap={"wrap"}>
              {hasAccessTo(auth, "page_catalogue/voir_status_publication") &&
                data.etablissement_reference_catalogue_published && (
                  <>
                    <StatusBadge source="Parcoursup" status={data.parcoursup_statut} mr={[0, 2]} />
                    <StatusBadge source="Affelnet" status={data.affelnet_statut} mt={[2, 0]} />
                  </>
                )}
            </Flex>
            <ArrowRightLine alignSelf="center" color="bluefrance" boxSize={4} />
          </Flex>
          {data.ids_action?.length > 0 && (
            <Text textStyle="xs" mt={4}>
              identifiant actions Carif Oref: {data.ids_action.join(",")}
            </Text>
          )}
        </Box>
      </Box>
    </Link>
  );
};
