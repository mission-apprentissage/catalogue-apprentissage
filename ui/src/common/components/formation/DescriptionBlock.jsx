import React, { useCallback, useContext } from "react";
import { Box, Link, ListItem, Text, UnorderedList, useToast, List, Divider, Button } from "@chakra-ui/react";
import { ExternalLinkLine } from "../../../theme/components/icons";
import { DangerBox } from "../DangerBox";
import { InfoTooltip } from "../InfoTooltip";
import helpText from "../../../locales/helpText.json";
import { FormationDate } from "./FormationDate";
import { HabilitationPartenaire } from "./HabilitationPartenaire";
import { HABILITE_LIST } from "../../../constants/certificateurs";
import { EllipsisText } from "../EllipsisText";
import { getExpirationDate, isInSession } from "../../utils/rulesUtils";
import { DateContext } from "../../../DateContext";
import { hasAccessTo } from "../../utils/rolesUtils";
import useAuth from "../../hooks/useAuth";

// const endpointLBA = process.env.REACT_APP_ENDPOINT_LBA || "https://labonnealternance.apprentissage.beta.gouv.fr";
const endpointPublic = process.env.REACT_APP_ENDPOINT_PUBLIC || "https://catalogue-apprentissage.intercariforef.org";

// const getLBAUrl = ({ cle_ministere_educatif = "" }) => {
//   return `${endpointLBA}/recherche-apprentissage?&display=list&page=fiche&type=training&itemId=${encodeURIComponent(
//     cle_ministere_educatif
//   )}`;
// };

const getPublicUrl = ({ cle_ministere_educatif = "" }) => {
  return `${endpointPublic}/formation/${encodeURIComponent(cle_ministere_educatif)}`;
};

const DureeAnnee = ({ value }) => {
  if (!value) {
    return "N/A";
  }

  const tmpValue = ["D", "X", "Y"].includes(value) ? "Information non collectée" : value;
  return tmpValue === "9" ? "Sans objet (code BCN: 9)" : tmpValue;
};

export const DescriptionBlock = ({ formation }) => {
  const { campagneStartDate, sessionStartDate, sessionEndDate } = useContext(DateContext);
  const [user] = useAuth();

  const toast = useToast();
  const isTitreRNCP = ["Titre", "TP", null].includes(formation.rncp_details?.code_type_certif); // formation.etablissement_reference_habilite_rncp !== null;

  const showPartenaires =
    isTitreRNCP &&
    !(formation.rncp_details?.certificateurs ?? []).some(({ certificateur }) => HABILITE_LIST.includes(certificateur));

  const MefContainer =
    formation.duree_incoherente ||
    formation.annee_incoherente ||
    !!formation.bcn_mefs_10.filter((mef) => mef?.mef10?.endsWith("99")).length
      ? (args) => <DangerBox data-testid={"mef-warning"} {...args} />
      : React.Fragment;

  const displayDureeWarning = formation.duree_incoherente || ["D"].includes(formation.duree);
  const DureeContainer = displayDureeWarning
    ? (args) => <DangerBox data-testid={"duree-warning"} {...args} />
    : React.Fragment;

  const isBacPro3AnsEn2Ans = !!formation.bcn_mefs_10?.filter(
    ({ mef10 }) =>
      (mef10.startsWith("247") && mef10.endsWith("32")) || (mef10.startsWith("276") && mef10.endsWith("32"))
  ).length;

  const displayAnneeWarning =
    formation.annee_incoherente ||
    ["X", "Y"].includes(formation.annee) ||
    (formation.affelnet_perimetre && isBacPro3AnsEn2Ans);

  const AnneeContainer = displayAnneeWarning
    ? (args) => <DangerBox data-testid={"annee-warning"} {...args} />
    : React.Fragment;

  const isCfdExpired =
    formation.cfd_outdated ||
    (formation.cfd_date_fermeture && new Date(formation.cfd_date_fermeture).getTime() <= getExpirationDate().getTime());

  const CfdContainer =
    !isTitreRNCP && isCfdExpired ? (args) => <DangerBox data-testid={"cfd-warning"} {...args} /> : React.Fragment;

  const isRncpExpired =
    formation.rncp_details?.rncp_outdated ||
    (formation.rncp_details?.date_fin_validite_enregistrement &&
      new Date(formation.rncp_details?.date_fin_validite_enregistrement).getTime() <= getExpirationDate().getTime());

  const RncpContainer =
    isTitreRNCP && isRncpExpired ? (args) => <DangerBox data-testid={"rncp-warning"} {...args} /> : React.Fragment;

  const siretCertificateurs =
    formation.rncp_details.certificateurs?.map(({ siret_certificateur }) => siret_certificateur) ?? [];

  // Problème d'habilitation si le siret formateur ou gestionnaire n'est pas dans la liste des sirets certificateurs
  const noHabilitation = !(
    siretCertificateurs.includes(formation.etablissement_formateur_siret) ||
    siretCertificateurs.includes(formation.etablissement_gestionnaire_siret)
  );

  console.log({
    date_debut: formation.date_debut,
    sessionStartDate,
    sessionEndDate,
    isInSession: isInSession(formation, sessionStartDate, sessionEndDate),
  });

  const DateSessionContainer = !isInSession(formation, sessionStartDate, sessionEndDate)
    ? (args) => <DangerBox data-testid={"session-warning"} {...args} />
    : React.Fragment;

  const campagneStartYear = campagneStartDate?.getFullYear();

  const rncpCode = formation?.rncp_code?.split("RNCP")[1];

  const now = new Date();
  // si date du jour < septembre : les formations ayant des tag sur année -1, année en cours et année + 1 seront affichées sur LBA
  // si date du jour >= septembre : année en cours et année + 1, année +2 seront affichées sur LBA
  const tagsForLBA =
    now.getMonth() >= 8
      ? [now.getFullYear(), now.getFullYear() + 1, now.getFullYear() + 2]
      : [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];

  const copyPublicLink = useCallback(
    (event) => {
      event.preventDefault();
      navigator.clipboard.writeText(getPublicUrl(formation));
      toast({
        title: "Lien copié",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    },
    [formation, toast]
  );

  return (
    <>
      <Box p={8}>
        <Text textStyle="h4" color="grey.800">
          Description
        </Text>

        <Box mt={4} mb={4} ml={-3}>
          <List textStyle="md" fontWeight="700" flexDirection={"row"} flexWrap={"wrap"} mb={[3, 3, 0]} display="flex">
            {[
              ...(formation.onisep_url !== "" && formation.onisep_url !== null
                ? [
                    <ListItem>
                      <Link href={formation.onisep_url} variant="outlined" isExternal style={{ whiteSpace: "no-wrap" }}>
                        Onisep&nbsp;
                        <ExternalLinkLine w={"0.75rem"} h={"0.75rem"} />
                      </Link>
                    </ListItem>,
                  ]
                : []),

              <ListItem ml={2}>
                <Link href={getPublicUrl(formation)} variant="outlined" isExternal style={{ whiteSpace: "no-wrap" }}>
                  catalogue public&nbsp;
                  <ExternalLinkLine w={"0.75rem"} h={"0.75rem"} />
                </Link>
                <Button
                  variant="pill"
                  display="inline-flex"
                  cursor="pointer"
                  ml={2}
                  onClick={copyPublicLink}
                  aria-label="Search database"
                >
                  Copier le lien
                  {/* <ClipboardLine w={"0.75rem"} h={"0.75rem"} ml={2} /> */}
                </Button>
              </ListItem>,

              ...(hasAccessTo(user, "page_formation/voir_status_publication_ps") &&
              formation.parcoursup_published &&
              formation.parcoursup_id
                ? [
                    <ListItem ml={2}>
                      <Link
                        target="_blank"
                        href={`https://dossierappel.parcoursup.fr/Candidats/public/fiches/afficherFicheFormation?g_ta_cod=${formation.parcoursup_id}`}
                        variant="outlined"
                        isExternal
                      >
                        Site Public Parcoursup&nbsp;
                        <ExternalLinkLine w={"0.75rem"} h={"0.75rem"} />
                      </Link>
                    </ListItem>,
                  ]
                : []),
            ]
              .map((item) => <ListItem ml={2}>{item}</ListItem>)
              .reduce(
                (acc, val) =>
                  acc.concat(
                    <ListItem ml={4}>
                      <Divider border="2px" orientation="vertical" />
                    </ListItem>,
                    val
                  ),
                []
              )
              .slice(1)}
          </List>
        </Box>

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

          <Text mb={4}>
            Type de certification (donnée issue de Certif Info) :{" "}
            <Text as="span" variant="highlight">
              {formation.CI_inscrit_rncp}
            </Text>{" "}
          </Text>
          <Text mb={4}>
            Type de certification (donnée issue de France compétences) :{" "}
            <Text as="span" variant="highlight">
              {formation.rncp_details?.type_enregistrement}
            </Text>{" "}
          </Text>
          <Text mb={4}>
            La date de validité de la certification est contrôlée sur le{" "}
            {formation.rncp_details?.type_enregistrement === "Enregistrement de droit" ? <>CFD</> : <>code RNCP</>}
          </Text>

          <CfdContainer>
            <Text mb={!isTitreRNCP && isCfdExpired ? 0 : 4}>
              Code formation diplôme (CFD) :{" "}
              <Text as="span" variant="highlight">
                {formation.cfd}{" "}
                {formation.cfd_date_fermeture
                  ? `(expire le ${new Date(formation.cfd_date_fermeture).toLocaleDateString("fr-FR")})`
                  : "(expiration : non renseigné)"}
              </Text>{" "}
              <InfoTooltip description={helpText.formation.cfd} />
            </Text>
            {!isTitreRNCP && isCfdExpired && (
              <Text
                variant={"unstyled"}
                fontSize={"zeta"}
                fontStyle={"italic"}
                color={"grey.600"}
                mb={formation.cfd === formation.cfd_entree ? 0 : 4}
              >
                {formation?.cfd_date_fermeture ? (
                  <>
                    Ce code formation diplôme{" "}
                    {new Date().getTime() > new Date(formation?.cfd_date_fermeture).getTime()
                      ? "est expiré depuis le"
                      : "expire le "}{" "}
                    {new Date(formation?.cfd_date_fermeture).toLocaleDateString("fr-FR")}
                  </>
                ) : (
                  <>Ce code formation diplôme est expiré</>
                )}{" "}
                (source BCN,{" "}
                <Link
                  href="http://infocentre.pleiade.education.fr/bcn/workspace/viewTable/n/N_FORMATION_DIPLOME"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  N_formation_diplome
                </Link>{" "}
                ou{" "}
                <Link
                  href="http://infocentre.pleiade.education.fr/bcn/workspace/viewTable/n/V_FORMATION_DIPLOME"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  V_formation_diplome
                </Link>
                ).
              </Text>
            )}
            {formation.cfd_entree !== formation.cfd && (
              <Text mb={!isTitreRNCP && isCfdExpired ? 0 : 4}>
                CFD de la première année commune correspondant à ce BTS à options :{" "}
                <Text as="span" variant="highlight">
                  {formation.cfd_entree}{" "}
                  {formation.cfd_entree_date_fermeture
                    ? `(expire le ${new Date(formation.cfd_entree_date_fermeture).toLocaleDateString("fr-FR")})`
                    : "(expiration : non renseigné)"}
                </Text>
              </Text>
            )}
          </CfdContainer>
          <MefContainer>
            <Text
              mb={
                formation.duree_incoherente ||
                formation.annee_incoherente ||
                !!formation.bcn_mefs_10.filter((mef) => mef?.mef10?.endsWith("99")).length
                  ? 0
                  : 4
              }
            >
              Codes MEF 10 caractères :{" "}
              <Text as="span" variant="highlight">
                {formation?.bcn_mefs_10
                  ?.map(
                    ({ mef10, date_fermeture }) =>
                      `${mef10} ${
                        date_fermeture
                          ? `(expire le ${new Date(date_fermeture).toLocaleDateString("fr-FR")})`
                          : "(expiration : non renseigné)"
                      }`
                  )
                  .join(", ")}
              </Text>{" "}
              <InfoTooltip description={helpText.formation.mef} />
            </Text>
            <Text variant={"unstyled"} fontSize={"zeta"} fontStyle={"italic"} color={"grey.600"}>
              {(formation.duree_incoherente || formation.annee_incoherente) &&
                "Aucun code MEF ne correspond à la durée et à l'année de formation enregistrées auprès du Carif-Oref."}
              {!!formation.bcn_mefs_10.filter((mef) => mef?.mef10?.endsWith("99")).length &&
                "Le code MEF se termine par 99. Ce code MEF ne porte pas d'informations liées à la durée et à l'année."}
            </Text>
          </MefContainer>
          {formation?.affelnet_mefs_10?.length > 0 && (
            <>
              <Text mb={4}>
                Codes MEF 10 caractères dans le périmètre <i>Affelnet</i> :{" "}
                <Text as="span" variant="highlight">
                  {formation?.affelnet_mefs_10
                    ?.map(
                      ({ mef10, date_fermeture }) =>
                        `${mef10} ${
                          date_fermeture
                            ? `(expire le ${new Date(date_fermeture).toLocaleDateString("fr-FR")})`
                            : "(expiration : non renseigné)"
                        }`
                    )
                    .join(", ")}
                </Text>
              </Text>

              <Text mb={4}>
                Informations offre de formation <i>Affelnet</i> :{" "}
                <EllipsisText as="span" variant="highlight">
                  {formation?.affelnet_infos_offre}
                </EllipsisText>{" "}
                <InfoTooltip description={helpText.formation.affelnet_publish_fields} />
              </Text>

              <Text mb={4}>
                Informations offre de formation <i>Affelnet</i> (lien) :{" "}
                <Text as="span" variant="highlight">
                  <Link rel="noreferrer noopener" target="_blank" href={formation?.affelnet_url_infos_offre}>
                    {formation?.affelnet_url_infos_offre}
                  </Link>
                </Text>{" "}
                <InfoTooltip description={helpText.formation.affelnet_publish_fields} />
              </Text>

              <Text mb={4}>
                Modalités particulières <i>Affelnet</i> :{" "}
                <EllipsisText as="span" variant="highlight">
                  {formation?.affelnet_modalites_offre}
                </EllipsisText>{" "}
                <InfoTooltip description={helpText.formation.affelnet_publish_fields} />
              </Text>

              <Text mb={4}>
                Modalités particulières <i>Affelnet</i> (lien) :{" "}
                <Text as="span" variant="highlight">
                  <Link rel="noreferrer noopener" target="_blank" href={formation?.affelnet_url_modalites_offre}>
                    {formation?.affelnet_url_modalites_offre}
                  </Link>
                </Text>{" "}
                <InfoTooltip description={helpText.formation.affelnet_publish_fields} />
              </Text>
            </>
          )}

          {formation?.parcoursup_mefs_10?.length > 0 && (
            <Text mb={4}>
              Codes MEF 10 caractères dans le périmètre <i>Parcoursup</i> :{" "}
              <Text as="span" variant="highlight">
                {formation?.parcoursup_mefs_10
                  ?.map(
                    ({ mef10, date_fermeture }) =>
                      `${mef10} ${
                        date_fermeture
                          ? `(expire le ${new Date(date_fermeture).toLocaleDateString("fr-FR")})`
                          : "(expiration : non renseigné)"
                      }`
                  )
                  .join(", ")}
              </Text>
            </Text>
          )}
          <DateSessionContainer>
            <Text mb={4}>
              Dates de formation : <FormationDate formation={formation} />{" "}
              <InfoTooltip description={helpText.formation.dates} />
            </Text>
            {!isInSession(formation, sessionStartDate, sessionEndDate) && (
              <Text variant={"unstyled"} fontSize={"zeta"} fontStyle={"italic"} color={"grey.600"}>
                Les dates de session ne correspondent pas aux règles de périmètre pour la prochaine campagne Affelnet ou
                Parcoursup. Si le CFA a prévu de proposer une session en {campagneStartYear}, il doit faire
                l’enregistrement auprès du Carif-Oref.{" "}
              </Text>
            )}
          </DateSessionContainer>
          <Text mb={4}>
            Capacite d'accueil :{" "}
            <Text as="span" variant="highlight">
              {formation.capacite ?? "N/A"}
            </Text>{" "}
            <InfoTooltip ml="10px" description={helpText.formation.capacite} />
          </Text>
          <DureeContainer>
            <Text mb={displayDureeWarning ? 0 : 4}>
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

          <AnneeContainer>
            <Text mb={displayAnneeWarning ? 0 : 4}>
              Année d'entrée en apprentissage :{" "}
              <Text as="span" variant="highlight">
                <DureeAnnee value={formation.annee} />
              </Text>{" "}
              <InfoTooltip description={helpText.formation.annee} />
            </Text>
            <Text variant={"unstyled"} fontSize={"zeta"} fontStyle={"italic"} color={"grey.600"}>
              {formation.annee_incoherente &&
                "L'année de formation enregistrée auprès du Carif-Oref ne correspond pas à celle qui est déduite du code MEF correspondant à cette formation."}

              {formation.affelnet_perimetre && isBacPro3AnsEn2Ans && (
                <>
                  <Text as="b">1ère PRO, BAC PRO en 3 ans</Text>
                  <br />
                  Ces formations doivent permettre aux élèves une entrée en seconde année de baccalauréat professionnel.
                  Avant intégration dans Affelnet il convient de vérifier auprès des CFA les modalités d'accès à ces
                  formations. Il convient notamment de vérifier si la formation est accessible à des élèves n'ayant pas
                  suivi une première année de baccalauréat dans la spécialité.
                </>
              )}
            </Text>
          </AnneeContainer>
          <Text mb={4}>
            Clé ministères éducatifs :{" "}
            <Text as="span" variant="highlight">
              {formation.cle_ministere_educatif ?? "N/A"}{" "}
              {formation.cle_me_remplace?.length && (
                <>
                  (version{formation.cle_me_remplace?.length > 1 && "s"} remplacée
                  {formation.cle_me_remplace?.length > 1 && "s"} : {formation.cle_me_remplace?.join(", ")})
                </>
              )}
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
        <Text textStyle="h4" colorc="grey.800" mb={4}>
          Informations RNCP et ROME
        </Text>
        {formation.rncp_code && (
          <RncpContainer>
            <Text mb={isTitreRNCP && isRncpExpired ? 0 : 4}>
              Code RNCP :{" "}
              <Text as="span" variant="highlight">
                {formation.rncp_code}{" "}
                {formation?.rncp_details?.date_fin_validite_enregistrement
                  ? `(expire le ${new Date(
                      formation?.rncp_details?.date_fin_validite_enregistrement
                    ).toLocaleDateString("fr-FR")})`
                  : "(expiration : non renseigné)"}
              </Text>{" "}
              <InfoTooltip description={helpText.formation.rncp_code} />
            </Text>
            {isTitreRNCP && isRncpExpired && (
              <Text variant={"unstyled"} fontSize={"zeta"} fontStyle={"italic"} color={"grey.600"}>
                {formation?.rncp_details?.date_fin_validite_enregistrement ? (
                  <>
                    Ce RNCP{" "}
                    {new Date().getTime() >
                    new Date(formation?.rncp_details?.date_fin_validite_enregistrement).getTime()
                      ? "est expiré depuis le"
                      : "expire le "}{" "}
                    {new Date(formation?.rncp_details?.date_fin_validite_enregistrement).toLocaleDateString("fr-FR")}
                  </>
                ) : (
                  <>Ce RNCP est expiré</>
                )}{" "}
                (source{" "}
                <Link
                  href={`https://www.francecompetences.fr/recherche/rncp/${rncpCode}`}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  https://www.francecompetences.fr/recherche/rncp/{rncpCode}
                </Link>
                ).
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
                {formation.partenaires?.length > 0 ? (
                  <UnorderedList>
                    {formation.partenaires?.map(({ Nom_Partenaire, Siret_Partenaire, Habilitation_Partenaire }) => (
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
                        <Text variant="highlight" mb={2}>
                          Aucune habilitation sur la fiche pour ce SIRET.
                        </Text>
                        <Text variant={"unstyled"} fontSize={"zeta"} fontStyle={"italic"} color={"grey.600"}>
                          Le Siret de l’organisme formateur ou responsable ne figure pas dans le liste des partenaires
                          habilités enregistrés auprès de France compétences. S’il s’agit d’une erreur, inviter le
                          certificateur à faire modifier les enregistrements auprès de France compétences. La
                          modification prendra effet sur le catalogue à J+1.
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
