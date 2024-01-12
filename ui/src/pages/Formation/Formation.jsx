import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Box,
  Button,
  Center,
  Collapse,
  Container,
  Flex,
  Grid,
  GridItem,
  Link,
  Spinner,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";

import Layout from "../layout/Layout";
import helpText from "../../locales/helpText.json";
import { ArrowDownLine, Close, ExternalLinkLine, MapPin2Fill, Parametre } from "../../theme/components/icons";
import { CATALOGUE_GENERAL_LABEL, CATALOGUE_NON_ELIGIBLE_LABEL } from "../../constants/catalogueLabels";
import { AFFELNET_STATUS, COMMON_STATUS, PARCOURSUP_STATUS } from "../../constants/status";

import { _get, _post, _put } from "../../common/httpClient";
import useAuth from "../../common/hooks/useAuth";
import { hasAccessTo, hasRightToEditFormation } from "../../common/utils/rolesUtils";
import { buildUpdatesHistory, sortDescending } from "../../common/utils/historyUtils";
import { getCampagneStartDate, isInSession } from "../../common/utils/rulesUtils";
import { setTitle } from "../../common/utils/pageUtils";
import { getOpenStreetMapUrl } from "../../common/utils/mapUtils";
import { DangerBox } from "../../common/components/DangerBox";
import { PreviousStatusBadge, StatusBadge } from "../../common/components/StatusBadge";
import { PublishModal } from "../../common/components/formation/PublishModal";
import { InfoTooltip } from "../../common/components/InfoTooltip";
import { Alert } from "../../common/components/Alert";
import { Breadcrumb } from "../../common/components/Breadcrumb";
import { EditableField } from "../../common/components/formation/EditableField";
import { HistoryBlock } from "../../common/components/formation/HistoryBlock";
import { RejectionBlock } from "../../common/components/formation/RejectionBlock";
import { DescriptionBlock } from "../../common/components/formation/DescriptionBlock";
import { OrganismesBlock } from "../../common/components/formation/OrganismesBlock";
import { UaiHistoryModal } from "./UaiHistoryModal";
import { ReinitStatutModal } from "../../common/components/formation/ReinitStatutModal";

const CATALOGUE_API = `${process.env.REACT_APP_BASE_URL}/api`;

const endpointLBA = process.env.REACT_APP_ENDPOINT_LBA || "https://labonnealternance.apprentissage.beta.gouv.fr";

const getLBAUrl = ({ cle_ministere_educatif = "" }) => {
  return `${endpointLBA}/recherche-apprentissage?&display=list&page=fiche&type=training&itemId=${encodeURIComponent(
    cle_ministere_educatif
  )}`;
};

const Formation = ({ formation, edition, onEdit, handleChange, handleSubmit, values, hasRightToEdit }) => {
  // Distance tolérer entre l'adresse et les coordonnées transmise par RCO
  const seuilDistance = 100;
  const [isEditingUai, setIsEditingUai] = useState(false);

  const uai_updated_history = formation.updates_history
    .filter((value) => typeof value.to?.uai_formation !== "undefined")
    ?.sort(sortDescending);

  const { isOpen: isComputedAdressOpen, onToggle: onComputedAdressToggle } = useDisclosure(
    formation.distance > seuilDistance
  );
  const { isOpen: isComputedGeoCoordOpen, onToggle: onComputedGeoCoordToggle } = useDisclosure(
    formation.distance > seuilDistance
  );

  const {
    isOpen: isUaiHistoryModalOpen,
    onClose: onUaiHistoryModalClose,
    onOpen: onUaiHistoryModalOpen,
  } = useDisclosure();

  const UaiFormationContainer =
    !formation.uai_formation ||
    !formation.uai_formation_valide ||
    (isEditingUai && formation?.affelnet_statut === AFFELNET_STATUS.PUBLIE) ||
    (formation.uai_formation === formation.editedFields?.uai_formation &&
      !formation.updates_history.filter(
        (history) =>
          history.to?.uai_formation === formation.uai_formation &&
          new Date(history.updated_at).getTime() >= getCampagneStartDate().getTime() - 31536000000
      ).length &&
      ![PARCOURSUP_STATUS.EN_ATTENTE, PARCOURSUP_STATUS.PUBLIE].includes(formation.parcoursup_statut))
      ? (args) => <DangerBox data-testid={"uai-warning"} {...args} />
      : (args) => <Box data-testid={"uai-ok"} {...args} />;

  // formation.distance < seuilDistance
  const AdresseContainer = React.Fragment;
  //   ? (args) => <WarningBox data-testid={"adress-warning"} {...args} />
  //   : React.Fragment;

  const onEditOverride = async (...args) => {
    setIsEditingUai(!isEditingUai);
    await onEdit(...args);
  };

  const handleSubmitOverride = async (...args) => {
    setIsEditingUai(false);
    await handleSubmit(...args);
  };

  const now = new Date();
  // si date du jour < septembre : les formations ayant des tag sur année -1, année en cours et année + 1 seront affichées sur LBA
  // si date du jour >= septembre : année en cours et année + 1, année +2 seront affichées sur LBA
  const tagsForLBA =
    now.getMonth() >= 8
      ? [now.getFullYear(), now.getFullYear() + 1, now.getFullYear() + 2]
      : [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];

  return (
    <Box borderRadius={4}>
      <Grid templateColumns="repeat(12, 1fr)">
        <GridItem colSpan={[12, 12, 7]} bg="white">
          <Box border="1px solid" borderColor="bluefrance">
            <DescriptionBlock formation={formation} />
          </Box>
        </GridItem>
        <GridItem colSpan={[12, 12, 5]} py={8} px={[4, 4, 8]}>
          <Box mb={16}>
            <Text textStyle="h4" color="grey.800">
              <MapPin2Fill w="12px" h="15px" mr="5px" mb="5px" />
              Lieu de la formation
            </Text>
            <Box mt={2} mb={4} ml={[-2, -2, -3]}>
              {formation.catalogue_published && formation.tags.some((tag) => tagsForLBA.includes(+tag)) && (
                <Link href={getLBAUrl(formation)} textStyle="rf-text" variant="pill" isExternal>
                  voir sur labonnealternance <ExternalLinkLine w={"0.75rem"} h={"0.75rem"} mb={"0.125rem"} />
                </Link>
              )}
            </Box>

            <Box>
              <UaiFormationContainer mb={4}>
                <EditableField
                  fieldName={"uai_formation"}
                  label={"UAI du lieu de formation"}
                  formation={formation}
                  edition={edition}
                  onEdit={onEditOverride}
                  values={values}
                  handleSubmit={handleSubmitOverride}
                  handleChange={handleChange}
                  hasRightToEdit={hasRightToEdit && ![PARCOURSUP_STATUS.PUBLIE].includes(formation.parcoursup_statut)}
                  mb={2}
                />

                <Text mb={2}>
                  <Link
                    fontSize={"zeta"}
                    color={"grey.600"}
                    textDecoration={"underline"}
                    onClick={onUaiHistoryModalOpen}
                  >
                    Voir l'historique
                  </Link>
                </Text>

                {isEditingUai && formation.affelnet_statut === AFFELNET_STATUS.PUBLIE && (
                  <Text fontSize={"zeta"} color={"grey.600"} mb={2}>
                    - Si l’UAI lieu est modifiée, la formation devra à nouveau être importée dans Affelnet. Son état
                    basculera de “Publié” à “En attente de publication”, jusqu'à ce que vous procédiez à l’import depuis
                    Affelnet.
                  </Text>
                )}
                {typeof formation.editedFields?.uai_formation !== "undefined" && (
                  <Text fontSize={"zeta"} color={"grey.600"}>
                    - UAI lieu édité
                    {uai_updated_history[0] && (
                      <>
                        {" "}
                        le {new Date(uai_updated_history[0]?.updated_at).toLocaleDateString("fr-FR")} par{" "}
                        {uai_updated_history[0]?.to.last_update_who}
                      </>
                    )}
                    .
                  </Text>
                )}

                {formation.uai_formation && (
                  <>
                    {formation.uai_formation === formation.etablissement_formateur_uai &&
                      !formation.editedFields?.uai_formation && (
                        <Text fontSize={"zeta"} color={"grey.600"} mt={2}>
                          - Cet UAI a été repris automatiquement de l’UAI formateur.
                        </Text>
                      )}

                    {[PARCOURSUP_STATUS.PUBLIE].includes(formation.parcoursup_statut) && (
                      <Text fontSize={"zeta"} color={"grey.600"} mt={2}>
                        - L’UAI n’est plus modifiable car la formation est déjà publiée sur Parcoursup. Si l’UAI doit
                        être modifiée, faire un message au SCN via la messagerie Parcoursup pour signaler que vous
                        n’avez pas envoyé la formation sur le bon UAI. Suite à intervention du SCN, la formation sera
                        réinitialisée sur le catalogue, pour vous permettre de modifier l'UAI lieu et de redemander la
                        publication. Si l'adresse postale du lieu doit être modifiée, demander au CFA d'en faire le
                        signalement au Carif-Oref pour modification à la source.
                      </Text>
                    )}
                  </>
                )}

                {!formation.uai_formation && (
                  <>
                    {formation.code_commune_insee !== formation.etablissement_formateur_code_commune_insee && (
                      <Text fontSize={"zeta"} color={"grey.600"} mt={2}>
                        - L’UAI du lieu de formation doit être renseigné en cohérence avec l’adresse du lieu de
                        formation.
                      </Text>
                    )}
                  </>
                )}

                {formation.uai_formation === formation.editedFields?.uai_formation &&
                  !formation.updates_history.filter(
                    (history) =>
                      history.to?.uai_formation === formation.uai_formation &&
                      new Date(history.updated_at).getTime() >= getCampagneStartDate().getTime() - 31536000000
                  ).length && (
                    <Text fontSize={"zeta"} color={"grey.600"} mt={2}>
                      - L’UAI renseigné est le même pour l’organisme formateur et le lieu de formation alors que les
                      adresses sont différentes. Vérifiez l’adresse et l’UAI du lieu de formation et corrigez si
                      nécessaire.
                    </Text>
                  )}
              </UaiFormationContainer>

              <AdresseContainer>
                <Text mb={4}>
                  Adresse :{" "}
                  <Text as="span" variant="highlight">
                    {formation.lieu_formation_adresse}
                  </Text>{" "}
                  <InfoTooltip description={helpText.formation.lieu_formation_adresse} />
                </Text>
                <Text mb={4}>
                  Code postal :{" "}
                  <Text as="span" variant="highlight">
                    {formation.code_postal}
                  </Text>{" "}
                  <InfoTooltip description={helpText.formation.code_postal} />
                </Text>
                <Text mb={4}>
                  Commune :{" "}
                  <Text as="span" variant="highlight">
                    {formation.localite}
                  </Text>{" "}
                  <InfoTooltip description={helpText.formation.localite} />
                </Text>
                <Text mb={formation?.lieu_formation_geo_coordonnees_computed ? 0 : 4}>
                  Département :{" "}
                  <Text as="span" variant="highlight">
                    {formation.nom_departement} ({formation.num_departement})
                  </Text>{" "}
                  <InfoTooltip description={helpText.formation.nom_departement} />
                </Text>
                {formation?.lieu_formation_geo_coordonnees_computed && (
                  <Box mb={4}>
                    <Button
                      onClick={onComputedGeoCoordToggle}
                      variant={"unstyled"}
                      fontSize={"zeta"}
                      fontStyle={"italic"}
                      color={"grey.600"}
                    >
                      Géolocalisation calculée depuis l'adresse{" "}
                      <ArrowDownLine boxSize={5} transform={isComputedGeoCoordOpen ? "rotate(180deg)" : "none"} />
                    </Button>
                    <Collapse in={isComputedGeoCoordOpen} animateOpacity unmountOnExit={true}>
                      <Text>
                        <Text fontSize={"zeta"} color={"grey.600"} as="span">
                          {getOpenStreetMapUrl(formation.lieu_formation_geo_coordonnees_computed) ? (
                            <Link
                              href={getOpenStreetMapUrl(formation.lieu_formation_geo_coordonnees_computed)}
                              textStyle="rf-text"
                              variant="pill"
                              title="Voir sur GeoPortail"
                              isExternal
                            >
                              {formation.lieu_formation_geo_coordonnees_computed}
                            </Link>
                          ) : (
                            <>{formation.lieu_formation_geo_coordonnees_computed}</>
                          )}
                        </Text>{" "}
                        <InfoTooltip description={helpText.formation.lieu_formation_geo_coordonnees_computed} />
                      </Text>
                    </Collapse>
                  </Box>
                )}

                <Text mb={formation?.lieu_formation_adresse_computed ? 0 : 4}>
                  Géolocalisation :{" "}
                  <Text as="span" variant="highlight">
                    {formation.lieu_formation_geo_coordonnees}
                  </Text>{" "}
                  <InfoTooltip description={helpText.formation.lieu_formation_geo_coordonnees} />
                </Text>
                {formation?.lieu_formation_adresse_computed && (
                  <Box mb={4}>
                    <Button
                      onClick={onComputedAdressToggle}
                      variant={"unstyled"}
                      fontSize={"zeta"}
                      fontStyle={"italic"}
                      color={"grey.600"}
                    >
                      Adresse calculée depuis la géolocalisation{" "}
                      <ArrowDownLine boxSize={5} transform={isComputedAdressOpen ? "rotate(180deg)" : "none"} />
                    </Button>
                    <Collapse in={isComputedAdressOpen} animateOpacity unmountOnExit={true}>
                      <Text>
                        <Text fontSize={"zeta"} color={"grey.600"} as="span">
                          {getOpenStreetMapUrl(formation.lieu_formation_geo_coordonnees) ? (
                            <Link
                              href={getOpenStreetMapUrl(formation.lieu_formation_geo_coordonnees)}
                              textStyle="rf-text"
                              variant="pill"
                              title="Voir sur GeoPortail"
                              isExternal
                            >
                              {formation.lieu_formation_adresse_computed}
                            </Link>
                          ) : (
                            <>{formation.lieu_formation_adresse_computed}</>
                          )}
                        </Text>{" "}
                        <InfoTooltip description={helpText.formation.lieu_formation_adresse_computed} />
                      </Text>
                    </Collapse>
                  </Box>
                )}
              </AdresseContainer>

              <Text mb={4}>
                Code commune (Insee) :{" "}
                <Text as="span" variant="highlight">
                  {formation.code_commune_insee}
                </Text>{" "}
                <InfoTooltip description={helpText.formation.code_commune_insee} />
              </Text>

              <Text mb={4}>
                Académie de rattachement :{" "}
                <Text as="span" variant="highlight">
                  {formation.nom_academie} ({formation.num_academie})
                </Text>{" "}
                <InfoTooltip description={helpText.formation.academie} />
              </Text>
            </Box>
          </Box>
          <Box mb={16}>
            <OrganismesBlock formation={formation} />
          </Box>

          {(formation?.affelnet_statut_history?.length ||
            formation?.parcoursup_statut_history?.length ||
            formation?.updates_history) && (
            <Box mb={[0, 0, 16]}>
              <HistoryBlock formation={formation} />
            </Box>
          )}
        </GridItem>
      </Grid>

      <UaiHistoryModal isOpen={isUaiHistoryModalOpen} onClose={onUaiHistoryModalClose} formation={formation} />
    </Box>
  );
};

export default () => {
  const { id } = useParams();
  const toast = useToast();
  const [formation, setFormation] = useState();
  const [loading, setLoading] = useState(false);

  const [edition, setEdition] = useState(null);
  const [isReinitModalOpen, setIsReinitModalOpen] = useState(false);
  const openReinitModal = useCallback(() => setIsReinitModalOpen(true), []);
  const navigate = useNavigate();
  const { isOpen: isOpenPublishModal, onOpen: onOpenPublishModal, onClose: onClosePublishModal } = useDisclosure();

  const [user] = useAuth();
  const hasRightToEdit = hasRightToEditFormation(formation, user);

  const { values, handleSubmit, handleChange, setFieldValue, isSubmitting } = useFormik({
    enableReinitialize: true,
    initialValues: {
      uai_formation: "",
      affelnet_statut: formation?.affelnet_statut,
    },
    onSubmit: ({ uai_formation, affelnet_statut }) => {
      return new Promise(async (resolve) => {
        const trimedUaiFormation = uai_formation?.trim();

        try {
          if (trimedUaiFormation !== formation["uai_formation"]) {
            // console.log({
            //   uai_formation: trimedUaiFormation,
            //   ...(affelnet_statut === AFFELNET_STATUS.PUBLIE ? { affelnet_statut: AFFELNET_STATUS.EN_ATTENTE } : {}),
            //   last_update_who: user.email,
            //   last_update_at: Date.now(),
            //   editedFields: { ...formation?.editedFields, uai_formation: trimedUaiFormation },
            //   $push: {
            //     updates_history: buildUpdatesHistory(
            //       formation,
            //       {
            //         uai_formation: trimedUaiFormation,
            //         ...(affelnet_statut === AFFELNET_STATUS.PUBLIE
            //           ? { affelnet_statut: AFFELNET_STATUS.EN_ATTENTE }
            //           : {}),
            //         last_update_who: user.email,
            //       },
            //       ["uai_formation", ...(affelnet_statut === AFFELNET_STATUS.PUBLIE ? ["affelnet_statut"] : [])]
            //     ),
            //   },
            // });

            const result = await _put(`${CATALOGUE_API}/entity/formations/${formation._id}`, {
              uai_formation: trimedUaiFormation,
              ...(affelnet_statut === AFFELNET_STATUS.PUBLIE ? { affelnet_statut: AFFELNET_STATUS.EN_ATTENTE } : {}),
              last_update_who: user.email,
              last_update_at: Date.now(),
              editedFields: { ...formation?.editedFields, uai_formation: trimedUaiFormation },
              $push: {
                updates_history: buildUpdatesHistory(
                  formation,
                  {
                    uai_formation: trimedUaiFormation,
                    ...(affelnet_statut === AFFELNET_STATUS.PUBLIE
                      ? { affelnet_statut: AFFELNET_STATUS.EN_ATTENTE }
                      : {}),
                    last_update_who: user.email,
                  },
                  ["uai_formation", ...(affelnet_statut === AFFELNET_STATUS.PUBLIE ? ["affelnet_statut"] : [])]
                ),
              },
            });
            if (result) {
              setFormation(result);
              setFieldValue("uai_formation", result?.uai_formation ?? "");
            }
          }
        } catch (e) {
          console.error("Can't perform update", e);

          const response = await (e?.json ?? {});
          const message = response?.message ?? e?.message;

          toast({
            title: "Erreur",
            description: message,
            status: "error",
            duration: 20000,
          });
        } finally {
          setEdition(null);
          resolve("onSubmitHandler complete");
        }
      });
    },
  });

  const mountedRef = useRef(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        // FIXME select={"__v" :0} hack to get updates_history
        const formation = await _get(`${CATALOGUE_API}/entity/formation/${id}?select={"__v":0}`);

        if (!mountedRef.current) return null;
        // don't display archived formations
        if (!formation.published) {
          throw new Error("Cette formation n'est pas publiée dans le catalogue");
        }

        setLoading(false);
        setFormation(formation);
        setFieldValue("uai_formation", formation.uai_formation ?? "");
      } catch (e) {
        if (!mountedRef.current) return null;
        setLoading(false);
      }
    })();

    return () => {
      mountedRef.current = false;
    };
  }, [id, setFieldValue]);

  const onEdit = (fieldName = null) => {
    setEdition(fieldName);
  };

  const title = loading ? "" : `${formation?.intitule_long ?? "Formation inconnue"}`;
  setTitle(title);

  const sendToParcoursup = useCallback(async () => {
    try {
      const response = await _post(`${CATALOGUE_API}/parcoursup/send-ws`, {
        id,
      });
      const message = response?.message;

      toast({
        title: "Succès",
        description: message,
        status: "success",
        duration: 10000,
      });
    } catch (e) {
      console.error("Can't send to ws", e);

      const response = await (e?.json ?? {});
      const message = response?.message ?? e?.message;

      toast({
        title: "Erreur",
        description: message,
        status: "error",
        duration: 10000,
      });
    }

    const response = await _get(`${CATALOGUE_API}/entity/formation/${id}?select={"__v":0}`);
    setFormation(response);
  }, [id, toast]);

  const reinitStatutParcoursup = useCallback(
    async ({ comment }) => {
      try {
        const response = await _post(`${CATALOGUE_API}/entity/formations/${id}/reinit-statut`, {
          comment,
        });
        const message = response?.message;

        toast({
          title: "Succès",
          description: message,
          status: "success",
          duration: 10000,
        });
      } catch (e) {
        console.error("Can't reinit status", e);

        const response = await (e?.json ?? {});
        const message = response?.message ?? e?.message;

        toast({
          title: "Erreur",
          description: message,
          status: "error",
          duration: 10000,
        });
      }

      const response = await _get(`${CATALOGUE_API}/entity/formation/${id}?select={"__v":0}`);
      setFormation(response);
    },
    [id, toast]
  );

  const parcoursup_date_depublication = formation?.updates_history
    .sort(sortDescending)
    .filter((h) => h.to?.parcoursup_raison_depublication)[0]?.updated_at;
  const affelnet_date_depublication = formation?.updates_history
    .sort(sortDescending)
    .filter((h) => h.to?.affelnet_raison_depublication)[0]?.updated_at;

  const isBacPro32 =
    !!formation?.bcn_mefs_10?.filter(
      ({ mef10 }) => (`${mef10}`.startsWith("247") || `${mef10}`?.startsWith("276")) && `${mef10}`?.endsWith("32")
    ).length && isInSession(formation);

  const isBrevetNiv5 = formation?.diplome === "BREVET PROFESSIONNEL AGRICOLE DE NIVEAU V" && isInSession(formation);

  return (
    <Layout>
      <Box w="100%" pt={[4, 8]} px={[1, 1, 12, 24]}>
        <Container maxW="7xl">
          <Breadcrumb
            pages={[
              { title: "Accueil", to: "/" },
              {
                title: `Catalogue des formations en apprentissage
                ${
                  !!formation
                    ? formation.catalogue_published
                      ? ` (${CATALOGUE_GENERAL_LABEL})`
                      : ` (${CATALOGUE_NON_ELIGIBLE_LABEL})`
                    : ""
                }`,
                to: "/recherche/formations",
              },
              ...[loading ? [] : { title: title }],
            ]}
          />
        </Container>
      </Box>
      <Box w="100%" py={[1, 8]} px={[1, 1, 12, 24]}>
        <Container maxW="7xl">
          {loading && (
            <Center h="70vh">
              <Spinner />
            </Center>
          )}

          {hasAccessTo(user, "page_formation") && !loading && formation && (
            <>
              <Box mb={8} data-testid={"formation-content"}>
                <Flex alignItems="center" justify="space-between" flexDirection={["column", "column", "row"]}>
                  <Box>
                    <Text textStyle="h2" color="grey.800" pr={[0, 0, 8]} mb={4}>
                      {title} <InfoTooltip description={helpText.formation.intitule_long} />
                    </Text>
                  </Box>
                  {hasRightToEdit &&
                    formation.catalogue_published &&
                    (![PARCOURSUP_STATUS.PUBLIE, PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT].includes(
                      formation.parcoursup_statut
                    ) ||
                      ![AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT].includes(formation.affelnet_statut)) &&
                    hasAccessTo(user, "page_formation/gestion_publication") && (
                      <Button
                        textStyle="sm"
                        variant="primary"
                        minW={null}
                        px={8}
                        mt={[8, 8, 0]}
                        onClick={() => {
                          onOpenPublishModal();
                        }}
                        disabled={
                          !formation.uai_formation || !formation.uai_formation.length || !formation.uai_formation_valide
                        }
                        title={
                          !formation.uai_formation || !formation.uai_formation.length || !formation.uai_formation_valide
                            ? "Vous devez éditer l'UAI du lieu de la formation avant de pouvoir accéder à la gestion des publications"
                            : "Gérer les publications"
                        }
                      >
                        <Parametre mr={2} />
                        Gérer les publications
                      </Button>
                    )}
                </Flex>
                {formation.catalogue_published && (
                  <Flex justifyContent={"space-between"} flexDirection={["column", "column", "row"]}>
                    <Box mt={5}>
                      {hasAccessTo(user, "page_formation/voir_status_publication_ps") &&
                        (formation.parcoursup_perimetre ||
                          formation.parcoursup_statut !== PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT) && (
                          <>
                            <StatusBadge source="Parcoursup" status={formation.parcoursup_statut} mr={[0, 3]} />

                            <PreviousStatusBadge
                              source="Parcoursup"
                              status={formation.parcoursup_previous_statut}
                              created_at={formation.created_at}
                              mr={[0, 3]}
                            />
                          </>
                        )}
                      {hasAccessTo(user, "page_formation/voir_status_publication_aff") &&
                        (formation.affelnet_perimetre ||
                          formation.affelnet_statut !== AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT) && (
                          <>
                            <StatusBadge source="Affelnet" status={formation.affelnet_statut} mr={[0, 3]} />

                            <PreviousStatusBadge
                              source="Affelnet"
                              status={formation.affelnet_previous_statut}
                              created_at={formation.created_at}
                              mr={[0, 3]}
                            />
                          </>
                        )}

                      {!formation.affelnet_perimetre &&
                        !formation.parcoursup_perimetre &&
                        formation.affelnet_statut === AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT &&
                        formation.parcoursup_statut === PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT && (
                          <>
                            {hasAccessTo(user, "page_formation/voir_status_publication_aff") && (
                              <StatusBadge mr={[0, 3]} text={"Affelnet - hors périmètre"} />
                            )}

                            {hasAccessTo(user, "page_formation/voir_status_publication_ps") && (
                              <StatusBadge mr={[0, 3]} text={"Parcoursup - hors périmètre"} />
                            )}
                          </>
                        )}
                    </Box>
                    <Flex
                      alignItems="center"
                      justifyContent={"space-between"}
                      flexDirection={["column", "column", "row"]}
                    >
                      {[PARCOURSUP_STATUS.FERME, COMMON_STATUS.EN_ATTENTE].includes(formation.parcoursup_statut) &&
                        hasAccessTo(user, "page_formation/envoi_parcoursup") && (
                          <Button textStyle="sm" variant="secondary" px={8} mt={4} onClick={sendToParcoursup}>
                            Forcer la publication Parcoursup
                          </Button>
                        )}

                      {[PARCOURSUP_STATUS.PUBLIE].includes(formation.parcoursup_statut) &&
                        hasAccessTo(user, "page_formation/reinit_parcoursup") && (
                          <Button textStyle="sm" variant="secondary" px={8} mt={4} onClick={openReinitModal}>
                            Réinitialiser la publication Parcoursup
                          </Button>
                        )}
                    </Flex>
                  </Flex>
                )}

                {((formation.parcoursup_perimetre &&
                  formation.parcoursup_previous_session &&
                  !formation.parcoursup_session) ||
                  (formation.affelnet_perimetre &&
                    formation.affelnet_previous_session &&
                    !formation.affelnet_session)) && (
                  <Alert mt={4} type={"warning"}>
                    La formation pourrait être dans le périmètre{" "}
                    {formation.parcoursup_perimetre ? "Parcoursup" : "Affelnet"}, mais ne possède pas de date de début
                    sur la session à venir. S'il s'agit d'un problème de collecte, veuillez faire le signalement auprès
                    du Carif-Oref.
                  </Alert>
                )}

                {hasAccessTo(user, "page_formation/voir_status_publication_ps") &&
                  [PARCOURSUP_STATUS.EN_ATTENTE, PARCOURSUP_STATUS.REJETE].includes(formation.parcoursup_statut) &&
                  !!formation.parcoursup_error && <RejectionBlock formation={formation} />}

                {hasAccessTo(user, "page_formation/voir_status_publication_ps") &&
                  formation.parcoursup_raison_depublication && (
                    <Alert mt={4} type={"warning"}>
                      Motif de non publication
                      {!!parcoursup_date_depublication && (
                        <> ({new Date(parcoursup_date_depublication).toLocaleDateString("fr-FR")})</>
                      )}{" "}
                      : <b>{formation.parcoursup_raison_depublication}</b>
                    </Alert>
                  )}
                {hasAccessTo(user, "page_formation/voir_status_publication_af") &&
                  formation.affelnet_raison_depublication && (
                    <Alert mt={4} type={"warning"}>
                      Motif de non publication
                      {!!affelnet_date_depublication && (
                        <> ({new Date(affelnet_date_depublication).toLocaleDateString("fr-FR")})</>
                      )}{" "}
                      : <b>{formation.affelnet_raison_depublication}</b>
                    </Alert>
                  )}

                {isBacPro32 && (
                  <Alert mt={4} type={"warning"}>
                    Cette formation est potentiellement dans le périmètre Affelnet (voir détail dans l'encadré sur
                    l'année d'entrée en apprentissage), mais pour des raisons techniques, elle ne pourra pas être
                    importée dans Affelnet.
                    <br />
                    Vous pouvez, pour des raisons de lisibilité, procéder à la demande de publication (dans quel cas la
                    formation restera en statut "En attente de publication", même après vos imports Affelnet) ou à la
                    non publication.
                    <br />
                    Vous pouvez également si vous le souhaitez ignorer cette formation et la laisser en statut "à
                    publier (soumis à validation)".
                  </Alert>
                )}

                {isBrevetNiv5 && (
                  <Alert mt={4} type={"warning"}>
                    Pour des raisons techniques, cette formation ne peut pas intégrer le périmètre Affelnet pour la
                    campagne 2023. Elle doit être créée manuellement dans Affelnet.
                  </Alert>
                )}
              </Box>
              <Formation
                formation={formation}
                edition={edition}
                onEdit={onEdit}
                values={values}
                handleSubmit={handleSubmit}
                handleChange={handleChange}
                hasRightToEdit={hasAccessTo(user, "page_formation/modifier_informations") && hasRightToEdit}
                isSubmitting={isSubmitting}
              />
            </>
          )}
          {hasAccessTo(user, "page_formation") && !loading && !formation && (
            <Box mb={8}>
              <Flex alignItems="center" justify="space-between" flexDirection={["column", "column", "row"]}>
                <Text textStyle="h2" color="grey.800" pr={[0, 0, 8]}>
                  {title}
                </Text>
                <Button
                  textStyle="sm"
                  variant="primary"
                  minW={null}
                  px={8}
                  mt={[8, 8, 0]}
                  onClick={() => {
                    navigate("/recherche/formations");
                  }}
                >
                  Retour à la recherche
                </Button>
              </Flex>
              <Box mt={5} mb={8}>
                <Flex>{helpText.formation.not_found}</Flex>
              </Box>
            </Box>
          )}
        </Container>
      </Box>
      {hasAccessTo(user, "page_formation/gestion_publication") && formation && (
        <PublishModal
          isOpen={isOpenPublishModal}
          onClose={onClosePublishModal}
          formation={formation}
          onFormationUpdate={(updatedFormation) => {
            setFormation(updatedFormation);
          }}
        />
      )}

      {hasAccessTo(user, "page_formation/reinit_parcoursup") && formation && (
        <ReinitStatutModal
          isOpen={isReinitModalOpen}
          onClose={setIsReinitModalOpen}
          reinitStatut={reinitStatutParcoursup}
        />
      )}
    </Layout>
  );
};
