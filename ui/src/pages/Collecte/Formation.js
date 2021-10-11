import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Center,
  Container,
  Flex,
  Grid,
  GridItem,
  Heading,
  Link,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import { _post, _put } from "../../common/httpClient";
import useAuth from "../../common/hooks/useAuth";
import { hasAccessTo, hasRightToEditFormation } from "../../common/utils/rolesUtils";
import { ReactComponent as InfoIcon } from "../../theme/assets/info-circle.svg";
import { buildUpdatesHistory } from "../../common/utils/formationUtils";
import InfoTooltip from "../../common/components/InfoTooltip";
import helpText from "../../locales/helpText.json";
import { ExternalLinkLine, MapPin2Fill } from "../../theme/components/icons";
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
              <Link
                href={getLBAUrl(formation)}
                textStyle="rf-text"
                variant="pill"
                isExternal
                onClick={(e) => e.preventDefault()}
              >
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
              <Text mb={4}>
                Académie :{" "}
                <Text as="span" variant="highlight">
                  {displayedFormation.nom_academie} ({displayedFormation.num_academie})
                </Text>{" "}
                <InfoTooltip description={helpText.formation.academie} />
              </Text>
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
                mb={4}
              />
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
              <Text mb={4}>
                Département :{" "}
                <Text as="span" variant="highlight">
                  {displayedFormation.nom_departement} ({displayedFormation.num_departement})
                </Text>{" "}
                <InfoTooltip description={helpText.formation.nom_departement} />
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

const FormationContainer = ({ formation }) => {
  // const [formation, setFormation] = useState(formation);
  const [pendingFormation, setPendingFormation] = useState();

  const [edition, setEdition] = useState(null);

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
              // setFormation(result);
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
        } finally {
          setEdition(null);
          resolve("onSubmitHandler complete");
        }
      });
    },
  });

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
    <Box border="1px solid" borderColor="bluefrance" w="full">
      <Flex px={[4, 16]} pb={[4, 16]} flexDirection="column">
        <Box w="100%" pt={[4, 8]}>
          <Container maxW="xl">
            <Heading as="h3" fontSize="1.5rem" mt={3} mb={5}>
              Résumé de la formation
            </Heading>

            <Heading textStyle="h2" color="grey.800" pr={[0, 0, 8]} fontSize="1.3rem">
              {formation &&
                (formation.etablissement_reference_catalogue_published
                  ? " Catalogue général"
                  : " Catalogue non-éligible")}
            </Heading>
          </Container>
        </Box>
        <Box w="100%" py={[1, 8]}>
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
                    <Heading textStyle="h3" color="grey.800" pr={[0, 0, 8]} fontSize="1rem">
                      {title} <InfoTooltip description={helpText.formation.intitule_long} />
                    </Heading>
                  </Flex>
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
                {/* {hasAccessTo(user, "page_formation/supprimer_formation") && !edition && hasRightToEdit && ( */}
                <Flex justifyContent={["center", "flex-end"]} my={[6, 12]}>
                  <Button variant="primary" disabled px={[8, 8]} mr={[0, 12]}>
                    Enregistrer la formation
                  </Button>
                  <Button
                    variant="outline"
                    colorScheme="red"
                    onClick={onDelete}
                    disabled
                    px={[8, 8]}
                    mr={[0, 12]}
                    borderRadius="none"
                  >
                    Annuler la formation
                  </Button>
                </Flex>
                {/* )} */}
              </>
            )}
          </Container>
        </Box>
      </Flex>
    </Box>
  );
};

export { FormationContainer };
