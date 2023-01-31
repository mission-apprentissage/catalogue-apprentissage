import React from "react";
import { Box, Heading, Link, ListItem, Text, UnorderedList } from "@chakra-ui/react";
import { ExternalLinkLine } from "../../../theme/components/icons";
import { DangerBox } from "../DangerBox";
import InfoTooltip from "../InfoTooltip";
import helpText from "../../../locales/helpText.json";
// import { FormationPeriode } from "./FormationPeriode";
import { FormationDate } from "./FormationDate";
import { HabilitationPartenaire } from "./HabilitationPartenaire";
import { HABILITE_LIST } from "../../../constants/certificateurs";
import { EllipsisText } from "../EllipsisText";
import { getExpirationDate } from "../../utils/rulesUtils";

const DureeAnnee = ({ value }) => {
  if (!value) {
    return "N/A";
  }

  const tmpValue = value === "X" ? "Information non collectée" : value;
  return tmpValue === "9" ? "Sans objet (code BCN: 9)" : tmpValue;
};

export const DescriptionBlock = ({ formation }) => {
  const filteredPartenaires = (formation.rncp_details?.partenaires ?? []).filter(({ Siret_Partenaire }) =>
    [formation.etablissement_gestionnaire_siret, formation.etablissement_formateur_siret].includes(Siret_Partenaire)
  );

  const isTitreRNCP = formation.etablissement_reference_habilite_rncp !== null;

  const showPartenaires =
    isTitreRNCP &&
    !(formation.rncp_details.certificateurs ?? []).some(({ certificateur }) => HABILITE_LIST.includes(certificateur));

  const MefContainer =
    formation.duree_incoherente || formation.annee_incoherente
      ? (args) => <DangerBox data-testid={"mef-warning"} {...args} />
      : React.Fragment;

  const DureeContainer = formation.duree_incoherente
    ? (args) => <DangerBox data-testid={"duree-warning"} {...args} />
    : React.Fragment;

  const AnneeContainer = formation.annee_incoherente
    ? (args) => <DangerBox data-testid={"annee-warning"} {...args} />
    : React.Fragment;

  const isCfdExpired =
    formation.cfd_outdated ||
    (formation.cfd_date_fermeture && new Date(formation.cfd_date_fermeture) <= getExpirationDate());

  const CfdContainer =
    !isTitreRNCP &&
    (formation.cfd_outdated ||
      (formation.cfd_date_fermeture && new Date(formation.cfd_date_fermeture) <= getExpirationDate()))
      ? (args) => <DangerBox data-testid={"cfd-warning"} {...args} />
      : React.Fragment;

  const isRncpExpired =
    formation.rncp_details?.rncp_outdated ||
    (formation.rncp_details?.date_fin_validite_enregistrement &&
      new Date(formation.rncp_details?.date_fin_validite_enregistrement) <= getExpirationDate());

  const RncpContainer =
    isTitreRNCP && isRncpExpired ? (args) => <DangerBox data-testid={"rncp-warning"} {...args} /> : React.Fragment;

  const siretCertificateurs =
    formation.rncp_details.certificateurs?.map(({ siret_certificateur }) => siret_certificateur) ?? [];

  // Problème d'habilitation si le siret formateur ou gestionnaire n'est pas dans la liste des sirets certificateurs
  const noHabilitation = !(
    siretCertificateurs.includes(formation.etablissement_formateur_siret) ||
    siretCertificateurs.includes(formation.etablissement_gestionnaire_siret)
  );

  return (
    <>
      <Box p={8}>
        <Heading textStyle="h4" color="grey.800">
          Description
        </Heading>
        {formation.onisep_url !== "" && formation.onisep_url !== null && (
          <Box mt={2} mb={4} ml={-3}>
            <Link href={formation.onisep_url} mt={3} variant="pill" textStyle="rf-text" isExternal>
              voir la fiche descriptive Onisep <ExternalLinkLine w={"0.75rem"} h={"0.75rem"} mb={"0.125rem"} />
            </Link>
          </Box>
        )}

        <Box>
          <Text mb={4} mt={4}>
            Intitulé court de la formation :{" "}
            <Text as="span" variant="highlight">
              {formation.intitule_court}
            </Text>{" "}
            <InfoTooltip description={helpText.formation.intitule_court} />
          </Text>

          <Text mb={4} mt={4}>
            Libellé Carif-Oref :{" "}
            <Text as="span" variant="highlight">
              {formation.intitule_rco}
            </Text>{" "}
            <InfoTooltip description={helpText.formation.intitule_rco} />
          </Text>
          <Text mb={4} mt={4}>
            Intitulé Onisep :{" "}
            <Text as="span" variant="highlight">
              {formation.onisep_intitule}
            </Text>
          </Text>
          <Text mb={4}>
            Diplôme ou titre visé :{" "}
            <Text as="span" variant="highlight">
              {formation.diplome}
            </Text>{" "}
            <InfoTooltip description={helpText.formation.diplome} />
          </Text>
          <Text mb={4}>
            Niveau de la formation :{" "}
            <Text as="span" variant="highlight">
              {formation.niveau}
            </Text>{" "}
            <InfoTooltip description={helpText.formation.niveau} />
          </Text>
          <CfdContainer>
            <Text mb={!isTitreRNCP && isCfdExpired ? 0 : 4}>
              Code diplôme (Éducation Nationale) :{" "}
              <Text as="span" variant="highlight">
                {formation.cfd}
              </Text>{" "}
              <InfoTooltip description={helpText.formation.cfd} />
            </Text>
            {!isTitreRNCP && isCfdExpired && (
              <Text variant={"unstyled"} fontSize={"zeta"} fontStyle={"italic"} color={"grey.600"}>
                {formation?.cfd_date_fermeture ? (
                  <>
                    Ce code formation diplôme expire le{" "}
                    {new Date(formation?.cfd_date_fermeture).toLocaleDateString("fr-FR")}
                  </>
                ) : (
                  <>Ce code formation diplôme est expiré</>
                )}
              </Text>
            )}
          </CfdContainer>
          <MefContainer>
            <Text mb={formation.duree_incoherente || formation.annee_incoherente ? 0 : 4}>
              Codes MEF 10 caractères :{" "}
              <Text as="span" variant="highlight">
                {formation?.bcn_mefs_10?.map(({ mef10 }) => mef10).join(", ")}
              </Text>{" "}
              <InfoTooltip description={helpText.formation.mef} />
            </Text>
            <Text variant={"unstyled"} fontSize={"zeta"} fontStyle={"italic"} color={"grey.600"}>
              {(formation.duree_incoherente || formation.annee_incoherente) &&
                "Aucun code MEF ne correspond à la durée et à l'année de formation enregistrées auprès du Carif-Oref."}
            </Text>
          </MefContainer>
          {formation?.affelnet_mefs_10?.length > 0 && (
            <>
              <Text mb={4}>
                Codes MEF 10 caractères dans le périmètre <i>Affelnet</i> :{" "}
                <Text as="span" variant="highlight">
                  {formation?.affelnet_mefs_10?.map(({ mef10 }) => mef10).join(", ")}
                </Text>
              </Text>

              {formation?.affelnet_infos_offre && (
                <Text mb={4}>
                  Informations offre de formation <i>Affelnet</i> :{" "}
                  <EllipsisText as="span" variant="highlight">
                    {formation?.affelnet_infos_offre}
                  </EllipsisText>{" "}
                  <InfoTooltip description={helpText.formation.affelnet_publish_fields} />
                </Text>
              )}
              {formation?.affelnet_url_infos_offre && (
                <Text mb={4}>
                  Informations offre de formation <i>Affelnet</i> (lien) :{" "}
                  <Text as="span" variant="highlight">
                    <Link rel="noreferrer noopener" target="_blank" href={formation?.affelnet_url_infos_offre}>
                      {formation?.affelnet_url_infos_offre}
                    </Link>
                  </Text>{" "}
                  <InfoTooltip description={helpText.formation.affelnet_publish_fields} />
                </Text>
              )}
              {formation?.affelnet_modalites_offre && (
                <Text mb={4}>
                  Modalités particulières <i>Affelnet</i> :{" "}
                  <EllipsisText as="span" variant="highlight">
                    {formation?.affelnet_modalites_offre}
                  </EllipsisText>{" "}
                  <InfoTooltip description={helpText.formation.affelnet_publish_fields} />
                </Text>
              )}
              {formation?.affelnet_url_modalites_offre && (
                <Text mb={4}>
                  Modalités particulières <i>Affelnet</i> (lien) :{" "}
                  <Text as="span" variant="highlight">
                    <Link rel="noreferrer noopener" target="_blank" href={formation?.affelnet_url_modalites_offre}>
                      {formation?.affelnet_url_modalites_offre}
                    </Link>
                  </Text>{" "}
                  <InfoTooltip description={helpText.formation.affelnet_publish_fields} />
                </Text>
              )}
            </>
          )}

          {formation?.parcoursup_mefs_10?.length > 0 && (
            <Text mb={4}>
              Codes MEF 10 caractères dans le périmètre <i>Parcoursup</i> :{" "}
              <Text as="span" variant="highlight">
                {formation?.parcoursup_mefs_10?.map(({ mef10 }) => mef10).join(", ")}
              </Text>
            </Text>
          )}
          {/* <Text mb={4}>
            Période d'inscription : <FormationPeriode periode={formation.periode} />{" "}
            <InfoTooltip description={helpText.formation.periode} />
          </Text> */}
          <Text mb={4}>
            Dates de formation : <FormationDate formation={formation} />{" "}
            <InfoTooltip description={helpText.formation.dates} />
          </Text>
          <Text mb={4}>
            Capacite d'accueil :{" "}
            <Text as="span" variant="highlight">
              {formation.capacite ?? "N/A"}
            </Text>{" "}
            <InfoTooltip ml="10px" description={helpText.formation.capacite} />
          </Text>
          <DureeContainer>
            <Text mb={formation.duree_incoherente ? 0 : 4}>
              Durée de la formation :{" "}
              <Text as="span" variant="highlight">
                <DureeAnnee value={formation.duree} />
              </Text>{" "}
              <InfoTooltip description={helpText.formation.duree} />
            </Text>
            <Text variant={"unstyled"} fontSize={"zeta"} fontStyle={"italic"} color={"grey.600"}>
              {formation.duree_incoherente &&
                "La durée de formation enregistrée auprès du Carif-Oref ne correspond pas à celle qui est déduite du code MEF correspondant à cette formation."}
            </Text>
          </DureeContainer>

          {formation.annee === "X" && (
            <Box
              bg={"orangesoft.200"}
              p={4}
              mb={formation.annee_incoherente ? 0 : 4}
              borderLeft={"4px solid"}
              borderColor={"orangesoft.500"}
              w={"full"}
            >
              <Text>
                Année d'entrée en apprentissage :{" "}
                <Text as="span" variant="highlight" bg={"transparent"}>
                  <DureeAnnee value={formation.annee} />
                </Text>{" "}
                <InfoTooltip description={helpText.formation.annee} />
              </Text>
            </Box>
          )}
          {formation.annee !== "X" && (
            <AnneeContainer>
              <Text mb={formation.annee_incoherente ? 0 : 4}>
                Année d'entrée en apprentissage :{" "}
                <Text as="span" variant="highlight">
                  <DureeAnnee value={formation.annee} />
                </Text>{" "}
                <InfoTooltip description={helpText.formation.annee} />
              </Text>
              <Text variant={"unstyled"} fontSize={"zeta"} fontStyle={"italic"} color={"grey.600"}>
                {formation.annee_incoherente &&
                  "L'année de formation enregistrée auprès du Carif-Oref ne correspond pas à celle qui est déduite du code MEF correspondant à cette formation."}
              </Text>
            </AnneeContainer>
          )}
          <Text mb={4}>
            Clé ministères éducatifs :{" "}
            <Text as="span" variant="highlight">
              {formation.cle_ministere_educatif ?? "N/A"}
            </Text>
          </Text>
          {formation.parcoursup_id && (
            <Text mb={4}>
              Code Parcoursup :{" "}
              <Text as="span" variant="highlight">
                {formation.parcoursup_id}
              </Text>
            </Text>
          )}
          {formation.affelnet_id && (
            <Text mb={4}>
              Code Affelnet :{" "}
              <Text as="span" variant="highlight">
                {formation.affelnet_id}
              </Text>
            </Text>
          )}
          <Text mb={4}>
            Identifiant formation Carif Oref :{" "}
            <Text as="span" variant="highlight">
              {formation.id_formation ?? "N/A"}
            </Text>
          </Text>
          <Text mb={4}>
            Identifiant actions Carif Oref :{" "}
            <Text as="span" variant="highlight">
              {formation.ids_action?.join(",") ?? "N/A"}
            </Text>
          </Text>
          <Text mb={4}>
            Code Certif Info :{" "}
            <Text as="span" variant="highlight">
              {formation.id_certifinfo ?? "N/A"}
            </Text>
          </Text>
        </Box>
      </Box>
      <Box p={8}>
        <Heading textStyle="h4" color="grey.800" mb={4}>
          Informations RNCP et ROME
        </Heading>
        {formation.rncp_code && (
          <RncpContainer>
            <Text mb={isTitreRNCP && isRncpExpired ? 0 : 4}>
              Code RNCP :{" "}
              <Text as="span" variant="highlight">
                {formation.rncp_code}
              </Text>{" "}
              <InfoTooltip description={helpText.formation.rncp_code} />
            </Text>
            {isTitreRNCP && isRncpExpired && (
              <Text variant={"unstyled"} fontSize={"zeta"} fontStyle={"italic"} color={"grey.600"}>
                {formation?.rncp_details?.date_fin_validite_enregistrement ? (
                  <>
                    Ce RNCP expire le{" "}
                    {new Date(formation?.rncp_details?.date_fin_validite_enregistrement).toLocaleDateString("fr-FR")}
                  </>
                ) : (
                  <>Ce RNCP est expiré</>
                )}
              </Text>
            )}
          </RncpContainer>
        )}
        <Text mb={4}>
          Intitulé RNCP :{" "}
          <Text as="span" variant="highlight">
            {formation.rncp_intitule}
          </Text>{" "}
          <InfoTooltip description={helpText.formation.rncp_intitule} />
        </Text>
        <Text mb={4}>
          Codes ROME :{" "}
          <Text as="span" variant="highlight">
            {formation.rome_codes.join(", ")}
          </Text>{" "}
          <InfoTooltip description={helpText.formation.rome_codes} />
        </Text>
        {formation.rncp_details && (
          <>
            <Text mb={4}>
              Certificateurs :{" "}
              <Text as="span" variant="highlight">
                {formation.rncp_details.certificateurs
                  ?.filter(({ certificateur }) => certificateur)
                  ?.map(({ certificateur }) => certificateur)
                  .join(", ")}
              </Text>{" "}
              <InfoTooltip description={helpText.formation.certificateurs} />
            </Text>
            <Text mb={4}>
              SIRET Certificateurs :{" "}
              <Text as="span" variant="highlight">
                {formation.rncp_details.certificateurs
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
                  <UnorderedList>
                    {filteredPartenaires.map(({ Nom_Partenaire, Siret_Partenaire, Habilitation_Partenaire }) => (
                      <ListItem key={Siret_Partenaire}>
                        <Text variant="highlight">
                          <strong>
                            {Nom_Partenaire} (siret : {Siret_Partenaire ?? "n/a"}) :
                          </strong>{" "}
                          <HabilitationPartenaire habilitation={Habilitation_Partenaire} />
                        </Text>
                      </ListItem>
                    ))}
                  </UnorderedList>
                ) : (
                  <>
                    {formation.etablissement_reference_habilite_rncp === false && noHabilitation && (
                      <Box
                        bg={"orangesoft.200"}
                        p={4}
                        mb={4}
                        mt={4}
                        borderLeft={"4px solid"}
                        borderColor={"orangesoft.500"}
                        w={"full"}
                      >
                        <Text mb={2}>Aucune habilitation sur la fiche pour ce SIRET.</Text>
                        <Text variant={"unstyled"} fontSize={"zeta"} fontStyle={"italic"}>
                          Le Siret du formateur ne figure pas dans le liste des partenaires habilités enregistrés auprès
                          de France compétences. S’il s’agit d’une erreur, inviter le certificateur à faire modifier les
                          enregistrements auprès de France compétences. La modification prendra effet sur le catalogue à
                          J+1.
                        </Text>
                      </Box>
                    )}
                    SIRET formateur : {formation.etablissement_formateur_siret}, SIRET gestionnaire :{" "}
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
