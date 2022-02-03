import React, { useEffect, useState } from "react";
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
import { ArrowDownLine, ExternalLinkLine, MapPin2Fill, Parametre } from "../../theme/components/icons/";
import { Breadcrumb } from "../../common/components/Breadcrumb";
import { setTitle } from "../../common/utils/pageUtils";
import { EditableField } from "../../common/components/formation/EditableField";
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
  const { isOpen: isComputedAdressOpen, onToggle: onComputedAdressToggle } = useDisclosure();

  return (
    <Box borderRadius={4}>
      <Grid templateColumns="repeat(12, 1fr)">
        <GridItem colSpan={[12, 12, 7]} bg="white" border="1px solid" borderColor="bluefrance">
          <DescriptionBlock formation={formation} />
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

              <Text mb={formation?.lieu_formation_adresse_computed ? 0 : 4}>
                Adresse :{" "}
                <Text as="span" variant="highlight">
                  {formation.lieu_formation_adresse}
                </Text>{" "}
                <InfoTooltip description={helpText.formation.lieu_formation_adresse} />
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
                  <Collapse in={isComputedAdressOpen} animateOpacity>
                    <Text mb={4}>
                      <Text fontSize={"zeta"} color={"grey.600"} as="span">
                        {formation.lieu_formation_adresse_computed}
                      </Text>{" "}
                      <InfoTooltip description={helpText.formation.lieu_formation_adresse_computed} />
                    </Text>
                  </Collapse>
                </Box>
              )}

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
              <Text mb={4}>
                Code commune :{" "}
                <Text as="span" variant="highlight">
                  {formation.code_commune_insee}
                </Text>{" "}
                <InfoTooltip description={helpText.formation.code_commune_insee} />
              </Text>
              <Text mb={8}>
                Département :{" "}
                <Text as="span" variant="highlight">
                  {formation.nom_departement} ({formation.num_departement})
                </Text>{" "}
                <InfoTooltip description={helpText.formation.nom_departement} />
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

  const [edition, setEdition] = useState(null);
  let history = useHistory();
  const { isOpen: isOpenPublishModal, onOpen: onOpenPublishModal, onClose: onClosePublishModal } = useDisclosure();

  const [user] = useAuth();
  const hasRightToEdit = hasRightToEditFormation(formation, user);

  const { values, handleSubmit, handleChange, setFieldValue, isSubmitting } = useFormik({
    initialValues: {
      uai_formation: "",
    },
    onSubmit: ({ uai_formation }) => {
      return new Promise(async (resolve) => {
        const trimedUaiFormation = uai_formation?.rim();

        try {
          if (trimedUaiFormation !== formation["uai_formation"]) {
            const updatedFormation = await _post(`${endpointNewFront}/entity/formation/update`, {
              ...formation,
              uai_formation: trimedUaiFormation,
              withCodePostalUpdate: false,
            });

            const result = await _put(`${endpointNewFront}/entity/formations/${formation._id}`, {
              ...updatedFormation,
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

  useEffect(() => {
    async function run() {
      try {
        const apiURL = `${endpointNewFront}/entity/formation/`;
        // FIXME select={"__v" :0} hack to get updates_history
        const form = await _get(`${apiURL}${match.params.id}?select={"__v":0}`, false);

        // don't display archived formations
        if (!form.published) {
          throw new Error("Cette formation n'est pas publiée dans le catalogue");
        }

        setFormation(form);
        setFieldValue("uai_formation", form.uai_formation ?? "");
      } catch (e) {
        history.push("/404");
      }
    }
    run();
  }, [match, setFieldValue, history]);

  const onEdit = (fieldName = null) => {
    setEdition(fieldName);
  };

  const title = `${formation?.intitule_long}`;
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
                  formation &&
                  (formation.etablissement_reference_catalogue_published
                    ? ` (${CATALOGUE_GENERAL_LABEL})`
                    : ` (${CATALOGUE_NON_ELIGIBLE_LABEL})`)
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
                  {hasRightToEdit &&
                    formation.etablissement_reference_catalogue_published &&
                    hasAccessTo(user, "page_formation/gestion_publication") && (
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
                  <Flex justifyContent={"space-between"} flexDirection={["column", "column", "row"]}>
                    <Box mt={5}>
                      {hasAccessTo(user, "page_formation/voir_status_publication_ps") && (
                        <StatusBadge source="Parcoursup" status={formation.parcoursup_statut} mr={[0, 3]} />
                      )}
                      {hasAccessTo(user, "page_formation/voir_status_publication_aff") && (
                        <StatusBadge source="Affelnet" status={formation.affelnet_statut} mt={[1, 0]} />
                      )}
                    </Box>
                    <Flex>
                      {formation.parcoursup_statut === COMMON_STATUS.EN_ATTENTE &&
                        hasAccessTo(user, "page_formation/envoi_parcoursup") && (
                          <Button textStyle="sm" variant="secondary" px={8} mt={4} onClick={sendToParcoursup}>
                            Forcer la publication Parcoursup
                          </Button>
                        )}
                    </Flex>
                  </Flex>
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
