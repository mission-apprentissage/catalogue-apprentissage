import React, { useEffect, useState } from "react";
import { Badge, Box, Flex, Link, Text } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import { ArrowRightLine } from "../../../theme/components/icons";
import { getOrganisme } from "../../api/organisme";
import { QualiteBadge } from "../QualiteBadge";
import { HabiliteBadge } from "../HabiliteBadge";
import { ActifBadge } from "../ActifBadge";

export const OrganismesBlock = ({ formation }) => {
  const oneEstablishment = formation.etablissement_gestionnaire_siret === formation.etablissement_formateur_siret;

  const [tagsFormateur, setTagsFormateur] = useState([]);
  const [tagsGestionnaire, setTagsGestionnaire] = useState([]);

  useEffect(() => {
    const abortController = new AbortController();
    async function run() {
      if (formation.etablissement_formateur_id) {
        const formateur = await getOrganisme(formation.etablissement_formateur_siret, {
          signal: abortController.signal,
        });
        setTagsFormateur(formateur?.tags ?? []);
      }

      if (!oneEstablishment) {
        const gestionnaire = await getOrganisme(formation.etablissement_gestionnaire_siret, {
          signal: abortController.signal,
        });
        setTagsGestionnaire(gestionnaire.tags ?? []);
      }
    }

    run();

    return () => {
      abortController.abort();
    };
  }, [oneEstablishment, formation, setTagsFormateur, setTagsGestionnaire]);

  return (
    <>
      {oneEstablishment && (
        <Text textStyle="h4" color="grey.800" mt={8} mb={4}>
          Organisme responsable et formateur
        </Text>
      )}

      {!oneEstablishment && (
        <>
          <Text textStyle="h4" color="grey.800" mt={8} mb={4}>
            Organisme responsable
          </Text>
          <Link
            as={NavLink}
            to={`/etablissement/${encodeURIComponent(formation.etablissement_gestionnaire_siret)}`}
            variant="card"
          >
            <Flex display={["none", "flex"]} textStyle="xs" justifyContent="space-between">
              <Text>Siret : {formation.etablissement_gestionnaire_siret}</Text>
              <Text>UAI : {formation.etablissement_gestionnaire_uai}</Text>
            </Flex>
            <Box my={2}>
              <Flex>
                <QualiteBadge value={formation.etablissement_gestionnaire_certifie_qualite} m="0" mr={[0, 2]} />
                {!formation.catalogue_published && formation.etablissement_reference_habilite_rncp !== null && (
                  <HabiliteBadge value={formation.etablissement_gestionnaire_habilite_rncp} m="0" mr={[0, 2]} />
                )}
                <ActifBadge value={formation.etablissement_gestionnaire_actif} m="0" mr={[0, 2]} />
              </Flex>
            </Box>
            <Box textStyle="h6" color="grey.800" my={1}>
              {formation.etablissement_gestionnaire_entreprise_raison_sociale}{" "}
              {!!formation.etablissement_gestionnaire_enseigne?.length &&
                formation.etablissement_gestionnaire_enseigne !==
                  formation.etablissement_gestionnaire_entreprise_raison_sociale && (
                  <>({formation.etablissement_gestionnaire_enseigne})</>
                )}
            </Box>
            <Box textStyle="sm" my={1}>
              {formation.etablissement_gestionnaire_adresse} {formation.etablissement_gestionnaire_code_postal}{" "}
              {formation.etablissement_gestionnaire_localite} (code commune:{" "}
              {formation.etablissement_gestionnaire_code_commune_insee})
            </Box>

            <Box my={1}>
              <Text textStyle="sm">Académie : {formation.etablissement_gestionnaire_nom_academie}</Text>
              <Box>
                <Flex justifyContent={"space-between"}>
                  <Box>
                    {tagsGestionnaire &&
                      tagsGestionnaire
                        .sort((a, b) => a - b)
                        .map((tag, i) => (
                          <Badge data-testid={"tags-gestionnaire"} variant="year" key={i}>
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
        <Text textStyle="h4" color="grey.800" mt={8} mb={4}>
          Organisme formateur
        </Text>
      )}

      {formation.etablissement_formateur_id && (
        <Link
          as={NavLink}
          to={`/etablissement/${encodeURIComponent(formation.etablissement_formateur_siret)}`}
          variant="card"
        >
          <Flex display={["none", "flex"]} textStyle="xs" justifyContent="space-between">
            <Text>Siret : {formation.etablissement_formateur_siret}</Text>
            <Text>UAI: {formation.etablissement_formateur_uai}</Text>
          </Flex>
          <Box my={2}>
            <Flex>
              {!(
                formation.etablissement_gestionnaire_certifie_qualite &&
                !formation.etablissement_formateur_certifie_qualite
              ) && <QualiteBadge value={formation.etablissement_formateur_certifie_qualite} m="0" mr={[0, 2]} />}
              {!formation.catalogue_published && formation.etablissement_reference_habilite_rncp !== null && (
                <HabiliteBadge value={formation.etablissement_formateur_habilite_rncp} m="0" mr={[0, 2]} />
              )}
              <ActifBadge value={formation.etablissement_formateur_actif} m="0" mr={[0, 2]} />
            </Flex>
          </Box>
          <Text textStyle="h6" color="grey.800" my={1}>
            {formation.etablissement_formateur_entreprise_raison_sociale}{" "}
            {!!formation.etablissement_formateur_enseigne?.length &&
              formation.etablissement_formateur_enseigne !==
                formation.etablissement_formateur_entreprise_raison_sociale && (
                <>({formation.etablissement_formateur_enseigne})</>
              )}
          </Text>

          <Box textStyle="sm" my={1}>
            {formation.etablissement_formateur_adresse} {formation.etablissement_formateur_code_postal}{" "}
            {formation.etablissement_formateur_localite} (code commune:{" "}
            {formation.etablissement_formateur_code_commune_insee})
          </Box>

          <Box>
            <Text textStyle="sm">Académie : {formation.etablissement_formateur_nom_academie}</Text>
            <Box>
              <Flex justifyContent={"space-between"}>
                <Box>
                  {tagsFormateur &&
                    tagsFormateur
                      .sort((a, b) => a - b)
                      .map((tag, i) => (
                        <Badge variant="year" mt={3} key={i}>
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
