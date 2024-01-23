import React from "react";
import { NavLink } from "react-router-dom";
import { hasAccessTo } from "../../../../utils/rolesUtils";
import useAuth from "../../../../hooks/useAuth";
import { StatusBadge } from "../../../StatusBadge";
import { Box, Flex, Link, Text } from "@chakra-ui/react";
import { ArrowRightLine, InfoCircle } from "../../../../../theme/components/icons";
import { QualiteBadge } from "../../../QualiteBadge";
import { HabiliteBadge } from "../../../HabiliteBadge";
import { ActifBadge } from "../../../ActifBadge";
import { DureeBadge } from "../../../DureeBadge";
import { AnneeBadge } from "../../../AnneeBadge";
import { AFFELNET_STATUS, PARCOURSUP_STATUS } from "../../../../../constants/status";

export const CardListFormation = ({ data }) => {
  const [user] = useAuth();

  return (
    <Link as={NavLink} to={`/formation/${data._id}`} variant="card" mt={4} data-testid={"card_formation"}>
      <Flex display={["none", "flex"]} textStyle="xs" justifyContent="space-between">
        <Text>{data.etablissement_gestionnaire_entreprise_raison_sociale}</Text>
        <Text>CFD : {data.cfd}</Text>
      </Flex>
      <Text textStyle="h6" color="grey.800" mt={2}>
        {data.intitule_long}
      </Text>
      <Box>
        <Text textStyle="sm">
          {data.lieu_formation_adresse}, {data.code_postal} {data.localite}
        </Text>
        <Text textStyle="sm">Académie : {data.nom_academie}</Text>
        <Box>
          <Flex justifyContent="space-between">
            <Flex mt={1} flexWrap={"wrap"}>
              {data.catalogue_published && (
                <>
                  {hasAccessTo(user, "page_catalogue/voir_status_publication_ps") &&
                    (data.parcoursup_perimetre ||
                      data.parcoursup_statut !== PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT) && (
                      <>
                        <StatusBadge source="Parcoursup" status={data.parcoursup_statut} mr={[0, 3]} />
                      </>
                    )}
                  {hasAccessTo(user, "page_catalogue/voir_status_publication_aff") &&
                    (data.affelnet_perimetre || data.affelnet_statut !== AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT) && (
                      <>
                        <StatusBadge source="Affelnet" status={data.affelnet_statut} mr={[0, 3]} />
                      </>
                    )}

                  {!data.affelnet_perimetre &&
                    !data.parcoursup_perimetre &&
                    data.affelnet_statut === AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT &&
                    data.parcoursup_statut === PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT && (
                      <>
                        {hasAccessTo(user, "page_formation/voir_status_publication_aff") && (
                          <StatusBadge mr={[0, 3]} text={"Affelnet - hors périmètre"} />
                        )}

                        {hasAccessTo(user, "page_formation/voir_status_publication_ps") && (
                          <StatusBadge mr={[0, 3]} text={"Parcoursup - hors périmètre"} />
                        )}
                      </>
                    )}
                </>
              )}
              {!data.catalogue_published && (
                <>
                  <QualiteBadge value={data.etablissement_gestionnaire_certifie_qualite} mt={2} mr={[0, 2]} />
                  {data.etablissement_reference_habilite_rncp !== null && (
                    <HabiliteBadge value={data.etablissement_reference_habilite_rncp} mt={2} mr={[0, 2]} />
                  )}
                  <ActifBadge value={data.siret_actif} mt={2} mr={[0, 2]} />
                  <DureeBadge value={data.duree} mt={2} mr={[0, 2]} />
                  <AnneeBadge value={data.annee} mt={2} mr={[0, 2]} />
                </>
              )}
            </Flex>
            <ArrowRightLine alignSelf="center" color="bluefrance" boxSize={4} />
          </Flex>
          <Flex justifyContent="space-between">
            {data.ids_action?.length > 0 && (
              <Text textStyle="xs" mt={4}>
                identifiant actions Carif-Oref: {data.ids_action.join(",")}
              </Text>
            )}
          </Flex>
        </Box>
      </Box>
    </Link>
  );
};
