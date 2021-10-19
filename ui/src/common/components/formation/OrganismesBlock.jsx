import React, { useEffect, useState } from "react";
import { Badge, Box, Flex, Heading, Link, Text } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import { ArrowRightLine } from "../../../theme/components/icons";
import { getOrganisme } from "../../api/organisme";

export const OrganismesBlock = ({ formation }) => {
  const oneEstablishment = formation.etablissement_gestionnaire_siret === formation.etablissement_formateur_siret;

  const [tagsFormateur, setTagsFormateur] = useState([]);
  const [tagsGestionnaire, setTagsGestionnaire] = useState([]);

  useEffect(() => {
    async function run() {
      if (formation.etablissement_formateur_id) {
        const formateur = await getOrganisme({ id: formation.etablissement_formateur_id });
        setTagsFormateur(formateur?.tags ?? []);
      }

      if (!oneEstablishment) {
        const gestionnaire = await getOrganisme({ id: formation.etablissement_gestionnaire_id });
        setTagsGestionnaire(gestionnaire.tags ?? []);
      }
    }

    run();
  }, [oneEstablishment, formation, setTagsFormateur, setTagsGestionnaire]);

  return (
    <>
      <Heading textStyle="h4" color="grey.800" mb={4}>
        Organisme(s) associé(s)
      </Heading>

      {!oneEstablishment && (
        <>
          <Text textStyle="rf-text" color="grey.700" fontWeight="700" mb={3}>
            Gestionnaire
          </Text>
          <Link as={NavLink} to={`/etablissement/${formation.etablissement_gestionnaire_id}`} variant="card">
            <Flex display={["none", "flex"]} textStyle="xs" justifyContent="space-between">
              <Text>Siret : {formation.etablissement_gestionnaire_siret}</Text>
              <Text>UAI : {formation.etablissement_gestionnaire_uai}</Text>
            </Flex>
            <Heading textStyle="h6" color="grey.800" mt={2}>
              {formation.etablissement_gestionnaire_entreprise_raison_sociale}
            </Heading>
            <Box>
              <Text textStyle="sm">Académie : {formation.etablissement_gestionnaire_nom_academie}</Text>
              <Box>
                <Flex justifyContent={"space-between"}>
                  <Box>
                    {tagsGestionnaire &&
                      tagsGestionnaire
                        .sort((a, b) => a - b)
                        .map((tag, i) => (
                          <Badge data-testid={"tags-gestionnaire"} variant="year" mr="10px" mt={3} key={i}>
                            {tag}
                          </Badge>
                        ))}
                  </Box>
                  <ArrowRightLine alignSelf="center" color="bluefrance" />
                </Flex>
              </Box>
            </Box>
          </Link>
        </>
      )}

      {!oneEstablishment && formation.etablissement_formateur_id && (
        <Text textStyle="rf-text" color="grey.700" fontWeight="700" my={5}>
          Formateur
        </Text>
      )}

      {formation.etablissement_formateur_id && (
        <Link as={NavLink} to={`/etablissement/${formation.etablissement_formateur_id}`} variant="card">
          <Flex display={["none", "flex"]} textStyle="xs" justifyContent="space-between">
            <Text>Siret : {formation.etablissement_formateur_siret}</Text>
            <Text>UAI: {formation.etablissement_formateur_uai}</Text>
          </Flex>
          <Heading textStyle="h6" color="grey.800" mt={2}>
            {formation.etablissement_formateur_entreprise_raison_sociale}
          </Heading>
          <Box>
            <Text textStyle="sm">Académie : {formation.etablissement_formateur_nom_academie}</Text>
            <Box>
              <Flex justifyContent={"space-between"}>
                <Box>
                  {tagsFormateur &&
                    tagsFormateur
                      .sort((a, b) => a - b)
                      .map((tag, i) => (
                        <Badge variant="year" mr="10px" mt={3} key={i}>
                          {tag}
                        </Badge>
                      ))}
                </Box>
                <ArrowRightLine alignSelf="center" color="bluefrance" />
              </Flex>
            </Box>
          </Box>
        </Link>
      )}
    </>
  );
};