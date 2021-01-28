import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Flex,
  Grid,
  GridItem,
  Heading,
  Input,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  FormControl,
  FormLabel,
  Center,
  RadioGroup,
  Radio,
  Stack,
  useDisclosure,
} from "@chakra-ui/react";
import { NavLink, useHistory, useLocation } from "react-router-dom";
import { useFormik } from "formik";
import queryString from "query-string";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { _get, _post, _put } from "../../common/httpClient";
import Layout from "../layout/Layout";
import useAuth from "../../common/hooks/useAuth";
import { hasRightToEditFormation } from "../../common/utils/rolesUtils";
import { StatusBadge } from "../../common/components/StatusBadge";
import { ReactComponent as InfoIcon } from "../../theme/assets/info-circle.svg";

const endpointNewFront = process.env.REACT_APP_ENDPOINT_NEW_FRONT || "https://catalogue.apprentissage.beta.gouv.fr/api";

const EditSection = ({ edition, onEdit, handleSubmit, isSubmitting }) => {
  return (
    <Box>
      {edition && (
        <Flex
          flexDirection={["column", "row"]}
          position="fixed"
          left={0}
          bottom={0}
          w="full"
          bg="white"
          p={8}
          zIndex={100}
          justifyContent="center"
          boxShadow="0 -2px 5px 0 rgba(215, 215, 215, 0.5)"
        >
          <Button
            variant="outline"
            colorScheme="blue"
            onClick={() => {
              onEdit();
            }}
            disabled={isSubmitting}
            mr={[0, 8]}
            px={[8, 20]}
            mb={[3, 0]}
          >
            Annuler
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            loadingText="Enregistrement des modifications"
          >
            Enregistrer les modifications
          </Button>
        </Flex>
      )}
      <Button
        variant="outline"
        colorScheme="blue"
        onClick={() => {
          onEdit();
        }}
        disabled={edition}
        px={8}
        mt={[6, 0]}
      >
        {edition ? "en cours de modification..." : "Modifier les informations"}
      </Button>
    </Box>
  );
};

const Formation = ({
  formation,
  edition,
  onEdit,
  handleChange,
  handleSubmit,
  values,
  hasRightToEdit,
  isSubmitting,
  pendingFormation,
}) => {
  const oneEstablishment = formation.etablissement_gestionnaire_siret === formation.etablissement_formateur_siret;

  return (
    <Box bg="#fafbfc" boxShadow="0 2px 2px 0 rgba(215, 215, 215, 0.5)" borderRadius={4}>
      <Flex
        bg="white"
        justifyContent="space-between"
        alignItems="center"
        p={8}
        borderBottom="1px solid"
        borderColor="grey.300"
        flexDirection={["column", "row"]}
      >
        <Heading as="h2" fontSize="beta">
          Description de la formation
        </Heading>
        {hasRightToEdit && (
          <EditSection edition={edition} onEdit={onEdit} handleSubmit={handleSubmit} isSubmitting={isSubmitting} />
        )}
      </Flex>
      {pendingFormation && (
        <Alert status="info" justifyContent="center">
          <Box mr={1}>
            <InfoIcon />
          </Box>
          Cette formation a été {pendingFormation.published ? "éditée" : "supprimée"} et est en attente de traitement
        </Alert>
      )}
      <Grid templateColumns="repeat(12, 1fr)">
        <GridItem colSpan={[12, 7]} bg="white" p={8}>
          <Box mb={16}>
            <Heading as="h2" fontSize="beta" mb={4}>
              Détails
            </Heading>
            <Text mb={4}>
              Intitulé court de la formation: <strong>{formation.intitule_court}</strong>
            </Text>
            <Text mb={4}>
              Diplôme ou titre visé: <strong>{formation.diplome}</strong>
            </Text>
            <Text mb={4}>
              Niveau de la formation: <strong>{formation.niveau}</strong>
            </Text>
            <Text mb={4}>
              Code diplôme (Éducation Nationale): {!edition && <strong>{formation.cfd}</strong>}
              {edition && <Input type="text" name="cfd" onChange={handleChange} value={values.cfd} />}
            </Text>
            <Text mb={4}>
              Code MEF 10 caractères: <strong>{formation.mef_10_code}</strong>
            </Text>
            <Text mb={4}>
              Période d'inscription: {!edition && <strong>{formation.periode}</strong>}
              {edition && <Input type="text" name="periode" onChange={handleChange} value={values.periode} />}
            </Text>
            <Text mb={4}>
              Capacite d'accueil: {!edition && <strong>{formation.capacite}</strong>}
              {edition && <Input type="text" name="capacite" onChange={handleChange} value={values.capacite} />}
            </Text>
            <Text mb={4}>
              Durée de la formation: <strong>{formation.duree}</strong>
            </Text>
            <Text mb={4}>
              Année: <strong>{formation.annee}</strong>
            </Text>
          </Box>
          {/* <Section title="Information ParcourSup">
          <div className="field">
            <h3>Référencé dans ParcourSup</h3>
            <p>{formation.parcoursup_reference ? "OUI" : "NON"}</p>
          </div>
          <div className="field">
            <h3>À charger dans ParcourSup</h3>
            <p>{formation.parcoursup_a_charger ? "OUI" : "NON"}</p>
          </div>
        </Section>
        <Section title="Information Affelnet">
          <div className="field">
            <h3>Référencé dans Affelnet</h3>
            <p>{formation.affelnet_reference ? "OUI" : "NON"}</p>
          </div>
          <div className="field">
            <h3>À charger dans Affelnet</h3>
            <p>{formation.affelnet_a_charger ? "OUI" : "NON"}</p>
          </div>
        </Section> */}
          <Box mb={16}>
            <Heading as="h2" fontSize="beta" mb={4} mt={6}>
              Informations RNCP et ROME
            </Heading>
            {!formation.rncp_code && (
              <Text mb={4}>
                Code RNCP: {!edition && <strong>{formation.rncp_code}</strong>}
                {edition && <Input type="text" name="rncp_code" onChange={handleChange} value={values.rncp_code} />}
              </Text>
            )}
            {formation.rncp_code && (
              <Text mb={4}>
                Code RNCP: <strong>{formation.rncp_code}</strong>
              </Text>
            )}
            {/*<Text mb={4}>*/}
            {/*  Organisme Habilité (RNCP): <strong>{formation.rncp_etablissement_reference_habilite}</strong>*/}
            {/*</Text>*/}
            {/*<Text mb={4}>*/}
            {/*  Éligible apprentissage (RNCP): <strong>{formation.rncp_eligible_apprentissage}</strong>*/}
            {/*</Text>*/}
            <Text mb={4}>
              Intitulé RNCP: <strong>{formation.rncp_intitule}</strong>
            </Text>
            <Text mb={4}>
              Codes ROME: <strong>{formation.rome_codes.join(", ")}</strong>
            </Text>

            <Box>
              {formation.opcos && formation.opcos.length === 0 && <Text mb={4}>Aucun OPCO rattaché</Text>}
              {formation.opcos && formation.opcos.length > 0 && (
                <Text mb={4}>
                  OPCOs liés à la formation: <strong>{formation.opcos.join(", ")}</strong>
                </Text>
              )}
            </Box>
          </Box>
        </GridItem>
        <GridItem colSpan={[12, 5]} bg="#fafbfc" p={8}>
          <Box mb={16}>
            <Heading as="h2" fontSize="beta" mb={4}>
              À propos
            </Heading>
            <Text mb={4}>
              Type: <strong>{formation.etablissement_reference_type}</strong>
            </Text>
            <Text mb={4}>
              UAI: {!edition && <strong>{formation.uai_formation}</strong>}
              {edition && (
                <Input type="text" name="uai_formation" onChange={handleChange} value={values.uai_formation} />
              )}
            </Text>
            <Text mb={4}>
              Établissement conventionné ? : <strong>{formation.etablissement_reference_conventionne}</strong>
            </Text>
            <Text mb={4}>
              Établissement déclaré en préfecture ? :{" "}
              <strong>{formation.etablissement_reference_declare_prefecture}</strong>
            </Text>
            <Text mb={4}>
              Organisme certifié 2015 - datadock ? : <strong>{formation.etablissement_reference_datadock}</strong>
            </Text>
            <Text mb={4}>
              Académie:{" "}
              {!edition && (
                <strong>
                  {formation.nom_academie} ({formation.num_academie})
                </strong>
              )}
              {edition && (
                <>
                  {formation.nom_academie}{" "}
                  <Input type="text" name="num_academie" onChange={handleChange} value={values.num_academie} />
                </>
              )}
            </Text>
            <Text mb={4}>
              Code postal: {!edition && <strong>{formation.code_postal}</strong>}
              {edition && <Input type="text" name="code_postal" onChange={handleChange} value={values.code_postal} />}
            </Text>
            <Text mb={4}>
              Code commune: <strong>{formation.code_commune_insee}</strong>
            </Text>
            <Box mb={4}>
              {formation.onisep_url !== "" && formation.onisep_url !== null && (
                <Link
                  href={formation.onisep_url}
                  mt={3}
                  textDecoration="underline"
                  color="blue.500"
                  fontWeight="bold"
                  isExternal
                >
                  Voir la fiche descriptive Onisep <FontAwesomeIcon icon={faExternalLinkAlt} />
                </Link>
              )}
            </Box>
          </Box>
          <Box mb={16}>
            <Heading as="h2" fontSize="beta" mb={4}>
              Organisme {!oneEstablishment && "Formateur"}
            </Heading>
            <div>
              {formation.etablissement_formateur_entreprise_raison_sociale && (
                <Text mb={4}>
                  Raison sociale: <strong>{formation.etablissement_formateur_entreprise_raison_sociale}</strong>
                </Text>
              )}
              {formation.etablissement_formateur_enseigne && (
                <Text mb={4}>
                  Enseigne: <strong>{formation.etablissement_formateur_enseigne}</strong>
                </Text>
              )}
              <Text mb={4}>
                Uai: <strong>{formation.etablissement_formateur_uai}</strong>
              </Text>
              <Box mb={4}>
                <Link
                  as={NavLink}
                  to={`/etablissement/${formation.etablissement_formateur_id}`}
                  target="_blank"
                  mt={3}
                  textDecoration="underline"
                  color="blue.500"
                  fontWeight="bold"
                >
                  Voir l'organisme {!oneEstablishment && "formateur"}
                </Link>
              </Box>
            </div>
          </Box>
          {!oneEstablishment && (
            <Box mb={16}>
              <Heading as="h2" fontSize="beta" mb={4}>
                Organisme Gestionnaire
              </Heading>
              {formation.etablissement_gestionnaire_entreprise_raison_sociale && (
                <Text mb={4}>
                  Raison sociale: <strong>{formation.etablissement_gestionnaire_entreprise_raison_sociale}</strong>
                </Text>
              )}
              {formation.etablissement_gestionnaire_enseigne && (
                <Text mb={4}>
                  Enseigne: <strong>{formation.etablissement_gestionnaire_enseigne}</strong>
                </Text>
              )}
              <Text mb={4}>
                Uai: <strong>{formation.etablissement_gestionnaire_uai}</strong>
              </Text>
              <Box mb={4}>
                <Link
                  as={NavLink}
                  to={`/etablissement/${formation.etablissement_gestionnaire_id}`}
                  target="_blank"
                  mt={3}
                  textDecoration="underline"
                  color="blue.500"
                  fontWeight="bold"
                >
                  Voir l'organisme gestionnaire
                </Link>
              </Box>
            </Box>
          )}
        </GridItem>
      </Grid>
    </Box>
  );
};

export default ({ match }) => {
  const [formation, setFormation] = useState();
  const [pendingFormation, setPendingFormation] = useState();
  const displayedFormation = pendingFormation || formation;

  const [edition, setEdition] = useState(false);
  let history = useHistory();
  const { search } = useLocation();
  const { source } = queryString.parse(search);
  const isMna = source === "mna";
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [auth] = useAuth();
  const hasRightToEdit = !isMna && hasRightToEditFormation(displayedFormation, auth);

  const getPublishRadioValue = (status) => {
    if (["publié", "en attente de publication"].includes(status)) {
      return "true";
    }
    if (["non publié"].includes(status)) {
      return "false";
    }

    return undefined;
  };

  const {
    values: publishValues,
    handleChange: handlePublishChange,
    handleSubmit: handlePublishSubmit,
    isSubmitting: isPublishSubmitting,
    setFieldValue: setPublishFieldValue,
  } = useFormik({
    initialValues: {
      affelnet: getPublishRadioValue(formation?.affelnet_statut),
      parcoursup: getPublishRadioValue(formation?.parcoursup_statut),
    },
    onSubmit: ({ affelnet, parcoursup }) => {
      return new Promise(async (resolve) => {
        const body = {};

        // check if can edit depending on the status
        if (affelnet === "true") {
          if (["non publié", "à publier"].includes(formation?.affelnet_statut)) {
            body.affelnet_statut = "en attente de publication";
          }
        } else if (affelnet === "false") {
          if (["en attente de publication", "à publier"].includes(formation?.affelnet_statut)) {
            body.affelnet_statut = "non publié";
          }
        }

        if (parcoursup === "true") {
          if (["non publié", "à publier"].includes(formation?.parcoursup_statut)) {
            body.parcoursup_statut = "en attente de publication";
          }
        } else if (parcoursup === "false") {
          if (["en attente de publication", "à publier"].includes(formation?.parcoursup_statut)) {
            body.parcoursup_statut = "non publié";
          }
        }

        if (Object.keys(body).length > 0) {
          const updatedFormation = await _put(`${endpointNewFront}/entity/formations2021/${formation._id}`, {
            num_academie: formation.num_academie,
            ...body,
          });
          setFormation(updatedFormation);
          setPublishFieldValue("affelnet", getPublishRadioValue(updatedFormation?.affelnet_statut));
          setPublishFieldValue("parcoursup", getPublishRadioValue(updatedFormation?.parcoursup_statut));
        }

        onClose();
        resolve("onSubmitHandler publish complete");
      });
    },
  });

  const { values, handleSubmit, handleChange, setFieldValue, isSubmitting } = useFormik({
    initialValues: {
      uai_formation: "",
      code_postal: "",
      capacite: "",
      periode: "",
      cfd: "",
      rncp_code: "",
      num_academie: 0,
    },
    onSubmit: (values) => {
      return new Promise(async (resolve) => {
        const updatedFormation = await _post(`${endpointNewFront}/entity/formation2021/update`, {
          ...displayedFormation,
          ...values,
        });

        let result = await _post(`${endpointNewFront}/entity/pendingRcoFormation`, updatedFormation);
        if (result) {
          setPendingFormation(result);
          setFieldValue("uai_formation", result.uai_formation);
          setFieldValue("code_postal", result.code_postal);
          setFieldValue("periode", result.periode);
          setFieldValue("capacite", result.capacite);
          setFieldValue("cfd", result.cfd);
          setFieldValue("num_academie", result.num_academie);
          setFieldValue("rncp_code", result.rncp_code);
        }

        setEdition(false);
        resolve("onSubmitHandler complete");
      });
    },
  });

  useEffect(() => {
    async function run() {
      try {
        let pendingRCOFormation;

        const apiURL = isMna ? `${endpointNewFront}/entity/formation/` : `${endpointNewFront}/entity/formation2021/`;
        const form = await _get(`${apiURL}${match.params.id}`, false);
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

        const displayedFormation = pendingRCOFormation || form;

        setFieldValue("uai_formation", displayedFormation.uai_formation || "");
        setFieldValue("code_postal", displayedFormation.code_postal || "");
        setFieldValue("periode", displayedFormation.periode || "");
        setFieldValue("capacite", displayedFormation.capacite || "");
        setFieldValue("cfd", displayedFormation.cfd || "");
        setFieldValue("num_academie", displayedFormation.num_academie || "");
        setFieldValue("rncp_code", displayedFormation.rncp_code || "");

        setPublishFieldValue("affelnet", getPublishRadioValue(form?.affelnet_statut));
        setPublishFieldValue("parcoursup", getPublishRadioValue(form?.parcoursup_statut));
      } catch (e) {
        history.push("/404");
      }
    }
    run();
  }, [match, setFieldValue, isMna, history, setPublishFieldValue]);

  const onEdit = () => {
    setEdition(!edition);
  };

  const onDelete = async () => {
    // eslint-disable-next-line no-restricted-globals
    const areYousure = confirm("Souhaitez-vous vraiment supprimer cette formation ?");
    if (areYousure) {
      // Update as not published
      let result = await _post(`${endpointNewFront}/entity/pendingRcoFormation`, {
        ...displayedFormation,
        published: false,
      });
      if (result) {
        setPendingFormation(result);
      }
    }
  };

  const isParcoursupPublishDisabled = ["hors périmètre", "publié"].includes(formation?.parcoursup_statut);
  const isAffelnetPublishDisabled = ["hors périmètre", "publié"].includes(formation?.affelnet_statut);

  return (
    <Layout>
      <Box bg="secondaryBackground" w="100%" py={[1, 8]} px={[1, 24]}>
        <Container maxW="xl">
          {!displayedFormation && (
            <Box align="center" p={2}>
              <Spinner />
            </Box>
          )}

          {displayedFormation && (
            <>
              <Box bg="white" p={10} my={6} boxShadow="0 2px 2px 0 rgba(215, 215, 215, 0.5)" borderRadius={4}>
                <Heading as="h1" fontSize="beta">
                  {displayedFormation.intitule_long}
                </Heading>
                {hasRightToEdit && (
                  <>
                    <Text fontSize="gamma" fontWeight="bold" mt={3} mb={[2, 0]}>
                      Statuts et publications de la formation
                    </Text>
                    <Flex justify="space-between" alignItems={["center", "flex-end"]} flexDirection={["column", "row"]}>
                      <Box>
                        <StatusBadge source="Affelnet" status={formation.affelnet_statut} mr={[0, 3]} />
                        <StatusBadge source="Parcoursup" status={formation.parcoursup_statut} mt={[1, 0]} />
                      </Box>
                      <Button
                        colorScheme="blue"
                        px={[8, 20]}
                        mt={[8, 0]}
                        onClick={() => {
                          onOpen();
                        }}
                      >
                        Gérer les publications
                      </Button>
                    </Flex>
                  </>
                )}
              </Box>
              <Formation
                formation={displayedFormation}
                edition={edition}
                onEdit={onEdit}
                values={values}
                handleSubmit={handleSubmit}
                handleChange={handleChange}
                hasRightToEdit={hasRightToEdit}
                isSubmitting={isSubmitting}
                onDelete={onDelete}
                pendingFormation={pendingFormation}
              />
              {!edition && hasRightToEdit && (
                <Flex justifyContent={["center", "flex-end"]} my={[6, 12]}>
                  <Button
                    variant="outline"
                    colorScheme="red"
                    onClick={onDelete}
                    disabled={!displayedFormation.published}
                    px={[8, 20]}
                    mr={[0, 12]}
                  >
                    Supprimer la formation
                  </Button>
                </Flex>
              )}
            </>
          )}
        </Container>
      </Box>
      <Modal isOpen={isOpen} onClose={onClose} size="5xl">
        <ModalOverlay />
        <ModalContent bg="white" color="primaryText">
          <ModalCloseButton color="grey.600" _focus={{ boxShadow: "none", outlineWidth: 0 }} />
          <ModalHeader pt={[3, 20]}>
            <Center>
              <Heading as="h2" fontSize="alpha">
                Gérer les publications
              </Heading>
            </Center>
          </ModalHeader>
          <ModalBody px={[2, 16]} pt={[2, 8]} pb={[8, 20]}>
            <Center borderBottom="1px solid" borderColor="grey.400" p={4} mx={[0, 24]}>
              <FormControl display="flex" alignItems="center" w="auto" isDisabled={isAffelnetPublishDisabled}>
                <FormLabel htmlFor="affelnet" mb={0} fontSize="gamma">
                  Demander la publication Affelnet:
                </FormLabel>
                <RadioGroup defaultValue={publishValues.affelnet} id="affelnet" name="affelnet">
                  <Stack spacing={4} direction="row">
                    <Radio
                      mb={0}
                      size="lg"
                      value="true"
                      isDisabled={isAffelnetPublishDisabled}
                      onChange={handlePublishChange}
                    >
                      Oui
                    </Radio>
                    <Radio
                      mb={0}
                      size="lg"
                      value="false"
                      isDisabled={isAffelnetPublishDisabled}
                      onChange={handlePublishChange}
                    >
                      Non
                    </Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>
            </Center>
            <Center borderBottom="1px solid" borderColor="grey.400" p={4} mx={[0, 24]}>
              <FormControl display="flex" alignItems="center" w="auto" isDisabled={isParcoursupPublishDisabled}>
                <FormLabel htmlFor="parcoursup" mb={0} fontSize="gamma">
                  Demander la publication ParcourSup:
                </FormLabel>
                <RadioGroup defaultValue={publishValues.parcoursup} id="parcoursup" name="parcoursup">
                  <Stack spacing={4} direction="row">
                    <Radio
                      mb={0}
                      size="lg"
                      value="true"
                      isDisabled={isParcoursupPublishDisabled}
                      onChange={handlePublishChange}
                    >
                      Oui
                    </Radio>
                    <Radio
                      mb={0}
                      size="lg"
                      value="false"
                      isDisabled={isParcoursupPublishDisabled}
                      onChange={handlePublishChange}
                    >
                      Non
                    </Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>
            </Center>
            <Flex flexDirection={["column", "row"]} pt={[3, 16]} justifyContent="center">
              <Button
                variant="outline"
                colorScheme="blue"
                onClick={() => {
                  setPublishFieldValue("affelnet", getPublishRadioValue(formation?.affelnet_statut));
                  setPublishFieldValue("parcoursup", getPublishRadioValue(formation?.parcoursup_statut));
                  onClose();
                }}
                mr={[0, 8]}
                px={[8, 20]}
                mb={[3, 0]}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                colorScheme="blue"
                onClick={handlePublishSubmit}
                isLoading={isPublishSubmitting}
                loadingText="Enregistrement des modifications"
              >
                Enregistrer les modifications
              </Button>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Layout>
  );
};
