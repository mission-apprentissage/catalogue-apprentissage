import React, { useEffect, useState, useRef, useCallback, useContext } from "react";
import {
  Badge,
  Box,
  Button,
  Center,
  Collapse,
  Container,
  Flex,
  Grid,
  GridItem,
  Link,
  ListItem,
  Spinner,
  Text,
  UnorderedList,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";

import Layout from "../layout/Layout";
import helpText from "../../locales/helpText.json";
import { ArrowDownLine, ExternalLinkLine, MapPin2Fill } from "../../theme/components/icons";
import { CATALOGUE_GENERAL_LABEL, CATALOGUE_NON_ELIGIBLE_LABEL } from "../../constants/catalogueLabels";
import { AFFELNET_STATUS, COMMON_STATUS, PARCOURSUP_STATUS } from "../../constants/status";

import { _get, _post, _put } from "../../common/httpClient";
import useAuth from "../../common/hooks/useAuth";
import { hasAccessTo, hasRightToEditFormation, isUserAdmin } from "../../common/utils/rolesUtils";
import { buildUpdatesHistory, sortDescending } from "../../common/utils/historyUtils";
import { setTitle } from "../../common/utils/pageUtils";
import { getOpenStreetMapUrl } from "../../common/utils/mapUtils";
import { DangerBox } from "../../common/components/DangerBox";
import { PreviousStatusBadge, StatusBadge } from "../../common/components/StatusBadge";
import { InfoTooltip } from "../../common/components/InfoTooltip";
import { Alert } from "../../common/components/Alert";
import { Breadcrumb } from "../../common/components/Breadcrumb";
import { EditableField } from "../../common/components/formation/EditableField";
import { HistoryBlock } from "../../common/components/formation/HistoryBlock";
import { RejectionBlock } from "../../common/components/formation/RejectionBlock";
import { DescriptionBlock } from "../../common/components/formation/DescriptionBlock";
import { OrganismesBlock } from "../../common/components/formation/OrganismesBlock";
import { PublishModalButton } from "../../common/components/formation/PublishModalButton";
import { UaiHistoryModalButton } from "../../common/components/formation/UaiHistoryModalButton";
import { ReinitStatutModalButton } from "../../common/components/formation/ReinitStatutModalButton";
import { ResponsableEmailModalButton } from "../../common/components/formation/ResponsableEmailModalButton";
import { DateContext } from "../../DateContext";
import useConfig from "../../common/hooks/useConfig";

const CATALOGUE_API = `${process.env.REACT_APP_BASE_URL}/api`;

const Formation = ({ formation, edition, onEdit, handleChange, handleSubmit, values, hasRightToEdit }) => {
  const [auth] = useAuth();

  // Distance tolérer entre l'adresse et les coordonnées transmise par RCO
  const seuilDistance = 100;
  const [isEditingUai, setIsEditingUai] = useState(false);

  const { campagneStartDate } = useContext(DateContext);

  const uai_updated_history = formation.updates_history
    .filter((value) => typeof value.to?.uai_formation !== "undefined")
    ?.sort(sortDescending);

  const { isOpen: isComputedAdressOpen, onToggle: onComputedAdressToggle } = useDisclosure(
    formation.distance > seuilDistance
  );
  const { isOpen: isComputedGeoCoordOpen, onToggle: onComputedGeoCoordToggle } = useDisclosure(
    formation.distance > seuilDistance
  );

  const UaiFormationContainer =
    // uai_formation non renseigné
    !formation.uai_formation ||
    // uai_formation non valide
    !formation.uai_formation_valide ||
    // tentative d'édition alors que la formation est déjà importée dans Affelnet
    (isEditingUai && formation?.affelnet_statut === AFFELNET_STATUS.PUBLIE) ||
    // uai_formation renseigné et égale à etablissement_formateur_uai alors code_commune différent (si pas de modification sur la campagne en cours)
    (formation.code_commune_insee !== formation.etablissement_formateur_code_commune_insee &&
      (!formation.uai_formation ||
        (formation.etablissement_formateur_uai === formation.uai_formation &&
          !formation.updates_history.filter(
            (history) =>
              history.to?.uai_formation === formation.uai_formation &&
              new Date(history.updated_at).getTime() >= campagneStartDate?.getTime() - 31536000000
          ).length &&
          ![PARCOURSUP_STATUS.PRET_POUR_INTEGRATION, PARCOURSUP_STATUS.PUBLIE].includes(formation.parcoursup_statut))))
      ? (args) => <DangerBox data-testid={"uai-warning"} {...args} />
      : (args) => <Box data-testid={"uai-ok"} {...args} />;

  // formation.distance < seuilDistance
  const AdresseContainer = React.Fragment;
  //   ? (args) => <WarningBox data-testid={"adress-warning"} {...args} />
  //   : React.Fragment;

  const LieuContainer =
    formation?.cle_ministere_educatif.includes("#LAD") && formation?.affelnet_perimetre
      ? (args) => <DangerBox data-testid={"lieu-warning"} {...args} />
      : React.Fragment;

  const onEditOverride = async (...args) => {
    setIsEditingUai(!isEditingUai);
    await onEdit(...args);
  };

  const handleSubmitOverride = async (...args) => {
    setIsEditingUai(false);
    await handleSubmit(...args);
  };

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
            <LieuContainer>
              <Text textStyle="h4" color="grey.800" mb={4}>
                <MapPin2Fill w="14px" h="16px" mr="8px" />
                {formation.cle_ministere_educatif.includes("#LAD") ? (
                  <>Formation 100% à distance</>
                ) : (
                  <>Lieu de la formation</>
                )}
              </Text>
            </LieuContainer>

            <Box>
              {!formation.cle_ministere_educatif.includes("#LAD") && (
                <>
                  <UaiFormationContainer my={4}>
                    <EditableField
                      fieldName={"uai_formation"}
                      label={"UAI du lieu de formation"}
                      formation={formation}
                      edition={edition}
                      onEdit={onEditOverride}
                      values={values}
                      handleSubmit={handleSubmitOverride}
                      handleChange={handleChange}
                      hasRightToEdit={
                        hasRightToEdit && ![PARCOURSUP_STATUS.PUBLIE].includes(formation.parcoursup_statut)
                      }
                      emptyText={"Renseigner l'UAI"}
                      notEmptyText={"Modifier l'UAI"}
                      mb={2}
                    />

                    <Text mb={2}>
                      <UaiHistoryModalButton formation={formation} />
                    </Text>

                    {isEditingUai && formation.affelnet_statut === AFFELNET_STATUS.PUBLIE && (
                      <Text fontSize={"zeta"} color={"grey.600"} mb={2}>
                        - Si l’UAI lieu est modifiée, la formation devra à nouveau être importée dans Affelnet. Son état
                        basculera de “Publié” à “En attente de publication”, jusqu'à ce que vous procédiez à l’import
                        depuis Affelnet.
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
                            {uai_updated_history[0]?.to.last_update_automatic
                              ? " (action effectuée sur la précédente version de la fiche, reprise ici automatiquement)"
                              : ""}
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
                            - L’UAI n’est plus modifiable car la formation est déjà publiée sur Parcoursup. Si l’UAI
                            doit être modifiée, faire un message au SCN via la messagerie Parcoursup pour signaler que
                            vous n’avez pas envoyé la formation sur le bon UAI. Suite à intervention du SCN, la
                            formation sera réinitialisée sur le catalogue, pour vous permettre de modifier l'UAI lieu et
                            de redemander la publication. Si l'adresse postale du lieu doit être modifiée, demander au
                            CFA d'en faire le signalement au Carif-Oref pour modification à la source.
                          </Text>
                        )}
                      </>
                    )}

                    {formation.code_commune_insee !== formation.etablissement_formateur_code_commune_insee && (
                      <>
                        {!formation.uai_formation && (
                          <Text fontSize={"zeta"} color={"grey.600"} mt={2}>
                            - L’UAI du lieu de formation doit être renseigné en cohérence avec l’adresse du lieu de
                            formation.
                          </Text>
                        )}

                        {formation.etablissement_formateur_uai === formation.uai_formation &&
                          !formation.updates_history.filter(
                            (history) =>
                              history.to?.uai_formation === formation.uai_formation &&
                              new Date(history.updated_at).getTime() >= campagneStartDate?.getTime() - 31536000000
                          ).length && (
                            <Text fontSize={"zeta"} color={"grey.600"} mt={2}>
                              - L’UAI renseigné est le même pour l’organisme formateur et le lieu de formation alors que
                              les adresses sont différentes. Vérifiez l’adresse et l’UAI du lieu de formation et
                              corrigez si nécessaire.
                            </Text>
                          )}
                      </>
                    )}
                  </UaiFormationContainer>
                  <AdresseContainer>
                    <Text mb={4}>
                      Siret {/* <InfoTooltip description={helpText.formation.etablissement_lieu_formation_siret} /> */}:{" "}
                      <Text as="span" variant="highlight">
                        {formation.etablissement_lieu_formation_siret ?? "N/A"}
                      </Text>
                    </Text>
                    <Text mb={4}>
                      Adresse <InfoTooltip description={helpText.formation.lieu_formation_adresse} /> :{" "}
                      <Text as="span" variant="highlight">
                        {formation.lieu_formation_adresse}
                      </Text>
                    </Text>
                    <Text mb={4}>
                      Code postal <InfoTooltip description={helpText.formation.code_postal} /> :{" "}
                      <Text as="span" variant="highlight">
                        {formation.code_postal}
                      </Text>
                    </Text>
                    <Text mb={4}>
                      Commune <InfoTooltip description={helpText.formation.localite} /> :{" "}
                      <Text as="span" variant="highlight">
                        {formation.localite}
                      </Text>
                    </Text>
                    <Text mb={isUserAdmin(auth) && formation?.lieu_formation_geo_coordonnees_computed ? 0 : 4}>
                      Département <InfoTooltip description={helpText.formation.nom_departement} /> :{" "}
                      <Text as="span" variant="highlight">
                        {formation.nom_departement} ({formation.num_departement})
                      </Text>
                    </Text>
                    {isUserAdmin(auth) && formation?.lieu_formation_geo_coordonnees_computed && (
                      <Box mb={4}>
                        <Button
                          onClick={onComputedGeoCoordToggle}
                          variant={"unstyled"}
                          fontSize={"zeta"}
                          fontStyle={"italic"}
                          color={"grey.600"}
                        >
                          Géolocalisation calculée depuis l'adresse{" "}
                          <InfoTooltip description={helpText.formation.lieu_formation_geo_coordonnees_computed} />{" "}
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
                            </Text>
                          </Text>
                        </Collapse>
                      </Box>
                    )}

                    <Text mb={isUserAdmin(auth) && formation?.lieu_formation_adresse_computed ? 0 : 4}>
                      Géolocalisation <InfoTooltip description={helpText.formation.lieu_formation_geo_coordonnees} /> :{" "}
                      <Text as="span" variant="highlight">
                        {formation.lieu_formation_geo_coordonnees}
                      </Text>
                    </Text>
                    {isUserAdmin(auth) && formation?.lieu_formation_adresse_computed && (
                      <Box mb={4}>
                        <Button
                          onClick={onComputedAdressToggle}
                          variant={"unstyled"}
                          fontSize={"zeta"}
                          fontStyle={"italic"}
                          color={"grey.600"}
                        >
                          Adresse calculée depuis la géolocalisation{" "}
                          <InfoTooltip description={helpText.formation.lieu_formation_adresse_computed} />{" "}
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
                            </Text>
                          </Text>
                        </Collapse>
                      </Box>
                    )}
                  </AdresseContainer>

                  <Text mb={4}>
                    Code commune (Insee) <InfoTooltip description={helpText.formation.code_commune_insee} /> :{" "}
                    <Text as="span" variant="highlight">
                      {formation.code_commune_insee}
                    </Text>
                  </Text>
                </>
              )}
              <Text mb={4}>
                Académie de rattachement <InfoTooltip description={helpText.formation.academie} /> :{" "}
                <Text as="span" variant="highlight">
                  {formation.nom_academie} ({formation.num_academie})
                </Text>
              </Text>
              <Text mb={4}>
                UAI de rattachement <InfoTooltip description={helpText.formation.etablissement_lieu_formation_uai} /> :{" "}
                <Text as="span" variant="highlight">
                  {formation.etablissement_lieu_formation_uai}
                </Text>
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
    </Box>
  );
};

export default () => {
  const { id } = useParams();
  const toast = useToast();
  const [formation, setFormation] = useState();
  const [responsable, setResponsable] = useState();
  const [candidatureRelation, setCandidatureRelation] = useState();
  const [loading, setLoading] = useState(false);
  const config = useConfig();

  const [edition, setEdition] = useState(null);
  const navigate = useNavigate();

  const [user] = useAuth();
  const hasRightToEdit = hasRightToEditFormation(formation, user);

  const { campagneStartDate } = useContext(DateContext);

  const { values, handleSubmit, handleChange, setFieldValue, isSubmitting } = useFormik({
    enableReinitialize: true,
    initialValues: {
      uai_formation: formation?.uai_formation,
      affelnet_statut: formation?.affelnet_statut,
    },
    onSubmit: ({ uai_formation, affelnet_statut }) => {
      return new Promise(async (resolve) => {
        const fixedUaiFormation = uai_formation?.trim()?.toUpperCase();

        try {
          if (fixedUaiFormation !== formation?.uai_formation) {
            const result = await _put(`${CATALOGUE_API}/entity/formations/${formation._id}`, {
              uai_formation: fixedUaiFormation,
              ...(affelnet_statut === AFFELNET_STATUS.PUBLIE
                ? { affelnet_statut: AFFELNET_STATUS.PRET_POUR_INTEGRATION }
                : {}),
              last_update_who: user.email,
              last_update_at: Date.now(),
              editedFields: { ...formation?.editedFields, uai_formation: fixedUaiFormation },
              $push: {
                updates_history: buildUpdatesHistory(
                  formation,
                  {
                    uai_formation: fixedUaiFormation,
                    ...(affelnet_statut === AFFELNET_STATUS.PUBLIE
                      ? { affelnet_statut: AFFELNET_STATUS.PRET_POUR_INTEGRATION }
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
            isClosable: true,
          });
        } finally {
          setEdition(null);
          resolve("onSubmitHandler complete");
        }
      });
    },
  });

  const mountedRef = useRef(id);

  const fetchData = useCallback(() => {
    (async () => {
      const abortController = new AbortController();
      try {
        if (mountedRef.current !== id) return null;

        setLoading(true);
        // FIXME select={"__v" :0} hack to get updates_history
        const formation = await _get(`${CATALOGUE_API}/entity/formation/${encodeURIComponent(id)}?select={"__v":0}`, {
          signal: abortController.signal,
        });

        // don't display archived formations
        if (!formation.published) {
          throw new Error("Cette formation n'est pas publiée dans le catalogue");
        }

        setFormation(formation);
        setFieldValue("uai_formation", formation.uai_formation ?? "");

        const responsable = await _get(
          `${CATALOGUE_API}/entity/etablissement/${formation.etablissement_gestionnaire_siret}?select={"__v":0}`,
          {}
        );

        setResponsable(responsable);

        const candidatureRelation = await _get(
          `${CATALOGUE_API}/entity/candidature/relation?siret_responsable=${formation.etablissement_gestionnaire_siret}&siret_formateur=${formation.etablissement_formateur_siret}`,
          {
            signal: abortController.signal,
          }
        );

        setCandidatureRelation(candidatureRelation);

        setLoading(false);
      } catch (e) {
        if (mountedRef.current !== id) return null;
        setLoading(false);
      }
    })();
  }, [id, setFieldValue]);

  useEffect(() => {
    if (mountedRef.current !== id) return null;

    fetchData();

    return () => {
      mountedRef.current = null;
    };
  }, [fetchData, id]);

  const onEdit = (fieldName = null) => {
    setEdition(fieldName);
  };

  const title = loading
    ? ""
    : `${formation?.intitule_long ?? "Formation inconnue"} ${formation?.cle_ministere_educatif.includes("#LAD") ? " – 100% à distance" : ""}`;
  setTitle(title);

  const sendToParcoursup = useCallback(async () => {
    try {
      const response = await _post(`${CATALOGUE_API}/parcoursup/send-ws`, {
        id: formation?._id,
      });
      const message = response?.message;

      toast({
        title: "Succès",
        description: message,
        status: "success",
        duration: 10000,
        isClosable: true,
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
        isClosable: true,
      });
    }

    const response = await _get(`${CATALOGUE_API}/entity/formation/${formation?._id}?select={"__v":0}`);
    setFormation(response);
  }, [formation, toast]);

  const parcoursup_date_depublication = formation?.updates_history
    .sort(sortDescending)
    .filter((h) => h.to?.parcoursup_raison_depublication)[0]?.updated_at;
  const affelnet_date_depublication = formation?.updates_history
    .sort(sortDescending)
    .filter((h) => h.to?.affelnet_raison_depublication)[0]?.updated_at;

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
                    ((formation.parcoursup_session &&
                      ![PARCOURSUP_STATUS.PUBLIE, PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT].includes(
                        formation.parcoursup_statut
                      )) ||
                      formation.affelnet_session) /*&& ![AFFELNET_STATUS.A_DEFINIR].includes(formation.affelnet_statut)*/ &&
                    hasAccessTo(user, "page_formation/gestion_publication") && (
                      <PublishModalButton formation={formation} setFormation={setFormation} user={user} />
                    )}
                </Flex>
                {formation.catalogue_published && (
                  <Flex justifyContent={"space-between"} flexDirection={["column", "column", "row"]}>
                    <Flex my={[4, 4, "auto"]} gap={2} wrap={"wrap"}>
                      {hasAccessTo(user, "page_formation/voir_status_publication_ps") &&
                        (formation.parcoursup_perimetre ||
                          formation.parcoursup_statut !== PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT) && (
                          <>
                            <StatusBadge source="Parcoursup" status={formation.parcoursup_statut} />

                            {[PARCOURSUP_STATUS.PUBLIE].includes(formation.parcoursup_statut) && (
                              <>
                                {formation.parcoursup_published && formation.parcoursup_id ? (
                                  <Badge variant={"published"} minHeight={"28px"}>
                                    Parcoursup – Visible au public
                                  </Badge>
                                ) : (
                                  <Badge variant={"error"} minHeight={"28px"}>
                                    Parcoursup – Non visible au public (non paramétré)
                                  </Badge>
                                )}
                              </>
                            )}

                            {[PARCOURSUP_STATUS.PUBLIE, PARCOURSUP_STATUS.PRET_POUR_INTEGRATION].includes(
                              formation.parcoursup_statut
                            ) &&
                              (formation.updates_history.filter(
                                (history) =>
                                  history.to.parcoursup_statut === PARCOURSUP_STATUS.PRET_POUR_INTEGRATION &&
                                  new Date(history.updated_at).getTime() >= campagneStartDate?.getTime()
                              ).length >= 1 ? (
                                <Badge variant={"ok"} minHeight={"28px"}>
                                  Publication manuelle
                                </Badge>
                              ) : (
                                <Badge variant={"ok"} minHeight={"28px"}>
                                  Publication automatique
                                </Badge>
                              ))}

                            <PreviousStatusBadge
                              source="Parcoursup"
                              status={formation.parcoursup_previous_statut}
                              created_at={formation.created_at}
                            />
                          </>
                        )}
                      {hasAccessTo(user, "page_formation/voir_status_publication_aff") &&
                        (formation.affelnet_perimetre ||
                          formation.affelnet_statut !== AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT) && (
                          <>
                            <StatusBadge source="Affelnet" status={formation.affelnet_statut} />

                            {[AFFELNET_STATUS.PUBLIE, AFFELNET_STATUS.PRET_POUR_INTEGRATION].includes(
                              formation.affelnet_statut
                            ) &&
                              (formation.updates_history.filter(
                                (history) =>
                                  history.to.affelnet_statut === AFFELNET_STATUS.PRET_POUR_INTEGRATION &&
                                  new Date(history.updated_at).getTime() >= campagneStartDate?.getTime() - 31536000000
                              ).length >= 1 ? (
                                <Badge variant={"ok"} minHeight={"28px"}>
                                  Publication manuelle
                                </Badge>
                              ) : (
                                <Badge variant={"ok"} minHeight={"28px"}>
                                  Publication automatique
                                </Badge>
                              ))}

                            <PreviousStatusBadge
                              source="Affelnet"
                              status={formation.affelnet_previous_statut}
                              created_at={formation.created_at}
                            />
                          </>
                        )}

                      {!formation.affelnet_perimetre &&
                        !formation.parcoursup_perimetre &&
                        formation.affelnet_statut === AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT &&
                        formation.parcoursup_statut === PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT && (
                          <>
                            {hasAccessTo(user, "page_formation/voir_status_publication_aff") && (
                              <StatusBadge source="Affelnet" status="hors périmètre" />
                            )}

                            {hasAccessTo(user, "page_formation/voir_status_publication_ps") && (
                              <StatusBadge source="Parcoursup" status="hors périmètre" />
                            )}
                          </>
                        )}
                    </Flex>

                    <Flex
                      alignItems="center"
                      justifyContent={"space-between"}
                      flexDirection={["column", "column", "row"]}
                    >
                      {[PARCOURSUP_STATUS.ERROR, PARCOURSUP_STATUS.FERME, COMMON_STATUS.PRET_POUR_INTEGRATION].includes(
                        formation.parcoursup_statut
                      ) &&
                        hasAccessTo(user, "page_formation/envoi_parcoursup") && (
                          <Button textStyle="sm" variant="secondary" px={8} my={"auto"} onClick={sendToParcoursup}>
                            Forcer la publication Parcoursup
                          </Button>
                        )}

                      {[PARCOURSUP_STATUS.ERROR, PARCOURSUP_STATUS.PUBLIE, PARCOURSUP_STATUS.REJETE].includes(
                        formation.parcoursup_statut
                      ) &&
                        hasAccessTo(user, "page_formation/reinit_parcoursup") && (
                          <ReinitStatutModalButton formation={formation} setFormation={setFormation} />
                        )}
                    </Flex>
                  </Flex>
                )}

                {((formation.parcoursup_perimetre &&
                  // formation.parcoursup_previous_session &&
                  !formation.parcoursup_session) ||
                  (formation.affelnet_perimetre &&
                    // formation.affelnet_previous_session &&
                    !formation.affelnet_session)) &&
                  !formation.cle_me_remplace_par?.length && (
                    <Alert mt={4} type="warning">
                      La formation pourrait être dans le périmètre{" "}
                      {formation.parcoursup_perimetre ? "Parcoursup" : "Affelnet"}, mais ne possède pas de date de début
                      correspondant à la prochaine rentrée. S'il s'agit d'un problème de collecte, veuillez faire le
                      signalement auprès du Carif-Oref.
                    </Alert>
                  )}

                {hasAccessTo(user, "page_other/api_candidature_relation_find") &&
                  formation.affelnet_perimetre &&
                  (candidatureRelation ? (
                    <>
                      {candidatureRelation?.nombre_voeux &&
                        !candidatureRelation?.nombre_voeux_telecharges &&
                        !candidatureRelation?.intervention_since_last_session && (
                          <Alert mt={4} type={"warning"}>
                            <Text>
                              <Text as="b">
                                Candidatures non téléchargées lors de la précédente campagne de diffusion pour cet
                                organisme{" "}
                                {formation.etablissement_formateur_siret ===
                                formation.etablissement_gestionnaire_siret ? (
                                  <>responsable-formateur</>
                                ) : (
                                  <>formateur</>
                                )}
                                , toutes offres confondues.{" "}
                              </Text>
                            </Text>
                            <Link
                              textDecoration={"underline"}
                              isExternal
                              href={`${process.env.REACT_APP_CANDIDATURE_URL}/admin/etablissement/${candidatureRelation.siret_responsable}#${candidatureRelation.siret_formateur}`}
                            >
                              Vérifier et modifier le destinataire&nbsp;
                              <ExternalLinkLine w={"0.75rem"} h={"0.75rem"} />
                            </Link>
                            <Text>
                              <Text as="i" fontSize={"zeta"} color={"grey.600"}>
                                L’accès au site des candidatures vous permet de modifier le destinataire si vous en avez
                                connaissance. Vos modifications seront prises en compte pour la prochaine campagne de
                                diffusion.
                              </Text>
                            </Text>
                          </Alert>
                        )}
                    </>
                  ) : !config.diffusion ? (
                    <Alert mt={4} type={"info"}>
                      <Text>
                        <Text as="b">
                          Aucune candidature n'a été diffusée pour cet organisme{" "}
                          {formation.etablissement_formateur_siret === formation.etablissement_gestionnaire_siret ? (
                            <>responsable-formateur</>
                          ) : (
                            <>formateur</>
                          )}{" "}
                          (sauf en cas de modification de Siret survenu entre temps).
                        </Text>
                      </Text>

                      {!!responsable?.email_direction && (
                        <Text>
                          Si des offres sont publiées pour la prochaine campagne, le courriel utilisé pour la diffusion
                          sera : {responsable?.email_direction}.{" "}
                          <ResponsableEmailModalButton
                            formation={formation}
                            responsable={responsable}
                            callback={fetchData}
                          />
                        </Text>
                      )}
                    </Alert>
                  ) : (
                    <></>
                  ))}

                {formation.variante_a_distance && (
                  <Alert mt={4} type={"info"}>
                    La formation est également proposée dans une{" "}
                    <Link
                      textDecoration={"underline"}
                      href={`/formation/${encodeURIComponent(formation.variante_a_distance)}`}
                    >
                      version 100% à distance
                    </Link>
                    .
                  </Alert>
                )}
                {!!formation.variantes_en_presentiel?.length && (
                  <Alert mt={4} type={"info"}>
                    Cette offre 100% à distance est également proposée{" "}
                    {formation.variantes_en_presentiel?.length === 1 ? (
                      <Link
                        textDecoration={"underline"}
                        href={`/formation/${encodeURIComponent(formation.variantes_en_presentiel[0]?.cle)}`}
                      >
                        en présentiel.
                      </Link>
                    ) : (
                      <>
                        en présentiel dans les villes suivantes:
                        <UnorderedList>
                          {formation.variantes_en_presentiel?.map(({ cle, localite }) => (
                            <ListItem>
                              <Link textDecoration={"underline"} href={`/formation/${encodeURIComponent(cle)}`}>
                                {localite}
                              </Link>
                            </ListItem>
                          ))}
                        </UnorderedList>
                      </>
                    )}
                  </Alert>
                )}

                {hasAccessTo(user, "page_formation/voir_status_publication_ps") &&
                  [PARCOURSUP_STATUS.PRET_POUR_INTEGRATION, PARCOURSUP_STATUS.REJETE].includes(
                    formation.parcoursup_statut
                  ) &&
                  !!formation.parcoursup_error && <RejectionBlock formation={formation} />}

                {hasAccessTo(user, "page_formation/voir_status_publication_ps") &&
                  [PARCOURSUP_STATUS.ERROR].includes(formation.parcoursup_statut) && (
                    <Alert mt={4} type={"warning"}>
                      Une erreur non gérée est survenue lors de l'envoi à Parcoursup : {formation.parcoursup_error}
                      <br />
                      Une nouvelle tentative d'envoi sera effectuée cette nuit.
                      <br />
                      Si l'erreur persiste, vous pouvez envoyez un message dans la rubrique contact Parcoursup avec
                      l’URL catalogue de l’offre.
                    </Alert>
                  )}

                {hasAccessTo(user, "page_formation/voir_status_publication_ps") &&
                  formation.parcoursup_raison_depublication && (
                    <Alert mt={4} type={"info"}>
                      Motif de non publication
                      {!!parcoursup_date_depublication && (
                        <> ({new Date(parcoursup_date_depublication).toLocaleDateString("fr-FR")})</>
                      )}{" "}
                      : <b>{formation.parcoursup_raison_depublication}</b>
                      {formation.parcoursup_raison_depublication_precision
                        ? ` (${formation.parcoursup_raison_depublication_precision})`
                        : ""}
                    </Alert>
                  )}
                {hasAccessTo(user, "page_formation/voir_status_publication_af") &&
                  formation.affelnet_raison_depublication && (
                    <Alert mt={4} type={"info"}>
                      Motif de non publication
                      {!!affelnet_date_depublication && (
                        <> ({new Date(affelnet_date_depublication).toLocaleDateString("fr-FR")})</>
                      )}{" "}
                      : <b>{formation.affelnet_raison_depublication}</b>
                      {formation.affelnet_raison_depublication_precision
                        ? ` (${formation.affelnet_raison_depublication_precision})`
                        : ""}
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
    </Layout>
  );
};
