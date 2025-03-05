import React from "react";
import { NavLink } from "react-router-dom";
import { hasAccessTo } from "../../../../utils/rolesUtils";
import useAuth from "../../../../hooks/useAuth";
import { PreviousStatusBadge, StatusBadge } from "../../../StatusBadge";
import { Box, Flex, Link, Text } from "@chakra-ui/react";
import { ArrowRightLine } from "../../../../../theme/components/icons";
import { QualiteBadge } from "../../../QualiteBadge";
import { HabiliteBadge } from "../../../HabiliteBadge";
import { ActifBadge } from "../../../ActifBadge";
import { DureeBadge } from "../../../DureeBadge";
import { AnneeBadge } from "../../../AnneeBadge";
import { AFFELNET_STATUS, PARCOURSUP_STATUS } from "../../../../../constants/status";

export const CardListFormation = ({ data }) => {
  const [user] = useAuth();

  return (
    <Link
      as={NavLink}
      to={`/formation/${encodeURIComponent(data.cle_ministere_educatif)}`}
      variant="card"
      mt={4}
      data-testid={"card_formation"}
    >
      {data.etablissement_gestionnaire_id === data.etablissement_formateur_id ? (
        <>
          <Flex display={["none", "flex"]} textStyle="xs" justifyContent="space-between">
            <Text>Responsable/Formateur: {data.etablissement_gestionnaire_raison_sociale_enseigne}</Text>
          </Flex>
        </>
      ) : (
        <>
          <Flex display={["none", "flex"]} textStyle="xs">
            <Text>
              Responsable: {data.etablissement_gestionnaire_raison_sociale_enseigne} / Formateur:{" "}
              {data.etablissement_formateur_raison_sociale_enseigne}
            </Text>
          </Flex>
        </>
      )}

      <Text textStyle="h6" color="grey.800" mt={2}>
        {data.intitule_long} {data.cle_ministere_educatif.includes("#LAD") && " (100% à distance)"}
      </Text>
      <Box>
        <Text textStyle="sm" mt={2}>
          Lieu: {data.lieu_formation_adresse}, {data.code_postal} {data.localite} (UAI:{" "}
          {data.uai_formation ?? "inconnu"}) - Académie: {data.nom_academie}
        </Text>
        <Box mt={2}>
          <Flex justifyContent="space-between">
            <Flex mt={1} gap={2} wrap={"wrap"}>
              {data.catalogue_published && (
                <>
                  {hasAccessTo(user, "page_formation/voir_status_publication_ps") &&
                    (data.parcoursup_perimetre ||
                      data.parcoursup_statut !== PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT) && (
                      <>
                        <StatusBadge source="Parcoursup" status={data.parcoursup_statut} />

                        <PreviousStatusBadge
                          source="Parcoursup"
                          status={data.parcoursup_previous_statut}
                          created_at={data.created_at}
                        />
                      </>
                    )}
                  {hasAccessTo(user, "page_formation/voir_status_publication_aff") &&
                    (data.affelnet_perimetre || data.affelnet_statut !== AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT) && (
                      <>
                        <StatusBadge source="Affelnet" status={data.affelnet_statut} />

                        <PreviousStatusBadge
                          source="Affelnet"
                          status={data.affelnet_previous_statut}
                          created_at={data.created_at}
                        />
                      </>
                    )}

                  {!data.affelnet_perimetre &&
                    !data.parcoursup_perimetre &&
                    data.affelnet_statut === AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT &&
                    data.parcoursup_statut === PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT && (
                      <>
                        {hasAccessTo(user, "page_formation/voir_status_publication_aff") && (
                          <StatusBadge source="Affelnet" status="hors périmètre" />
                        )}

                        {hasAccessTo(user, "page_formation/voir_status_publication_ps") && (
                          <StatusBadge source="Parcoursup" status="hors périmètre" />
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
          </Flex>
          <Flex mt={4} justifyContent="space-between">
            <Text textStyle="xs">
              CFD: {data.cfd ?? "N/A"} - MEF:{" "}
              {!!data.bcn_mefs_10.length ? data.bcn_mefs_10?.map((mef) => mef.mef10)?.join(", ") : "N/A"} -{" "}
              {data.rncp_code ?? "N/A"}
            </Text>

            <ArrowRightLine alignSelf="center" color="bluefrance" boxSize={4} />
          </Flex>

          {/* <Flex justifyContent="space-between">
            {data.ids_action?.length > 0 && (
              <Text textStyle="xs" mt={4}>
                identifiant actions Carif-Oref: {data.ids_action.join(",")}
              </Text>
            )}
          </Flex> */}
        </Box>
      </Box>
    </Link>
  );
};
