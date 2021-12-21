import React from "react";
import { Box, Heading, Link, ListItem, Text, UnorderedList } from "@chakra-ui/react";
import { ExternalLinkLine } from "../../../theme/components/icons";
import InfoTooltip from "../InfoTooltip";
import helpText from "../../../locales/helpText.json";
import { FormationPeriode } from "./FormationPeriode";
import { HabilitationPartenaire } from "./HabilitationPartenaire";
import { HABILITE_LIST } from "../../../constants/certificateurs";

export const DescriptionBlock = ({ formation, pendingFormation }) => {
  const displayedFormation = pendingFormation ?? formation;

  const filteredPartenaires = (displayedFormation.rncp_details?.partenaires ?? []).filter(({ Siret_Partenaire }) =>
    [formation.etablissement_gestionnaire_siret, formation.etablissement_formateur_siret].includes(Siret_Partenaire)
  );
  const showPartenaires =
    ["Titre", "TP"].includes(displayedFormation.rncp_details?.code_type_certif) &&
    !(displayedFormation.rncp_details.certificateurs ?? []).some(({ certificateur }) =>
      HABILITE_LIST.includes(certificateur)
    );

  return (
    <>
      <Box mb={16} pt={8}>
        <Heading textStyle="h4" color="grey.800" px={8}>
          Description
        </Heading>
        {formation.onisep_url !== "" && formation.onisep_url !== null && (
          <Box mt={2} mb={4} px={5}>
            <Link href={formation.onisep_url} mt={3} variant="pill" textStyle="rf-text" isExternal>
              voir la fiche descriptive Onisep <ExternalLinkLine w={"0.75rem"} h={"0.75rem"} mb={"0.125rem"} />
            </Link>
          </Box>
        )}

        <Box px={8}>
          <Text mb={4} mt={4}>
            Intitulé court de la formation :{" "}
            <Text as="span" variant="highlight">
              {displayedFormation.intitule_court}
            </Text>{" "}
            <InfoTooltip description={helpText.formation.intitule_court} />
          </Text>
          <Text mb={4} mt={4}>
            Intitulé éditorial :{" "}
            <Text as="span" variant="highlight">
              {displayedFormation.onisep_intitule}
            </Text>{" "}
            <InfoTooltip description={helpText.formation.onisep_intitule} />
          </Text>
          <Text mb={4}>
            Diplôme ou titre visé :{" "}
            <Text as="span" variant="highlight">
              {displayedFormation.diplome}
            </Text>{" "}
            <InfoTooltip description={helpText.formation.diplome} />
          </Text>
          <Text mb={4}>
            Niveau de la formation :{" "}
            <Text as="span" variant="highlight">
              {displayedFormation.niveau}
            </Text>{" "}
            <InfoTooltip description={helpText.formation.niveau} />
          </Text>
          <Text mb={4}>
            Code diplôme (Éducation Nationale) :{" "}
            <Text as="span" variant="highlight">
              {displayedFormation.cfd}
            </Text>{" "}
            <InfoTooltip description={helpText.formation.cfd} />
            {displayedFormation.cfd_outdated && (
              <>
                <br />
                Ce diplôme a une date de fin antérieure au 31/08 de l'année en cours
              </>
            )}
          </Text>
          <Text mb={4}>
            Codes MEF 10 caractères :{" "}
            <Text as="span" variant="highlight">
              {displayedFormation?.bcn_mefs_10?.map(({ mef10 }) => mef10).join(", ")}
            </Text>{" "}
            <InfoTooltip description={helpText.formation.mef} />
          </Text>
          {displayedFormation?.affelnet_mefs_10?.length > 0 && (
            <>
              <Text mb={4}>
                Codes MEF 10 caractères dans le périmètre <i>Affelnet</i> :{" "}
                <Text as="span" variant="highlight">
                  {displayedFormation?.affelnet_mefs_10?.map(({ mef10 }) => mef10).join(", ")}
                </Text>
              </Text>
              {formation?.affelnet_infos_offre && (
                <Text mb={4}>
                  Informations offre de formation <i>Affelnet</i> :{" "}
                  <Text as="span" variant="highlight">
                    {formation?.affelnet_infos_offre}
                  </Text>
                </Text>
              )}
            </>
          )}
          {displayedFormation?.parcoursup_mefs_10?.length > 0 && (
            <Text mb={4}>
              Codes MEF 10 caractères dans le périmètre <i>Parcoursup</i> :{" "}
              <Text as="span" variant="highlight">
                {displayedFormation?.parcoursup_mefs_10?.map(({ mef10 }) => mef10).join(", ")}
              </Text>
            </Text>
          )}
          <Text mb={4}>
            Période d'inscription :
            <FormationPeriode periode={displayedFormation.periode} />{" "}
            <InfoTooltip description={helpText.formation.periode} />
          </Text>
          <Text mb={4}>
            Capacite d'accueil :{" "}
            <Text as="span" variant="highlight">
              {formation.capacite ?? "N/A"}
            </Text>{" "}
            <InfoTooltip ml="10px" description={helpText.formation.capacite} />
          </Text>
          <Text mb={4}>
            Durée de la formation :{" "}
            <Text as="span" variant="highlight">
              {displayedFormation.duree ?? "N/A"}
            </Text>{" "}
            <InfoTooltip description={helpText.formation.duree} />
          </Text>
          <Text mb={4}>
            Année :{" "}
            <Text as="span" variant="highlight">
              {displayedFormation.annee ?? "N/A"}
            </Text>{" "}
            <InfoTooltip description={helpText.formation.annee} />
          </Text>
          <Text mb={4}>
            Clé ministères éducatifs:
            <Text as="span" variant="highlight">
              {displayedFormation.cle_ministere_educatif ?? "N/A"}
            </Text>
          </Text>
          <Text mb={4}>
            Identifiant formation Carif Oref:
            <Text as="span" variant="highlight">
              {displayedFormation.id_formation ?? "N/A"}
            </Text>
          </Text>
          <Text mb={4}>
            Identifiant actions Carif Oref:
            <Text as="span" variant="highlight">
              {displayedFormation.ids_action?.join(",") ?? "N/A"}
            </Text>
          </Text>
          <Text mb={4}>
            Code Certif Info:
            <Text as="span" variant="highlight">
              {displayedFormation.id_certifinfo ?? "N/A"}
            </Text>
          </Text>
        </Box>
      </Box>
      <Box mb={16} px={8}>
        <Heading textStyle="h4" color="grey.800" mb={4} mt={6}>
          Informations RNCP et ROME
        </Heading>
        {displayedFormation.rncp_code && (
          <Text mb={4}>
            Code RNCP :{" "}
            <Text as="span" variant="highlight">
              {displayedFormation.rncp_code}
            </Text>{" "}
            <InfoTooltip description={helpText.formation.rncp_code} />
          </Text>
        )}
        <Text mb={4}>
          Intitulé RNCP :{" "}
          <Text as="span" variant="highlight">
            {displayedFormation.rncp_intitule}
          </Text>{" "}
          <InfoTooltip description={helpText.formation.rncp_intitule} />
        </Text>
        <Text mb={4}>
          Codes ROME :{" "}
          <Text as="span" variant="highlight">
            {displayedFormation.rome_codes.join(", ")}
          </Text>{" "}
          <InfoTooltip description={helpText.formation.rome_codes} />
        </Text>
        <Box>
          {displayedFormation.opcos && displayedFormation.opcos.length === 0 && <Text mb={4}>Aucun OPCO rattaché</Text>}
          {displayedFormation.opcos && displayedFormation.opcos.length > 0 && (
            <Text mb={4}>
              OPCOs liés à la formation :{" "}
              <Text as="span" variant="highlight">
                {displayedFormation.opcos.join(", ")}
              </Text>
            </Text>
          )}
        </Box>
        {displayedFormation.rncp_details && (
          <>
            <Text mb={4}>
              Certificateurs :{" "}
              <Text as="span" variant="highlight">
                {displayedFormation.rncp_details.certificateurs
                  ?.filter(({ certificateur }) => certificateur)
                  ?.map(({ certificateur }) => certificateur)
                  .join(", ")}
              </Text>{" "}
              <InfoTooltip description={helpText.formation.certificateurs} />
            </Text>
            <Text mb={4}>
              SIRET Certificateurs :{" "}
              <Text as="span" variant="highlight">
                {displayedFormation.rncp_details.certificateurs
                  ?.filter(({ siret_certificateur }) => siret_certificateur)
                  ?.map(({ siret_certificateur }) => siret_certificateur)
                  .join(", ")}
              </Text>{" "}
              <InfoTooltip description={helpText.formation.siret_certificateurs} />
            </Text>
            {showPartenaires && (
              <Text as="div" mb={4}>
                Partenaires : <br />
                {filteredPartenaires.length > 0 ? (
                  <>
                    <UnorderedList>
                      {filteredPartenaires.map(({ Nom_Partenaire, Siret_Partenaire, Habilitation_Partenaire }) => (
                        <ListItem key={Siret_Partenaire}>
                          <strong>
                            {Nom_Partenaire} (siret : {Siret_Partenaire ?? "n/a"}) :
                          </strong>
                          <HabilitationPartenaire habilitation={Habilitation_Partenaire} />
                        </ListItem>
                      ))}
                    </UnorderedList>
                  </>
                ) : (
                  <>
                    Aucune habilitation sur la fiche pour ce SIRET.
                    <br />
                    SIRET formateur : {formation.etablissement_formateur_siret}, SIRET gestionnaire :
                    {formation.etablissement_gestionnaire_siret}.
                  </>
                )}
              </Text>
            )}
          </>
        )}
      </Box>
    </>
  );
};
