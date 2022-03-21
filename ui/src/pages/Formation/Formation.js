import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Button,
  Center,
  Collapse,
  Container,
  Flex,
  Grid,
  GridItem,
  Heading,
  Link,
  Spinner,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useHistory } from "react-router-dom";
import { useFormik } from "formik";
import { _get, _post, _put } from "../../common/httpClient";
import Layout from "../layout/Layout";
import useAuth from "../../common/hooks/useAuth";
import { hasAccessTo, hasRightToEditFormation } from "../../common/utils/rolesUtils";
import { StatusBadge } from "../../common/components/StatusBadge";
import { PublishModal } from "../../common/components/formation/PublishModal";
import { buildUpdatesHistory } from "../../common/utils/historyUtils";
import InfoTooltip from "../../common/components/InfoTooltip";
import helpText from "../../locales/helpText.json";
import {
  ArrowDownLine,
  ExclamationCircle,
  ExternalLinkLine,
  MapPin2Fill,
  Parametre,
} from "../../theme/components/icons/";
import { Breadcrumb } from "../../common/components/Breadcrumb";
import { setTitle } from "../../common/utils/pageUtils";
import { getOpenStreetMapUrl } from "../../common/utils/mapUtils";
import { EditableField } from "../../common/components/formation/EditableField";
import { StatutHistoryBlock } from "../../common/components/formation/StatutHistoryBlock";
import { DescriptionBlock } from "../../common/components/formation/DescriptionBlock";
import { OrganismesBlock } from "../../common/components/formation/OrganismesBlock";
import { CATALOGUE_GENERAL_LABEL, CATALOGUE_NON_ELIGIBLE_LABEL } from "../../constants/catalogueLabels";
import { COMMON_STATUS } from "../../constants/status";

const endpointNewFront = `${process.env.REACT_APP_BASE_URL}/api`;

const endpointLBA = process.env.REACT_APP_ENDPOINT_LBA || "https://labonnealternance.pole-emploi.fr";

const getLBAUrl = ({ cle_ministere_educatif = "" }) => {
  return `${endpointLBA}/recherche-apprentissage?&display=list&page=fiche&type=training&itemId=${encodeURIComponent(
    cle_ministere_educatif
  )}`;
};

const Formation = ({ formation, edition, onEdit, handleChange, handleSubmit, values, hasRightToEdit }) => {
  // Distance tolérer entre l'adresse et les coordonnées transmise par RCO
  const seuilDistance = 100;

  const { isOpen: isComputedAdressOpen, onToggle: onComputedAdressToggle } = useDisclosure(
    formation.distance > seuilDistance
  );
  const { isOpen: isComputedGeoCoordOpen, onToggle: onComputedGeoCoordToggle } = useDisclosure(
    formation.distance > seuilDistance
  );

  const UaiFormationContainer = formation.uai_formation_valide
    ? React.Fragment
    : (args) => (
        <Box
          data-testid={"uai-warning"}
          bg={"orangesoft.200"}
          p={4}
          mb={4}
          borderLeft={"4px solid"}
          borderColor={"orangesoft.500"}
          w={"full"}
          {...args}
        />
      );

  const AdresseContainer = React.Fragment;
  // seuilDistance >= formation.distance
  //   ? React.Fragment
  //   : (args) => (
  //       <Box
  //         data-testid={"adress-warning"}
  //         bg={"orangemedium.200"}
  //         p={4}
  //         mb={4}
  //         borderLeft={"4px solid"}
  //         borderColor={"orangemedium.500"}
  //         w={"full"}
  //         {...args}
  //       />
  //     );

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
            <Heading textStyle="h4" color="grey.800">
              <MapPin2Fill w="12px" h="15px" mr="5px" mb="5px" />
              Lieu de la formation
            </Heading>
            <Box mt={2} mb={4} ml={[-2, -2, -3]}>
              <Link href={getLBAUrl(formation)} textStyle="rf-text" variant="pill" isExternal>
                voir sur labonnealternance <ExternalLinkLine w={"0.75rem"} h={"0.75rem"} mb={"0.125rem"} />
              </Link>
            </Box>

            <Box>
              <UaiFormationContainer>
                <EditableField
                  fieldName={"uai_formation"}
                  label={"UAI du lieu de formation"}
                  formation={formation}
                  edition={edition}
                  onEdit={onEdit}
                  values={values}
                  handleSubmit={handleSubmit}
                  handleChange={handleChange}
                  hasRightToEdit={hasRightToEdit}
                  mb={formation?.uai_formation_valide ? 4 : 0}
                />
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
                          <Link
                            href={getOpenStreetMapUrl(formation.lieu_formation_geo_coordonnees_computed)}
                            textStyle="rf-text"
                            variant="pill"
                            title="Voir sur GeoPortail"
                            isExternal
                          >
                            {formation.lieu_formation_geo_coordonnees_computed}
                          </Link>
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
                          <Link
                            href={getOpenStreetMapUrl(formation.lieu_formation_geo_coordonnees)}
                            textStyle="rf-text"
                            variant="pill"
                            title="Voir sur GeoPortail"
                            isExternal
                          >
                            {formation.lieu_formation_adresse_computed}
                          </Link>
                        </Text>{" "}
                        <InfoTooltip description={helpText.formation.lieu_formation_adresse_computed} />
                      </Text>
                    </Collapse>
                  </Box>
                )}
              </AdresseContainer>

              <Text mb={4}>
                Code commune :{" "}
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
          {(formation?.affelnet_published_date ?? formation?.parcoursup_published_date) && (
            <Box mb={[0, 0, 16]}>
              <Heading textStyle="h4" color="grey.800" mb={4}>
                Autres informations
              </Heading>
              {formation?.affelnet_published_date && (
                <Text mb={4}>
                  Date de publication sur Affelnet :{" "}
                  <Text as="span" variant="highlight">
                    {new Date(formation.affelnet_published_date).toLocaleDateString("fr-FR")}
                  </Text>{" "}
                  <InfoTooltip description={helpText.formation.affelnet_published_date} />
                </Text>
              )}
              {formation?.parcoursup_published_date && (
                <Text mb={4}>
                  Date de publication sur Parcoursup :{" "}
                  <Text as="span" variant="highlight">
                    {new Date(formation.parcoursup_published_date).toLocaleDateString("fr-FR")}
                  </Text>{" "}
                  <InfoTooltip description={helpText.formation.parcoursup_published_date} />
                </Text>
              )}
            </Box>
          )}
          {(formation?.affelnet_statut_history?.length || formation?.parcoursup_statut_history?.length) && (
            <Box mb={[0, 0, 16]}>
              <StatutHistoryBlock formation={formation} />
            </Box>
          )}
        </GridItem>
      </Grid>
    </Box>
  );
};

export default ({ match }) => {
  const toast = useToast();
  const [formation, setFormation] = useState();
  const [loading, setLoading] = useState(false);

  const [edition, setEdition] = useState(null);
  const history = useHistory();
  const { isOpen: isOpenPublishModal, onOpen: onOpenPublishModal, onClose: onClosePublishModal } = useDisclosure();

  const [user] = useAuth();
  const hasRightToEdit = hasRightToEditFormation(formation, user);

  const { values, handleSubmit, handleChange, setFieldValue, isSubmitting } = useFormik({
    initialValues: {
      uai_formation: "",
    },
    onSubmit: ({ uai_formation }) => {
      return new Promise(async (resolve) => {
        const trimedUaiFormation = uai_formation?.trim();

        try {
          if (trimedUaiFormation !== formation["uai_formation"]) {
            const result = await _put(`${endpointNewFront}/entity/formations/${formation._id}`, {
              uai_formation: trimedUaiFormation,
              last_update_who: user.email,
              last_update_at: Date.now(),
              editedFields: { ...formation?.editedFields, uai_formation: trimedUaiFormation },
              updates_history: buildUpdatesHistory(
                formation,
                { uai_formation: trimedUaiFormation, last_update_who: user.email },
                ["uai_formation"]
              ),
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
            title: "Error",
            description: message,
            status: "error",
            duration: 10000,
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
        const apiURL = `${endpointNewFront}/entity/formation/`;
        // FIXME select={"__v" :0} hack to get updates_history
        const form = await _get(`${apiURL}${match.params.id}?select={"__v":0}`, false);

        if (!mountedRef.current) return null;
        // don't display archived formations
        if (!form.published) {
          throw new Error("Cette formation n'est pas publiée dans le catalogue");
        }

        setLoading(false);
        setFormation(form);
        setFieldValue("uai_formation", form.uai_formation ?? "");
      } catch (e) {
        if (!mountedRef.current) return null;
        setLoading(false);
      }
    })();

    return () => {
      mountedRef.current = false;
    };
  }, [match, setFieldValue]);

  const onEdit = (fieldName = null) => {
    setEdition(fieldName);
  };

  const title = loading ? "" : `${formation?.intitule_long ?? "Formation inconnue"}`;
  setTitle(title);

  const sendToParcoursup = async () => {
    try {
      const updated = await _post(`${endpointNewFront}/parcoursup/send-ws`, {
        id: formation._id,
      });
      setFormation(updated);
    } catch (e) {
      console.error("Can't send to ws", e);

      const response = await (e?.json ?? {});
      const message = response?.message ?? e?.message;

      toast({
        title: "Error",
        description: message,
        status: "error",
        duration: 10000,
      });
    }
  };

  return (
    <Layout>
      <Box w="100%" pt={[4, 8]} px={[1, 1, 12, 24]}>
        <Container maxW="xl">
          <Breadcrumb
            pages={[
              { title: "Accueil", to: "/" },
              {
                title: `Catalogue des formations en apprentissage
                ${
                  !!formation
                    ? formation.etablissement_reference_catalogue_published
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
        <Container maxW="xl">
          {loading && (
            <Center h="70vh">
              <Spinner />
            </Center>
          )}

          {hasAccessTo(user, "page_formation") && !loading && formation && (
            <>
              <Box mb={8}>
                <Flex alignItems="center" justify="space-between" flexDirection={["column", "column", "row"]}>
                  <Box>
                    <Heading textStyle="h2" color="grey.800" pr={[0, 0, 8]} mb={4}>
                      {title} <InfoTooltip description={helpText.formation.intitule_long} />
                    </Heading>
                  </Box>
                  {hasRightToEdit &&
                    formation.etablissement_reference_catalogue_published &&
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
                      >
                        <Parametre mr={2} />
                        Gérer les publications
                      </Button>
                    )}
                </Flex>
                {formation.etablissement_reference_catalogue_published && (
                  <Flex justifyContent={"space-between"} flexDirection={["column", "column", "row"]}>
                    <Box mt={5}>
                      {hasAccessTo(user, "page_formation/voir_status_publication_ps") && (
                        <StatusBadge source="Parcoursup" status={formation.parcoursup_statut} mr={[0, 3]} />
                      )}
                      {hasAccessTo(user, "page_formation/voir_status_publication_aff") && (
                        <StatusBadge source="Affelnet" status={formation.affelnet_statut} mt={[2, 0]} />
                      )}
                    </Box>
                    <Flex
                      alignItems="center"
                      justifyContent={"space-between"}
                      flexDirection={["column", "column", "row"]}
                    >
                      {formation.parcoursup_statut === COMMON_STATUS.EN_ATTENTE &&
                        hasAccessTo(user, "page_formation/envoi_parcoursup") && (
                          <Button textStyle="sm" variant="secondary" px={8} mt={4} onClick={sendToParcoursup}>
                            Forcer la publication Parcoursup
                          </Button>
                        )}
                    </Flex>
                  </Flex>
                )}

                {formation.parcoursup_statut === COMMON_STATUS.EN_ATTENTE && formation.parcoursup_error && (
                  <Box bg={"grey.100"} p={4} mt={4} borderLeft={"4px solid"} borderColor={"orangesoft.500"} w={"full"}>
                    <Text>
                      <ExclamationCircle color="orangesoft.500" mr={2} boxSize={6} mb={1} />
                      Erreur de publication sur Parcoursup :{" "}
                      <Text as="span" variant="highlight" bg={"transparent"}>
                        {formation.parcoursup_error}
                      </Text>
                    </Text>
                  </Box>
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
                <Heading textStyle="h2" color="grey.800" pr={[0, 0, 8]}>
                  {title}
                </Heading>
                <Button
                  textStyle="sm"
                  variant="primary"
                  minW={null}
                  px={8}
                  mt={[8, 8, 0]}
                  onClick={() => {
                    history.push("/recherche/formations");
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
    </Layout>
  );
};
