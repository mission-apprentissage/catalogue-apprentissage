import React, { useState } from "react";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormErrorMessage,
  FormLabel,
  Heading,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { StatusBadge } from "../StatusBadge";
import { useFormik } from "formik";
import useAuth from "../../hooks/useAuth";
import * as Yup from "yup";
import { ArrowRightLine, Close } from "../../../theme/components/icons";
import { AFFELNET_STATUS, COMMON_STATUS, PARCOURSUP_STATUS } from "../../../constants/status";
import { updateFormation, updateReconciliationParcoursup } from "../../api/formation";

const getPublishRadioValue = (status) => {
  if ([COMMON_STATUS.PUBLIE, COMMON_STATUS.EN_ATTENTE].includes(status)) {
    return "true";
  }
  if ([COMMON_STATUS.NON_PUBLIE].includes(status)) {
    return "false";
  }

  return undefined;
};

const getSubmitBody = ({
  formation,
  affelnet,
  affelnet_infos_offre,
  affelnet_url_infos_offre,
  affelnet_modalites_offre,
  affelnet_url_modalites_offre,
  affelnet_raison_depublication,
  parcoursup,
  parcoursup_raison_depublication,
  date = new Date(),
}) => {
  const body = {};
  let shouldRemovePsReconciliation = false;
  let shouldRestorePsReconciliation = false;

  // check if can edit depending on the status
  if (affelnet === "true") {
    if (
      [AFFELNET_STATUS.NON_PUBLIE, AFFELNET_STATUS.A_PUBLIER_VALIDATION, AFFELNET_STATUS.A_PUBLIER].includes(
        formation?.affelnet_statut
      )
    ) {
      body.affelnet_statut = AFFELNET_STATUS.EN_ATTENTE;
      body.last_statut_update_date = date;
      body.affelnet_infos_offre = affelnet_infos_offre;
      body.affelnet_url_infos_offre = affelnet_url_infos_offre;
      body.affelnet_modalites_offre = affelnet_modalites_offre;
      body.affelnet_url_modalites_offre = affelnet_url_modalites_offre;
      body.affelnet_raison_depublication = null;
    } else if ([AFFELNET_STATUS.PUBLIE].includes(formation?.affelnet_statut)) {
      body.affelnet_infos_offre = affelnet_infos_offre;
      body.affelnet_url_infos_offre = affelnet_url_infos_offre;
      body.affelnet_modalites_offre = affelnet_modalites_offre;
      body.affelnet_url_modalites_offre = affelnet_url_modalites_offre;
    }
  } else if (affelnet === "false") {
    if (
      [
        AFFELNET_STATUS.EN_ATTENTE,
        AFFELNET_STATUS.A_PUBLIER_VALIDATION,
        AFFELNET_STATUS.A_PUBLIER,
        AFFELNET_STATUS.PUBLIE,
      ].includes(formation?.affelnet_statut)
    ) {
      body.affelnet_raison_depublication = affelnet_raison_depublication;
      body.affelnet_statut = AFFELNET_STATUS.NON_PUBLIE;
      body.last_statut_update_date = date;
      body.affelnet_published_date = null;
    }
  }

  if (parcoursup === "true") {
    if (
      [
        PARCOURSUP_STATUS.NON_PUBLIE,
        PARCOURSUP_STATUS.A_PUBLIER_HABILITATION,
        PARCOURSUP_STATUS.A_PUBLIER_VERIFIER_POSTBAC,
        PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR,
        PARCOURSUP_STATUS.A_PUBLIER,
        PARCOURSUP_STATUS.REJETE,
      ].includes(formation?.parcoursup_statut)
    ) {
      body.parcoursup_statut = PARCOURSUP_STATUS.EN_ATTENTE;
      body.rejection = null;
      body.last_statut_update_date = date;
      shouldRestorePsReconciliation = formation.parcoursup_statut === PARCOURSUP_STATUS.NON_PUBLIE;
      body.parcoursup_raison_depublication = null;
    }
  } else if (parcoursup === "false") {
    if (
      [
        PARCOURSUP_STATUS.EN_ATTENTE,
        PARCOURSUP_STATUS.A_PUBLIER_HABILITATION,
        PARCOURSUP_STATUS.A_PUBLIER_VERIFIER_POSTBAC,
        PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR,
        PARCOURSUP_STATUS.A_PUBLIER,
        PARCOURSUP_STATUS.PUBLIE,
        PARCOURSUP_STATUS.REJETE,
      ].includes(formation?.parcoursup_statut)
    ) {
      body.parcoursup_raison_depublication = parcoursup_raison_depublication;
      body.parcoursup_statut = PARCOURSUP_STATUS.NON_PUBLIE;
      body.last_statut_update_date = date;
      body.parcoursup_published_date = null;
      shouldRemovePsReconciliation = [PARCOURSUP_STATUS.EN_ATTENTE, PARCOURSUP_STATUS.PUBLIE].includes(
        formation.parcoursup_statut
      );
    }
  }
  return {
    body,
    shouldRestorePsReconciliation,
    shouldRemovePsReconciliation,
  };
};

const updateFormationAndReconciliation = async ({
  body,
  shouldRestorePsReconciliation,
  shouldRemovePsReconciliation,
  formation,
  user,
  onFormationUpdate,
}) => {
  const updatedFormation = await updateFormation({ formation, body, user });

  if (shouldRemovePsReconciliation || shouldRestorePsReconciliation) {
    try {
      await updateReconciliationParcoursup({ formation, shouldRemovePsReconciliation, user });
    } catch (e) {
      // do nothing
    }
  }

  onFormationUpdate(updatedFormation);
  return updatedFormation;
};

const PublishModal = ({ isOpen, onClose, formation, onFormationUpdate }) => {
  const [user] = useAuth();
  const [isAffelnetFormOpen, setAffelnetFormOpen] = useState(
    [AFFELNET_STATUS.PUBLIE, AFFELNET_STATUS.EN_ATTENTE].includes(formation?.affelnet_statut)
  );

  const [isAffelnetUnpublishFormOpen, setAffelnetUnpublishFormOpen] = useState(
    [AFFELNET_STATUS.NON_PUBLIE].includes(formation?.affelnet_statut)
  );
  const [isParcoursupUnpublishFormOpen, setParcoursupUnpublishFormOpen] = useState(
    [PARCOURSUP_STATUS.NON_PUBLIE].includes(formation?.parcoursup_statut)
  );

  const { values, handleChange, handleSubmit, isSubmitting, setFieldValue, errors } = useFormik({
    initialValues: {
      affelnet: getPublishRadioValue(formation?.affelnet_statut),
      affelnet_infos_offre: formation?.affelnet_infos_offre ?? "",
      affelnet_url_infos_offre: formation?.affelnet_url_infos_offre ?? "",
      affelnet_modalites_offre: formation?.affelnet_modalites_offre ?? "",
      affelnet_url_modalites_offre: formation?.affelnet_url_modalites_offre ?? "",
      affelnet_raison_depublication: formation?.affelnet_raison_depublication ?? "",
      parcoursup: getPublishRadioValue(formation?.parcoursup_statut),
      parcoursup_raison_depublication: formation?.parcoursup_raison_depublication ?? "",
    },
    validationSchema: Yup.object().shape({
      affelnet_infos_offre: isAffelnetFormOpen
        ? Yup.string().nullable().max(1000, "Le champ ne doit pas dépasser 1000 caractères")
        : Yup.string().nullable(),
      affelnet_url_infos_offre: isAffelnetFormOpen
        ? Yup.string().nullable().max(250, "Le champ ne doit pas dépasser 250 caractères")
        : Yup.string().nullable(),
      affelnet_modalites_offre: isAffelnetFormOpen
        ? Yup.string().nullable().max(1000, "Le champ ne doit pas dépasser 1000 caractères")
        : Yup.string().nullable(),
      affelnet_url_modalites_offre: isAffelnetFormOpen
        ? Yup.string().nullable().max(250, "Le champ ne doit pas dépasser 250 caractères")
        : Yup.string().nullable(),

      affelnet_raison_depublication: isAffelnetUnpublishFormOpen
        ? Yup.string().nullable().required("Veuillez saisir la raison")
        : Yup.string().nullable(),
      parcoursup_raison_depublication: isParcoursupUnpublishFormOpen
        ? Yup.string().nullable().required("Veuillez saisir la raison")
        : Yup.string().nullable(),
    }),
    onSubmit: ({
      affelnet,
      parcoursup,
      affelnet_infos_offre,
      affelnet_url_infos_offre,
      affelnet_modalites_offre,
      affelnet_url_modalites_offre,
      affelnet_raison_depublication,
      parcoursup_raison_depublication,
    }) => {
      return new Promise(async (resolve) => {
        const result = getSubmitBody({
          formation,
          affelnet,
          affelnet_infos_offre,
          affelnet_url_infos_offre,
          affelnet_modalites_offre,
          affelnet_url_modalites_offre,
          affelnet_raison_depublication,
          parcoursup,
          parcoursup_raison_depublication,
        });

        if (Object.keys(result.body).length > 0) {
          const updatedFormation = await updateFormationAndReconciliation({
            ...result,
            formation,
            user,
            onFormationUpdate,
          });

          setFieldValue("affelnet", getPublishRadioValue(updatedFormation?.affelnet_statut));
          setFieldValue("parcoursup", getPublishRadioValue(updatedFormation?.parcoursup_statut));
          setFieldValue("affelnet_infos_offre", updatedFormation?.affelnet_infos_offre);
          setFieldValue("affelnet_url_infos_offre", updatedFormation?.affelnet_url_infos_offre);
          setFieldValue("affelnet_modalites_offre", updatedFormation?.affelnet_modalites_offre);
          setFieldValue("affelnet_url_modalites_offre", updatedFormation?.affelnet_url_modalites_offre);
          setFieldValue("affelnet_raison_depublication", updatedFormation?.affelnet_raison_depublication);
          setFieldValue("parcoursup_raison_depublication", updatedFormation?.parcoursup_raison_depublication);
        }

        onClose();
        resolve("onSubmitHandler publish complete");
      });
    },
  });

  const isParcoursupPublishDisabled = [PARCOURSUP_STATUS.HORS_PERIMETRE].includes(formation?.parcoursup_statut);
  const isAffelnetPublishDisabled = [AFFELNET_STATUS.HORS_PERIMETRE].includes(formation?.affelnet_statut);

  const initialRef = React.useRef();

  console.log(errors);
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" initialFocusRef={initialRef}>
      <ModalOverlay />
      <ModalContent bg="white" color="primaryText" borderRadius="none" ref={initialRef}>
        <Button
          display={"flex"}
          alignSelf={"flex-end"}
          color="bluefrance"
          fontSize={"epsilon"}
          onClick={onClose}
          variant="unstyled"
          p={8}
          fontWeight={400}
        >
          fermer{" "}
          <Text as={"span"} ml={2}>
            <Close boxSize={4} />
          </Text>
        </Button>
        <ModalHeader px={[4, 16]} pt={[3, 6]} pb={[3, 6]}>
          <Heading as="h4" fontSize="1.6rem">
            <Flex>
              <Text as={"span"}>
                <ArrowRightLine boxSize={26} />
              </Text>
              <Text as={"span"} ml={4}>
                Gérer les publications
              </Text>
            </Flex>
          </Heading>
        </ModalHeader>
        <ModalBody p={0}>
          <Flex px={[4, 12]} pb={[4, 12]} flexDirection={{ base: "column", md: "row" }} justifyContent="space-between">
            <Box
              border="1px solid"
              borderColor="bluefrance"
              p={8}
              flexBasis={{ base: "100%", md: "48%" }}
              mb={{ base: 2, md: 0 }}
            >
              <Heading as="h3" fontSize="1.5rem" mb={3}>
                {formation.intitule_long}
              </Heading>
              <Flex flexDirection="column">
                <Box mb={3}>
                  <StatusBadge source="Affelnet" status={formation?.affelnet_statut} />
                </Box>
                <FormControl
                  display="flex"
                  flexDirection="column"
                  w="auto"
                  isDisabled={isAffelnetPublishDisabled}
                  data-testid={"affelnet-form"}
                  aria-disabled={isAffelnetPublishDisabled}
                >
                  <FormLabel htmlFor="affelnet" mb={3} fontSize="epsilon" fontWeight={400}>
                    Demander la publication Affelnet:
                  </FormLabel>
                  <RadioGroup defaultValue={values.affelnet} id="affelnet" name="affelnet">
                    <Stack spacing={2} direction="column">
                      <Radio
                        mb={0}
                        size="lg"
                        value="true"
                        isDisabled={isAffelnetPublishDisabled}
                        onChange={(evt) => {
                          setAffelnetFormOpen(true);
                          setAffelnetUnpublishFormOpen(false);
                          handleChange(evt);
                        }}
                        data-testid={"af-radio-yes"}
                      >
                        <Text as={"span"} fontSize="zeta">
                          Oui
                        </Text>
                      </Radio>
                      <Radio
                        mb={0}
                        size="lg"
                        value="false"
                        isDisabled={isAffelnetPublishDisabled}
                        onChange={(evt) => {
                          setAffelnetFormOpen(false);
                          setAffelnetUnpublishFormOpen(true);
                          handleChange(evt);
                        }}
                        data-testid={"af-radio-no"}
                      >
                        <Text as={"span"} fontSize="zeta">
                          Non
                        </Text>
                      </Radio>
                    </Stack>
                  </RadioGroup>
                </FormControl>

                {isAffelnetFormOpen && (
                  <>
                    <br />
                    <FormControl isInvalid={errors.affelnet_infos_offre}>
                      <FormLabel htmlFor="affelnet_infos_offre" mb={3} fontSize="epsilon" fontWeight={400}>
                        Informations offre de formation (facultatif) :
                      </FormLabel>
                      <FormHelperText>
                        Précisez ici les informations complémentaires que vous souhaitez voir figurer sur la fiche de la
                        formation sur Affelnet, ex : démarches sur obtention contrat apprentissage, modalités
                        inscription, rythme alternance, date entrée formation...
                      </FormHelperText>

                      <Textarea
                        name="affelnet_infos_offre"
                        value={values.affelnet_infos_offre}
                        onChange={handleChange}
                        placeholder=""
                        rows={2}
                      />
                      <FormErrorMessage>{errors.affelnet_infos_offre}</FormErrorMessage>
                    </FormControl>
                    <br />
                    <br />

                    <FormControl isInvalid={errors.affelnet_modalites_offre}>
                      <FormLabel htmlFor="affelnet_modalites_offre" mb={3} fontSize="epsilon" fontWeight={400}>
                        Description de la modalité particulière s’appliquant à cette formation :
                      </FormLabel>
                      <FormHelperText>
                        Indiquez ici les éventuelles modalités particulières qui s’appliquent pour formuler un vœu sur
                        cette formation. Cette zone sera affichée sur le service en ligne affectation.
                      </FormHelperText>

                      <Textarea
                        name="affelnet_modalites_offre"
                        value={values.affelnet_modalites_offre}
                        onChange={handleChange}
                        placeholder="Exemple :
                        L'inscription dans une formation en apprentissage est soumise à la signature d'un contrat d'apprentissage avec un employeur.
                        La saisie d'un vœu sous statut d'apprenti ne génère aucune affectation ; il est saisi à titre d'information et de recensement. Il permet aux partenaires de l'apprentissage (CFA, Chambres consulaires, Développeurs de l'apprentissage, Région, CIO, Missions locales, Services rectoraux, DRAAF, DIRRECTE) de disposer de vos coordonnées afin de pouvoir vous accompagner dans vos démarches et recherche d'entreprise."
                        rows={4}
                      />
                      <FormErrorMessage>{errors.affelnet_modalites_offre}</FormErrorMessage>
                    </FormControl>
                    <br />
                    <br />

                    <FormControl isInvalid={errors.affelnet_url_infos_offre}>
                      <FormLabel htmlFor="affelnet_url_infos_offre" mb={3} fontSize="epsilon" fontWeight={400}>
                        Libellé de la ressource externe complémentaire (facultatif)
                      </FormLabel>
                      <FormHelperText>
                        Si un lien vers une ressource complémentaire est utile, indiquez ici une très brève description.
                      </FormHelperText>

                      <Textarea
                        name="affelnet_url_infos_offre"
                        value={values.affelnet_url_infos_offre}
                        onChange={handleChange}
                        placeholder="Exemple :
                        “Pour vous aider, vous pouvez consulter le mode d’emploi de la région académique
                        Auvergne-Rhône-Alpes pour candidater en CAP ou Bac pro”"
                        rows={4}
                      />
                      <FormErrorMessage>{errors.affelnet_url_infos_offre}</FormErrorMessage>
                    </FormControl>
                    <br />
                    <br />

                    <FormControl isInvalid={errors.affelnet_url_modalites_offre}>
                      <FormLabel htmlFor="affelnet_url_modalites_offre" mb={3} fontSize="epsilon" fontWeight={400}>
                        URL de la ressource externe complémentaire (facultatif) :
                      </FormLabel>
                      <FormHelperText>
                        Collez ici le lien vers la ressource. Assurez-vous qu’elle est accessible publiquement (pas de
                        connexion nécessaire) et pérenne.
                      </FormHelperText>

                      <Textarea
                        name="affelnet_url_modalites_offre"
                        value={values.affelnet_url_modalites_offre}
                        onChange={handleChange}
                        placeholder="Exemple :
                        http://saio.ac-lyon.fr/spip/IMG/pdf/document_3eme_vers_apprentissage.pdf"
                        rows={4}
                      />
                      <FormErrorMessage>{errors.affelnet_url_modalites_offre}</FormErrorMessage>
                    </FormControl>
                  </>
                )}

                {isAffelnetUnpublishFormOpen && (
                  <FormControl
                    isRequired
                    isInvalid={errors.affelnet_raison_depublication}
                    flexDirection="column"
                    w="auto"
                    mt={6}
                  >
                    <FormLabel htmlFor="affelnet_raison_depublication" mb={3} fontSize="epsilon" fontWeight={400}>
                      Raison de non publication:
                    </FormLabel>

                    <Textarea
                      data-testid={"af-unpublish-form"}
                      name="affelnet_raison_depublication"
                      value={values.affelnet_raison_depublication}
                      onChange={handleChange}
                      placeholder="Précisez ici la raison pour laquelle vous ne souhaitez pas publier la formation sur Affelnet"
                      rows={2}
                    />
                    <FormErrorMessage>{errors.affelnet_raison_depublication}</FormErrorMessage>
                  </FormControl>
                )}
              </Flex>
            </Box>
            <Box
              border="1px solid"
              borderColor="bluefrance"
              p={8}
              flexBasis={{ base: "100%", md: "48%" }}
              mt={{ base: 2, md: 0 }}
            >
              <Heading as="h3" fontSize="1.5rem" mb={3}>
                {formation.intitule_long}
              </Heading>
              <Flex flexDirection="column">
                <Box mb={3}>
                  <StatusBadge source="Parcoursup" status={formation?.parcoursup_statut} />
                </Box>
                <FormControl
                  display="flex"
                  flexDirection="column"
                  w="auto"
                  isDisabled={isParcoursupPublishDisabled}
                  data-testid={"parcoursup-form"}
                  aria-disabled={isParcoursupPublishDisabled}
                >
                  <FormLabel htmlFor="parcoursup" mb={3} fontSize="epsilon" fontWeight={400}>
                    Demander la publication Parcoursup:
                  </FormLabel>
                  <RadioGroup defaultValue={values.parcoursup} id="parcoursup" name="parcoursup">
                    <Stack spacing={2} direction="column">
                      <Radio
                        mb={0}
                        size="lg"
                        value="true"
                        isDisabled={isParcoursupPublishDisabled}
                        onChange={(evt) => {
                          setParcoursupUnpublishFormOpen(false);
                          handleChange(evt);
                        }}
                        data-testid={"ps-radio-yes"}
                      >
                        <Text as={"span"} fontSize="zeta">
                          Oui
                        </Text>
                      </Radio>
                      <Radio
                        mb={0}
                        size="lg"
                        value="false"
                        isDisabled={isParcoursupPublishDisabled}
                        onChange={(evt) => {
                          setParcoursupUnpublishFormOpen(true);
                          handleChange(evt);
                        }}
                        data-testid={"ps-radio-no"}
                      >
                        <Text as={"span"} fontSize="zeta">
                          Non
                        </Text>
                      </Radio>
                    </Stack>
                  </RadioGroup>
                </FormControl>
                <FormControl
                  isRequired
                  isInvalid={errors.parcoursup_raison_depublication}
                  display={isParcoursupUnpublishFormOpen ? "flex" : "none"}
                  flexDirection="column"
                  w="auto"
                  mt={3}
                >
                  <FormLabel htmlFor="parcoursup_raison_depublication" mb={3} fontSize="epsilon" fontWeight={400}>
                    Raison de non publication:
                  </FormLabel>
                  <Flex flexDirection="column" w="100%">
                    <Textarea
                      data-testid={"ps-unpublish-form"}
                      name="parcoursup_raison_depublication"
                      value={values.parcoursup_raison_depublication}
                      onChange={handleChange}
                      placeholder="Précisez ici la raison pour laquelle vous ne souhaitez pas publier la formation sur Parcoursup"
                      rows={2}
                    />
                    <FormErrorMessage>{errors.parcoursup_raison_depublication}</FormErrorMessage>
                  </Flex>
                </FormControl>
              </Flex>
            </Box>
          </Flex>
          <Box>
            <Flex flexDirection={["column", "row"]} p={[3, 8]} justifyContent="flex-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setFieldValue("affelnet", getPublishRadioValue(formation?.affelnet_statut));
                  setFieldValue("parcoursup", getPublishRadioValue(formation?.parcoursup_statut));
                  onClose();
                }}
                mr={[0, 4]}
                px={8}
                mb={[3, 0]}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="primary"
                onClick={(evt) => {
                  if (values.parcoursup === "true" && formation.annee === "X") {
                    const isUserSure = window.confirm(
                      "L'année d'entrée en apprentissage n'a pas été collectée par le réseau des Carif-Oref. Nous avons besoin de votre confirmation pour l'exposition sur Parcoursup.\n\n" +
                        "Confirmez-vous que cette formation est accessible en apprentissage en première année post-Bac ?\n\n" +
                        "Si nécessaire, veuillez vérifier ce paramètre auprès de l'organisme."
                    );
                    if (isUserSure) {
                      handleSubmit(evt);
                    }
                  } else {
                    handleSubmit(evt);
                  }
                }}
                isLoading={isSubmitting}
                loadingText="Enregistrement des modifications"
              >
                Enregistrer les modifications
              </Button>
            </Flex>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export { PublishModal, getPublishRadioValue, getSubmitBody, updateFormationAndReconciliation };
