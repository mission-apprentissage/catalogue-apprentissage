import React, { useState } from "react";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  Input,
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
import { updateFormation } from "../../api/formation";

const getPublishRadioValue = (status) => {
  if ([COMMON_STATUS.PUBLIE, COMMON_STATUS.PRET_POUR_INTEGRATION].includes(status)) {
    return "true";
  }
  if ([COMMON_STATUS.NON_PUBLIE].includes(status)) {
    return "false";
  }

  return undefined;
};

/**
 * Regexp pour validation des urls à destination d'Affelnet.
 *
 *
 * Avec pour académie :
 *
 * paris|aix-marseille|besancon|bordeaux|caen|clermont-ferrand|dijon|grenoble|lille|lyon|montpellier|nancy-metz|poitiers|rennes|strasbourg|toulouse|nantes|orleans-tours|reims|amiens|rouen|limoges|nice|creteil|versailles|corse|reunion|martinique|guadeloupe|guyane|noumea|mayotte|normandie|polynesie|spm
 *
 * Régions académiques :
 *
 * auvergne-rhone-alpes|auvergnerhonealpes|bourgogne-franche-compte|bretagne|centre-val-de-loire|corse|grand-est|guadeloupe|guyane|hauts-de-france|ile-de-france|reunion|martinique|mayotte|normandie|nouvelle-aquitaine|occitanie|pays-de-la-loire|provence-alpes-cote-azur
 *
 *
 * (https?)
 * (
 *   (.+\.ac-<académie>\.(fr|net|eu|nc|pf|pm|wf))|
 *   https://test.ac-aix-marseille.fr/tst
 *
 *   (.+\.ent\.<académie/region-academique>\.(fr|net|eu|nc|pf|pm|wf))|
 *   https://test.ent.aix-marseille.net/tst
 *   https://test.ent.centre-val-de-loire.net/tst
 *
 *   (.+\.region-academique-<region-academique>\.fr)|
 *   https://test.region-academique-bourgogne-franche-compte.fr/test1/test2?test3
 *
 *   (.+\.monbureaunumerique\.fr)|
 *   https://test1.monbureaunumerique.fr/test
 *
 *   (.+\.index-education\.(com|net))|
 *   http://test.index-education.com/test1?test2
 *
 *   ((www\.)?onisep\.fr)/
 *   http://onisep.fr/test1/test2
 *   https://onisep.fr/test1/test2
 *   https://www.onisep.fr/test1/test2
 *   https://bad-test.onisep.fr/test1/test2
 *
 *   ((www\.)?enedis\.fr)/
 *   http://enedis.fr/test1/test2
 *   https://enedis.fr/test1/test2
 *   https://www.enedis.fr/test1/test2
 *   https://bad-test.enedis.fr/test1/test2
 *
 *   (.+\.monavenirdanslenucleaire\.fr)/
 *   https://www.monavenirdanslenucleaire.fr/test
 *
 * )
 * .*
 *
 * https://test.test.net/test
 *
 */
/* cspell:disable-next-line */
const urlRegex =
  /(https?:\/\/)((.+\.ac-(paris|aix-marseille|besancon|bordeaux|caen|clermont-ferrand|dijon|grenoble|lille|lyon|montpellier|nancy-metz|poitiers|rennes|strasbourg|toulouse|nantes|orleans-tours|reims|amiens|rouen|limoges|nice|creteil|versailles|corse|reunion|martinique|guadeloupe|guyane|noumea|mayotte|normandie|polynesie|spm)\.(fr|net|eu|nc|pf|pm|wf))|(.+\.ent\.((paris|aix-marseille|besancon|bordeaux|caen|clermont-ferrand|dijon|grenoble|lille|lyon|montpellier|nancy-metz|poitiers|rennes|strasbourg|toulouse|nantes|orleans-tours|reims|amiens|rouen|limoges|nice|creteil|versailles|corse|reunion|martinique|guadeloupe|guyane|noumea|mayotte|normandie|polynesie|spm)|(auvergne-rhone-alpes|auvergnerhonealpes|bourgogne-franche-compte|bretagne|centre-val-de-loire|corse|grand-est|guadeloupe|guyane|hauts-de-france|ile-de-france|reunion|martinique|mayotte|normandie|nouvelle-aquitaine|occitanie|pays-de-la-loire|provence-alpes-cote-azur))\.(fr|net|eu|nc|pf|pm|wf))|(.+\.region-academique-(auvergne-rhone-alpes|auvergnerhonealpes|bourgogne-franche-compte|bretagne|centre-val-de-loire|corse|grand-est|guadeloupe|guyane|hauts-de-france|ile-de-france|reunion|martinique|mayotte|normandie|nouvelle-aquitaine|occitanie|pays-de-la-loire|provence-alpes-cote-azur)\.fr)|(.+\.monbureaunumerique\.fr)|(.+\.monavenirdanslenucleaire\.fr)|(.+\.index-education\.(com|net))|((www\.)?onisep\.fr)|((www\.)?enedis\.fr)).*/;

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

  // check if can edit depending on the status
  if (affelnet === "true") {
    if (
      [
        AFFELNET_STATUS.NON_PUBLIE,
        AFFELNET_STATUS.A_PUBLIER_VALIDATION,
        AFFELNET_STATUS.A_PUBLIER,
        AFFELNET_STATUS.PRET_POUR_INTEGRATION,
      ].includes(formation?.affelnet_statut)
    ) {
      body.affelnet_statut = AFFELNET_STATUS.PRET_POUR_INTEGRATION;
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
        AFFELNET_STATUS.PRET_POUR_INTEGRATION,
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
        PARCOURSUP_STATUS.FERME,
      ].includes(formation?.parcoursup_statut)
    ) {
      body.parcoursup_statut = PARCOURSUP_STATUS.PRET_POUR_INTEGRATION;
      body.parcoursup_error = null;
      body.rejection = null;
      body.last_statut_update_date = date;
      body.parcoursup_raison_depublication = null;
    }
  } else if (parcoursup === "false") {
    if (
      [
        PARCOURSUP_STATUS.PRET_POUR_INTEGRATION,
        PARCOURSUP_STATUS.A_PUBLIER_HABILITATION,
        PARCOURSUP_STATUS.A_PUBLIER_VERIFIER_POSTBAC,
        PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR,
        PARCOURSUP_STATUS.A_PUBLIER,
        PARCOURSUP_STATUS.PUBLIE,
        PARCOURSUP_STATUS.REJETE,
        PARCOURSUP_STATUS.FERME,
      ].includes(formation?.parcoursup_statut)
    ) {
      body.parcoursup_raison_depublication = parcoursup_raison_depublication;
      body.parcoursup_statut = PARCOURSUP_STATUS.NON_PUBLIE;
      body.last_statut_update_date = date;
      body.parcoursup_published_date = null;
    }
  }
  return {
    body,
  };
};

const updateFormationWithCallback = async ({ body, formation, user, onFormationUpdate }) => {
  const updatedFormation = await updateFormation({ formation, body, user });

  onFormationUpdate(updatedFormation);
  return updatedFormation;
};

const PublishModal = ({ isOpen, onClose, formation, onFormationUpdate }) => {
  const [user] = useAuth();
  const [isAffelnetFormOpen, setAffelnetFormOpen] = useState(
    [AFFELNET_STATUS.PUBLIE, AFFELNET_STATUS.PRET_POUR_INTEGRATION].includes(formation?.affelnet_statut)
  );

  const [isParcoursupFormOpen, setParcoursupFormOpen] = useState(
    [PARCOURSUP_STATUS.PUBLIE, PARCOURSUP_STATUS.PRET_POUR_INTEGRATION].includes(formation?.parcoursup_statut)
  );

  const [isAffelnetUnpublishFormOpen, setAffelnetUnpublishFormOpen] = useState(
    [AFFELNET_STATUS.NON_PUBLIE].includes(formation?.affelnet_statut)
  );
  const [isParcoursupUnpublishFormOpen, setParcoursupUnpublishFormOpen] = useState(
    [PARCOURSUP_STATUS.NON_PUBLIE].includes(formation?.parcoursup_statut)
  );

  const { values, handleChange, handleSubmit, isSubmitting, setFieldValue, errors } = useFormik({
    enableReinitialize: true,
    initialValues: {
      affelnet: getPublishRadioValue(formation?.affelnet_statut),
      affelnet_infos_offre: formation?.affelnet_infos_offre ?? "",
      affelnet_url_infos_offre: formation?.affelnet_url_infos_offre ?? "",
      affelnet_modalites_offre: formation?.affelnet_modalites_offre ?? "",
      affelnet_url_modalites_offre: formation?.affelnet_url_modalites_offre ?? "",
      affelnet_raison_depublication: formation?.affelnet_raison_depublication ?? "",
      parcoursup: getPublishRadioValue(formation?.parcoursup_statut),
      parcoursup_raison_depublication: formation?.parcoursup_raison_depublication ?? "",
      uai_formation: formation?.uai_formation ?? "",
    },
    validationSchema: Yup.object().shape({
      affelnet_infos_offre: isAffelnetFormOpen
        ? Yup.string().nullable().max(1000, "Le champ ne doit pas dépasser 1000 caractères.")
        : Yup.string().nullable(),
      affelnet_url_infos_offre: isAffelnetFormOpen
        ? Yup.string()
            .url(
              "La valeur saisie doit être une URL valide : débutant par http:// ou https:// (en minuscules), avec ou sans www, se terminant .fr, .com, .eu, .nc, etc. Méthode recommandée pour l’enregistrement de cette URL : accédez à la page cible souhaitée, et copiez-coller l’adresse de la page."
            )
            .nullable()
            .matches(urlRegex, {
              message:
                "L’URL n’est pas autorisée. Les URL autorisées : sites des académies, régions académiques, monbureaunumerique.fr, index-education (.com ou .fr), onisep.fr.",
              excludeEmptyString: true,
            })
            .max(250, "Le champ ne doit pas dépasser 250 caractères.")
        : Yup.string().nullable(),
      affelnet_modalites_offre: isAffelnetFormOpen
        ? Yup.string().nullable().max(1000, "Le champ ne doit pas dépasser 1000 caractères.")
        : Yup.string().nullable(),
      affelnet_url_modalites_offre: isAffelnetFormOpen
        ? Yup.string()
            .url(
              "La valeur saisie doit être une URL valide : débutant par http:// ou https:// (en minuscules), avec ou sans www, se terminant .fr, .com, .eu, .nc, etc. Méthode recommandée pour l’enregistrement de cette URL : accédez à la page cible souhaitée, et copiez-coller l’adresse de la page."
            )
            .nullable()
            .matches(urlRegex, {
              message:
                "L’URL n’est pas autorisée. Les URL autorisées : sites des académies, régions académiques, monbureaunumerique.fr, index-education (.com ou .fr), onisep.fr.",
              excludeEmptyString: true,
            })
            .max(250, "Le champ ne doit pas dépasser 250 caractères.")
        : Yup.string().nullable(),

      affelnet_raison_depublication: isAffelnetUnpublishFormOpen
        ? Yup.string().nullable().required("Veuillez saisir la raison.")
        : Yup.string().nullable(),
      uai_formation:
        isParcoursupUnpublishFormOpen || isAffelnetUnpublishFormOpen
          ? Yup.string().min(8).max(8).nullable()
          : Yup.string()
              .min(8)
              .max(8)
              .required("L’UAI du lieu de formation doit obligatoirement être édité pour permettre la publication."),
      parcoursup_raison_depublication: isParcoursupUnpublishFormOpen
        ? Yup.string().nullable().required("Veuillez saisir la raison.")
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
          const updatedFormation = await updateFormationWithCallback({
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

  const isParcoursupPublishDisabled = [PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT].includes(formation?.parcoursup_statut);
  const isAffelnetPublishDisabled = [AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT].includes(formation?.affelnet_statut);

  const initialRef = React.useRef();

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
          <Text as="h4" textStyle="h4" fontSize="1.6rem">
            <Flex>
              <Text as={"span"}>
                <ArrowRightLine boxSize={26} />
              </Text>
              <Text as={"span"} ml={4}>
                Gérer les publications
              </Text>
            </Flex>
          </Text>
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
              <Text as="h3" textStyle="h3" fontSize="1.5rem" mb={3}>
                {formation.intitule_long}
              </Text>
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

                <Box data-testid={"af-publish-form"} style={{ display: isAffelnetFormOpen ? "block" : "none" }}>
                  <br />
                  <Text as="h5" textStyle="h5" fontSize="1.5rem" mb={3}>
                    Informations sur l'offre de formation (facultatif) :
                  </Text>
                  <Text>
                    Ces informations seront intégrées dans Affelnet pour être visibles sur le service en ligne
                    Affectation.
                  </Text>

                  <FormControl isInvalid={errors.affelnet_infos_offre}>
                    <FormLabel htmlFor="affelnet_infos_offre" mb={3} fontSize="epsilon"></FormLabel>

                    <Textarea
                      name="affelnet_infos_offre"
                      value={values.affelnet_infos_offre}
                      onChange={handleChange}
                      placeholder="Exemple :
                      BAC PRO en 3 ans"
                      rows={5}
                    />
                    <FormErrorMessage>{errors.affelnet_infos_offre}</FormErrorMessage>
                  </FormControl>
                  <br />
                  <FormControl isInvalid={errors.affelnet_url_infos_offre}>
                    <FormLabel htmlFor="affelnet_url_infos_offre" mb={3} fontSize="epsilon">
                      Information offre de formation (lien) (facultatif) :
                    </FormLabel>

                    <Textarea
                      name="affelnet_url_infos_offre"
                      value={values.affelnet_url_infos_offre}
                      onChange={handleChange}
                      placeholder="Exemple :
                      http://saio.ac-lyon.fr/spip/IMG/pdf/document_3eme_vers_apprentissage.pdf"
                      rows={2}
                    />
                    <FormErrorMessage>{errors.affelnet_url_infos_offre}</FormErrorMessage>
                  </FormControl>
                  <br />
                  <br />

                  <Text as="h5" textStyle="h5" fontSize="1.5rem" mb={3}>
                    Modalités particulières (facultatif) :
                  </Text>
                  <Text>
                    Ces informations seront intégrées dans Affelnet pour être visibles sur le service en ligne
                    Affectation.
                  </Text>

                  <FormControl isInvalid={errors.affelnet_modalites_offre}>
                    <FormLabel htmlFor="affelnet_modalites_offre" mb={3} fontSize="epsilon"></FormLabel>
                    <Textarea
                      name="affelnet_modalites_offre"
                      value={values.affelnet_modalites_offre}
                      onChange={handleChange}
                      placeholder="Exemple :
                      L'inscription dans une formation en apprentissage est soumise à la signature d'un contrat d'apprentissage avec un employeur.
                      La saisie d'un vœu sous statut d'apprenti ne génère aucune affectation ; il est saisi à titre d'information et de recensement. Il permet aux partenaires de l'apprentissage (CFA, Chambres consulaires, Développeurs de l'apprentissage, Région, CIO, Missions locales, Services rectoraux, DRAAF, DIRRECTE) de disposer de vos coordonnées afin de pouvoir vous accompagner dans vos démarches et recherche d'entreprise."
                      rows={5}
                    />
                    <FormErrorMessage>{errors.affelnet_modalites_offre}</FormErrorMessage>
                  </FormControl>
                  <br />
                  <FormControl isInvalid={errors.affelnet_url_modalites_offre}>
                    <FormLabel htmlFor="affelnet_url_modalites_offre" mb={3} fontSize="epsilon">
                      Modalités particulières (lien) (facultatif) :
                    </FormLabel>

                    <Textarea
                      name="affelnet_url_modalites_offre"
                      value={values.affelnet_url_modalites_offre}
                      onChange={handleChange}
                      placeholder="Exemple :
                        http://saio.ac-lyon.fr/spip/IMG/pdf/document_3eme_vers_apprentissage.pdf"
                      rows={2}
                    />
                    <FormErrorMessage>{errors.affelnet_url_modalites_offre}</FormErrorMessage>
                  </FormControl>
                </Box>

                <Box style={{ display: isAffelnetFormOpen ? "block" : "none" }}>
                  <FormControl
                    isRequired
                    isInvalid={errors.uai_formation}
                    display="flex"
                    flexDirection="column"
                    w="auto"
                    mt={3}
                  >
                    {/* <br />
                    {(!formation?.uai_formation ||
                      formation?.uai_formation === "" ||
                      !formation?.uai_formation_valide) && (
                      <DangerBox mb={1}>
                        L’UAI du lieu de formation doit obligatoirement être édité pour permettre l’envoi à Parcoursup
                      </DangerBox>
                    )} */}

                    <Input type="hidden" name="uai_formation" value={values.uai_formation} />
                    <FormErrorMessage>{errors.uai_formation}</FormErrorMessage>
                  </FormControl>
                </Box>

                <Box
                  data-testid={"af-unpublish-form"}
                  style={{ display: isAffelnetUnpublishFormOpen ? "block" : "none" }}
                >
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
                      name="affelnet_raison_depublication"
                      value={values.affelnet_raison_depublication}
                      onChange={handleChange}
                      placeholder="Précisez ici la raison pour laquelle vous ne souhaitez pas publier la formation sur Affelnet"
                      rows={2}
                    />
                    <FormErrorMessage>{errors.affelnet_raison_depublication}</FormErrorMessage>
                  </FormControl>
                </Box>
              </Flex>
            </Box>

            <Box
              border="1px solid"
              borderColor="bluefrance"
              p={8}
              flexBasis={{ base: "100%", md: "48%" }}
              mt={{ base: 2, md: 0 }}
            >
              <Text as="h3" textStyle="h3" fontSize="1.5rem" mb={3}>
                {formation.intitule_long}
              </Text>
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
                          setParcoursupFormOpen(true);
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
                          setParcoursupFormOpen(false);
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

                <Box data-testid={"ps-publish-form"} style={{ display: isParcoursupFormOpen ? "block" : "none" }}>
                  <FormControl
                    isRequired
                    isInvalid={errors.uai_formation}
                    display="flex"
                    flexDirection="column"
                    w="auto"
                    mt={3}
                  >
                    {/* <br />
                    {(!formation?.uai_formation ||
                      formation?.uai_formation === "" ||
                      !formation?.uai_formation_valide) && (
                      <DangerBox mb={1}>
                        L’UAI du lieu de formation doit obligatoirement être édité pour permettre l’envoi à Parcoursup
                      </DangerBox>
                    )} */}

                    <Input type="hidden" name="uai_formation" value={values.uai_formation} />
                    <FormErrorMessage>{errors.uai_formation}</FormErrorMessage>
                  </FormControl>
                </Box>

                <Box
                  data-testid={"ps-unpublish-form"}
                  style={{ display: isParcoursupUnpublishFormOpen ? "block" : "none" }}
                >
                  <FormControl
                    isRequired
                    isInvalid={errors.parcoursup_raison_depublication}
                    display="flex"
                    flexDirection="column"
                    w="auto"
                    mt={3}
                  >
                    <FormLabel htmlFor="parcoursup_raison_depublication" mb={3} fontSize="epsilon" fontWeight={400}>
                      Raison de non publication:
                    </FormLabel>
                    <Flex flexDirection="column" w="100%">
                      <Textarea
                        data-testid="ps-depublication"
                        name="parcoursup_raison_depublication"
                        value={values.parcoursup_raison_depublication}
                        onChange={handleChange}
                        placeholder="Précisez ici la raison pour laquelle vous ne souhaitez pas publier la formation sur Parcoursup"
                        rows={2}
                      />
                      <FormErrorMessage>{errors.parcoursup_raison_depublication}</FormErrorMessage>
                    </Flex>
                  </FormControl>
                </Box>
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

export { PublishModal, getPublishRadioValue, getSubmitBody, updateFormationWithCallback };
