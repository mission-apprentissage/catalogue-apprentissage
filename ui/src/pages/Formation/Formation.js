import React, { useEffect, useState } from "react";
import {
  Alert,
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
import { ReactComponent as InfoIcon } from "../../theme/assets/info-circle.svg";
import { PublishModal } from "../../common/components/formation/PublishModal";
import { buildUpdatesHistory } from "../../common/utils/formationUtils";
import InfoTooltip from "../../common/components/InfoTooltip";
import helpText from "../../locales/helpText.json";
import { ArrowDownLine, ExternalLinkLine, MapPin2Fill, Parametre } from "../../theme/components/icons/";
import { Breadcrumb } from "../../common/components/Breadcrumb";
import { setTitle } from "../../common/utils/pageUtils";
import { EditableField } from "../../common/components/formation/EditableField";
import { DescriptionBlock } from "../../common/components/formation/DescriptionBlock";
import { OrganismesBlock } from "../../common/components/formation/OrganismesBlock";

const endpointNewFront = `${process.env.REACT_APP_BASE_URL}/api`;

const endpointLBA = process.env.REACT_APP_ENDPOINT_LBA || "https://labonnealternance.pole-emploi.fr";

const getLBAUrl = ({ _id = "" }) => {
  return `${endpointLBA}/recherche-apprentissage?&display=list&page=fiche&type=training&itemId=${_id}`;
};

const Formation = ({
  formation,
  edition,
  onEdit,
  handleChange,
  handleSubmit,
  values,
  hasRightToEdit,
  pendingFormation,
}) => {
  const displayedFormation = pendingFormation ?? formation;

  const { isOpen: isComputedAdressOpen, onToggle: onComputedAdressToggle } = useDisclosure();

  return (
    <Box borderRadius={4}>
      {pendingFormation && (
        <Alert status="info" justifyContent="center">
          <Box mr={1}>
            <InfoIcon />
          </Box>
          Cette formation a été {pendingFormation.published ? "éditée" : "supprimée"} et est en attente de traitement
        </Alert>
      )}
      <Grid templateColumns="repeat(12, 1fr)">
        <GridItem colSpan={[12, 12, 7]} bg="white" border="1px solid" borderColor="bluefrance">
          <DescriptionBlock formation={formation} pendingFormation={pendingFormation} />
        </GridItem>
        <GridItem colSpan={[12, 12, 5]} py={8}>
          <Box mb={16}>
            <Heading textStyle="h4" color="grey.800" px={8}>
              <MapPin2Fill w="12px" h="15px" mr="5px" mb="5px" />
              Lieu de la formation
            </Heading>
            <Box mt={2} mb={4} px={5}>
              <Link href={getLBAUrl(formation)} textStyle="rf-text" variant="pill" isExternal>
                voir sur un plan <ExternalLinkLine w={"0.75rem"} h={"0.75rem"} mb={"0.125rem"} />
              </Link>
            </Box>

            <Box px={8}>
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
                mb={4}
              />
              <EditableField
                fieldName={"lieu_formation_adresse"}
                label={"Adresse"}
                formation={displayedFormation}
                edition={edition}
                onEdit={onEdit}
                values={values}
                handleSubmit={handleSubmit}
                handleChange={handleChange}
                hasRightToEdit={hasRightToEdit}
                mb={displayedFormation?.lieu_formation_adresse_computed ? 0 : 4}
              />

              {displayedFormation?.lieu_formation_adresse_computed && (
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
                  <Collapse in={isComputedAdressOpen} animateOpacity>
                    <Text mb={4}>
                      <Text fontSize={"zeta"} color={"grey.600"} as="span">
                        {displayedFormation.lieu_formation_adresse_computed}
                      </Text>{" "}
                      <InfoTooltip description={helpText.formation.lieu_formation_adresse_computed} />
                    </Text>
                  </Collapse>
                </Box>
              )}

              <EditableField
                fieldName={"code_postal"}
                label={"Code postal"}
                formation={displayedFormation}
                edition={edition}
                onEdit={onEdit}
                values={values}
                handleSubmit={handleSubmit}
                handleChange={handleChange}
                hasRightToEdit={hasRightToEdit}
                mb={4}
              />
              <Text mb={4}>
                Commune :{" "}
                <Text as="span" variant="highlight">
                  {displayedFormation.localite}
                </Text>{" "}
                <InfoTooltip description={helpText.formation.localite} />
              </Text>
              <EditableField
                fieldName={"code_commune_insee"}
                label={"Code commune"}
                formation={displayedFormation}
                edition={edition}
                onEdit={onEdit}
                values={values}
                handleSubmit={handleSubmit}
                handleChange={handleChange}
                hasRightToEdit={hasRightToEdit}
                mb={4}
              />
              <Text mb={8}>
                Département :{" "}
                <Text as="span" variant="highlight">
                  {displayedFormation.nom_departement} ({displayedFormation.num_departement})
                </Text>{" "}
                <InfoTooltip description={helpText.formation.nom_departement} />
              </Text>
              <Text mb={4}>
                Académie de rattachement :{" "}
                <Text as="span" variant="highlight">
                  {displayedFormation.nom_academie} ({displayedFormation.num_academie})
                </Text>{" "}
                <InfoTooltip description={helpText.formation.academie} />
              </Text>
            </Box>
          </Box>
          <Box mb={[0, 0, 16]} px={8}>
            <OrganismesBlock formation={formation} />
          </Box>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default ({ match }) => {
  const toast = useToast();
  const [formation, setFormation] = useState();
  const [pendingFormation, setPendingFormation] = useState();

  const [edition, setEdition] = useState(null);
  let history = useHistory();
  const { isOpen: isOpenPublishModal, onOpen: onOpenPublishModal, onClose: onClosePublishModal } = useDisclosure();

  const [user] = useAuth();
  const hasRightToEdit = hasRightToEditFormation(formation, user);

  const { values, handleSubmit, handleChange, setFieldValue, isSubmitting } = useFormik({
    initialValues: {
      uai_formation: "",
      code_postal: "",
      lieu_formation_adresse: "",
      code_commune_insee: "",
    },
    onSubmit: (values) => {
      return new Promise(async (resolve) => {
        try {
          const directChangeKeys = ["uai_formation"];
          const directChangeValues = directChangeKeys.reduce((acc, key) => {
            acc[key] = values[key] || null;
            return acc;
          }, {});
          const actualDirectChangeKeys = directChangeKeys.filter((key) => directChangeValues[key] !== formation[key]);
          const actualDirectChangeValues = actualDirectChangeKeys.reduce((acc, key) => {
            acc[key] = directChangeValues[key];
            return acc;
          }, {});

          if (actualDirectChangeKeys.length > 0) {
            const updatedFormation = await _post(`${endpointNewFront}/entity/formation2021/update`, {
              ...formation,
              ...actualDirectChangeValues,
            });

            const result = await _put(`${endpointNewFront}/entity/formations2021/${formation._id}`, {
              ...updatedFormation,
              last_update_who: user.email,
              last_update_at: Date.now(),
              editedFields: { ...formation?.editedFields, ...actualDirectChangeValues },
              updates_history: buildUpdatesHistory(
                formation,
                { ...actualDirectChangeValues, last_update_who: user.email },
                actualDirectChangeKeys
              ),
            });
            if (result) {
              setFormation(result);
              setFieldValue("uai_formation", result?.uai_formation ?? "");
            }
          }

          const pendingChangeKeys = Object.keys(values).filter((key) => !directChangeKeys.includes(key));
          const pendingChangeValues = pendingChangeKeys.reduce((acc, key) => {
            acc[key] = values[key] || null;
            return acc;
          }, {});
          const actualPendingChangeKeys = pendingChangeKeys.filter(
            (key) => pendingChangeValues[key] !== (pendingFormation ?? formation)[key]
          );
          const actualPendingChangeValues = actualPendingChangeKeys.reduce((acc, key) => {
            acc[key] = pendingChangeValues[key];
            return acc;
          }, {});

          if (actualPendingChangeKeys.length > 0) {
            const updatedFormation = await _post(`${endpointNewFront}/entity/formation2021/update`, {
              ...formation,
              ...pendingChangeValues,
            });

            let result = await _post(`${endpointNewFront}/entity/pendingRcoFormation`, {
              ...updatedFormation,
              last_update_who: user.email,
              last_update_at: Date.now(),
              updates_history: buildUpdatesHistory(
                pendingFormation ?? formation,
                { ...actualPendingChangeValues, last_update_who: user.email },
                actualPendingChangeKeys
              ),
            });
            if (result) {
              setPendingFormation(result);
              setFieldValue("code_postal", result?.code_postal ?? formation.code_postal ?? "");
              setFieldValue(
                "lieu_formation_adresse",
                result?.lieu_formation_adresse ?? formation.lieu_formation_adresse ?? ""
              );
              setFieldValue("code_commune_insee", result?.code_commune_insee ?? formation.code_commune_insee ?? "");
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

  useEffect(() => {
    async function run() {
      try {
        let pendingRCOFormation;

        const apiURL = `${endpointNewFront}/entity/formation2021/`;
        // FIXME select={"__v" :0} hack to get updates_history
        const form = await _get(`${apiURL}${match.params.id}?select={"__v":0}`, false);
        setFormation(form);

        try {
          pendingRCOFormation = await _get(
            `${endpointNewFront}/entity/pendingRcoFormation/${form.id_rco_formation}`,
            false
          );
          setPendingFormation(pendingRCOFormation);
        } catch (err) {
          // no pending formation, do nothing
        }

        // values from catalog data
        setFieldValue("uai_formation", form.uai_formation ?? "");

        // values from pending rco data
        setFieldValue("code_postal", pendingRCOFormation?.code_postal ?? form.code_postal ?? "");
        setFieldValue(
          "lieu_formation_adresse",
          pendingRCOFormation?.lieu_formation_adresse ?? form.lieu_formation_adresse ?? ""
        );
        setFieldValue("code_commune_insee", pendingRCOFormation?.code_commune_insee ?? form.code_commune_insee ?? "");
      } catch (e) {
        history.push("/404");
      }
    }
    run();
  }, [match, setFieldValue, history]);

  const onEdit = (fieldName = null) => {
    setEdition(fieldName);
  };

  const onDelete = async () => {
    // eslint-disable-next-line no-restricted-globals
    const areYousure = confirm("Souhaitez-vous vraiment supprimer cette formation ?");
    if (areYousure) {
      // Update as not published
      let result = await _post(`${endpointNewFront}/entity/pendingRcoFormation`, {
        ...formation,
        published: false,
      });
      if (result) {
        setPendingFormation(result);
      }
    }
  };

  const title = `${pendingFormation?.intitule_long ?? formation?.intitule_long}`;
  setTitle(title);

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
                  formation &&
                  (formation.etablissement_reference_catalogue_published
                    ? " (Catalogue général)"
                    : " (Catalogue non-éligible)")
                }`,
                to: "/recherche/formations",
              },
              { title: title },
            ]}
          />
        </Container>
      </Box>
      <Box w="100%" py={[1, 8]} px={[1, 1, 12, 24]}>
        <Container maxW="xl">
          {!formation && (
            <Center h="70vh">
              <Spinner />
            </Center>
          )}

          {hasAccessTo(user, "page_formation") && formation && (
            <>
              <Box mb={8}>
                <Flex alignItems="center" justify="space-between" flexDirection={["column", "column", "row"]}>
                  <Heading textStyle="h2" color="grey.800" pr={[0, 0, 8]}>
                    {title} <InfoTooltip description={helpText.formation.intitule_long} />
                  </Heading>
                  {hasRightToEdit && formation.etablissement_reference_catalogue_published && (
                    <Button
                      textStyle="sm"
                      variant="primary"
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
                  <Box mt={5}>
                    {hasAccessTo(user, "page_formation/voir_status_publication_ps") && (
                      <StatusBadge source="Parcoursup" status={formation.parcoursup_statut} mr={[0, 3]} />
                    )}
                    {hasAccessTo(user, "page_formation/voir_status_publication_aff") && (
                      <StatusBadge source="Affelnet" status={formation.affelnet_statut} mt={[1, 0]} />
                    )}
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
                onDelete={onDelete}
                pendingFormation={pendingFormation}
              />
              {hasAccessTo(user, "page_formation/supprimer_formation") && !edition && hasRightToEdit && (
                <Flex justifyContent={["center", "flex-end"]} my={[6, 12]}>
                  <Button
                    variant="outline"
                    colorScheme="red"
                    onClick={onDelete}
                    disabled={formation.published === false || pendingFormation?.published === false}
                    px={[8, 8]}
                    mr={[0, 12]}
                    borderRadius="none"
                  >
                    Supprimer la formation
                  </Button>
                </Flex>
              )}
            </>
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
