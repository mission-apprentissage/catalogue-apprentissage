import React, { useEffect, useState, Fragment } from "react";
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
import { NavLink, useHistory } from "react-router-dom";
import { useFormik } from "formik";
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

const FormationPeriode = ({ periode }) => {
  let displayedPeriode = <strong>periode</strong>;
  try {
    const periodeArr = JSON.parse(periode);

    const periodeObj = periodeArr.reduce((acc, dateStr) => {
      const date = new Date(dateStr);
      const formattedDate = date.toLocaleString("fr-FR", { month: "long" });
      const displayedDate = formattedDate === "Invalid Date" ? dateStr : formattedDate;
      acc[date.getFullYear()] = acc[date.getFullYear()] ?? [];
      acc[date.getFullYear()] = [...acc[date.getFullYear()], displayedDate];
      return acc;
    }, {});

    displayedPeriode = Object.entries(periodeObj).map(([key, value]) => {
      return (
        <Fragment key={key}>
          <br />
          <Text as="span">
            <strong>
              {key}: {value.join(", ")}
            </strong>
          </Text>
        </Fragment>
      );
    });
  } catch (e) {
    console.error("unable to parse periode field", periode, e);
  }

  return <>{displayedPeriode}</>;
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
        borderRadius="4px 4px 0 0"
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
        <GridItem colSpan={[12, 7]} bg="white" p={8} borderBottomLeftRadius={[0, 4]}>
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
              Codes MEF 10 caractères:{" "}
              <strong>{formation.mef_10_code ?? formation?.mefs_10?.map(({ mef10 }) => mef10).join(", ")}</strong>
            </Text>
            <Text mb={4}>
              Période d'inscription: {!edition && <FormationPeriode periode={formation.periode} />}
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
        <GridItem colSpan={[12, 5]} bg="#fafbfc" p={8} borderBottomRightRadius={4} borderBottomLeftRadius={[4, 0]}>
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
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [auth] = useAuth();
  const hasRightToEdit = hasRightToEditFormation(displayedFormation, auth);

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
          if (["en attente de publication", "à publier", "publié"].includes(formation?.affelnet_statut)) {
            body.affelnet_statut = "non publié";
          }
        }

        if (parcoursup === "true") {
          if (["non publié", "à publier"].includes(formation?.parcoursup_statut)) {
            body.parcoursup_statut = "en attente de publication";
          }
        } else if (parcoursup === "false") {
          if (["en attente de publication", "à publier", "publié"].includes(formation?.parcoursup_statut)) {
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

        const apiURL = `${endpointNewFront}/entity/formation2021/`;
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
  }, [match, setFieldValue, history, setPublishFieldValue]);

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

  const isParcoursupPublishDisabled = ["hors périmètre"].includes(formation?.parcoursup_statut);
  const isAffelnetPublishDisabled = ["hors périmètre"].includes(formation?.affelnet_statut);

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
                {hasRightToEdit && displayedFormation.etablissement_reference_catalogue_published && (
                  <>
                    <Text fontSize="gamma" fontWeight="bold" mt={3} mb={[2, 0]}>
                      Statuts et publications de la formation
                    </Text>
                    <Flex justify="space-between" alignItems={["center", "flex-end"]} flexDirection={["column", "row"]}>
                      <Box>
                        <StatusBadge source="Parcoursup" status={formation.parcoursup_statut} mr={[0, 3]} />
                        <StatusBadge source="Affelnet" status={formation.affelnet_statut} mt={[1, 0]} />
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
          <ModalCloseButton color="grey.600" _focus={{ boxShadow: "none", outlineWidth: 0 }} size="lg" />
          <ModalHeader pt={[3, 20]} pb={[3, 8]} bg="#f5f8f9" borderRadius="5px 5px 0 0">
            <Center>
              <Heading as="h2" fontSize="alpha">
                Gérer les publications
              </Heading>
            </Center>
          </ModalHeader>
          <ModalBody p={0}>
            <Box px={[2, 16, 48]}>
              <Flex px={4} pt={[12, 16]} flexDirection="column">
                <Box mb={3}>
                  <StatusBadge source="Affelnet" status={formation?.affelnet_statut} />
                </Box>
                <FormControl display="flex" alignItems="center" w="auto" isDisabled={isAffelnetPublishDisabled}>
                  <FormLabel htmlFor="affelnet" mb={0} fontSize="delta" fontWeight={700}>
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
              </Flex>
              <Flex px={4} pt={[12, 16]} pb={[12, 16]} flexDirection="column">
                <Box mb={3}>
                  <StatusBadge source="Parcoursup" status={formation?.parcoursup_statut} />
                </Box>
                <FormControl display="flex" alignItems="center" w="auto" isDisabled={isParcoursupPublishDisabled}>
                  <FormLabel htmlFor="parcoursup" mb={0} fontSize="delta" fontWeight={700}>
                    Demander la publication Parcoursup:
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
              </Flex>
            </Box>
            <Box borderTop="1px solid" borderColor="grey.300" p={0}>
              <Flex flexDirection={["column", "row"]} py={[3, 8]} px={3} justifyContent="center">
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
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Layout>
  );
};
