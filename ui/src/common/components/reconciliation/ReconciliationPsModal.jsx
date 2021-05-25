import {
  Box,
  Button,
  Flex,
  FormControl,
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
// import { StatusBadge } from "../StatusBadge";
import { InfoBadge } from "../InfoBadge";
import React, { useState } from "react";
import { useFormik } from "formik";
import { _put } from "../../httpClient";
import useAuth from "../../hooks/useAuth";
import { buildUpdatesHistory } from "../../utils/formationUtils";
import * as Yup from "yup";
import { Close } from "../../../theme/components/icons/Close";
import { ArrowRightLine } from "../../../theme/components/icons";
import InfoTooltip from "../../../common/components/InfoTooltip";

const endpointNewFront = `${process.env.REACT_APP_BASE_URL}/api`;

const getPublishRadioValue = (status) => {
  if (["publié", "en attente de publication"].includes(status)) {
    return "true";
  }
  if (["non publié"].includes(status)) {
    return "false";
  }

  return undefined;
};

const ReconciliationPsModal = ({ isOpen, onClose, formation, onFormationUpdate }) => {
  const [user] = useAuth();
  const [isAffelnetFormOpen, setAffelnetFormOpen] = useState(
    ["publié", "en attente de publication"].includes(formation?.affelnet_statut)
  );

  const [isAffelnetUnpublishFormOpen, setAffelnetUnpublishFormOpen] = useState(
    ["non publié"].includes(formation?.affelnet_statut)
  );
  const [isParcoursupUnpublishFormOpen, setParcousupUnpublishFormOpen] = useState(
    ["non publié"].includes(formation?.parcoursup_statut)
  );

  const { values, handleChange, handleSubmit, isSubmitting, setFieldValue, errors } = useFormik({
    initialValues: {
      affelnet: getPublishRadioValue(formation?.affelnet_statut),
      parcoursup: getPublishRadioValue(formation?.parcoursup_statut),
      affelnet_infos_offre: formation?.affelnet_infos_offre ?? "",
      affelnet_raison_depublication: formation?.affelnet_raison_depublication ?? "",
      parcoursup_raison_depublication: formation?.parcoursup_raison_depublication ?? "",
    },
    validationSchema: Yup.object().shape({
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
      affelnet_raison_depublication,
      parcoursup_raison_depublication,
    }) => {
      return new Promise(async (resolve) => {
        const body = {};
        let shouldRemoveAfReconciliation = false;
        let shouldRemovePsReconciliation = false;
        let shouldRestoreAfReconciliation = false;
        let shouldRestorePsReconciliation = false;

        // check if can edit depending on the status
        if (affelnet === "true") {
          if (["non publié", "à publier (soumis à validation)", "à publier"].includes(formation?.affelnet_statut)) {
            body.affelnet_statut = "en attente de publication";
            body.affelnet_infos_offre = affelnet_infos_offre;
            body.affelnet_raison_depublication = null;
            shouldRestoreAfReconciliation = formation.affelnet_statut === "non publié";
          } else if (["publié"].includes(formation?.affelnet_statut)) {
            body.affelnet_infos_offre = affelnet_infos_offre;
          }
        } else if (affelnet === "false") {
          if (
            ["en attente de publication", "à publier (soumis à validation)", "à publier", "publié"].includes(
              formation?.affelnet_statut
            )
          ) {
            body.affelnet_raison_depublication = affelnet_raison_depublication;
            body.affelnet_statut = "non publié";
            shouldRemoveAfReconciliation = ["en attente de publication", "publié"].includes(
              formation.parcoursup_statut
            );
          }
        }

        if (parcoursup === "true") {
          if (
            [
              "non publié",
              "à publier (vérifier accès direct postbac)",
              "à publier (soumis à validation Recteur)",
              "à publier",
            ].includes(formation?.parcoursup_statut)
          ) {
            body.parcoursup_statut = "en attente de publication";
            shouldRestorePsReconciliation = formation.parcoursup_statut === "non publié";
            body.parcoursup_raison_depublication = null;
          }
        } else if (parcoursup === "false") {
          if (
            [
              "en attente de publication",
              "à publier (vérifier accès direct postbac)",
              "à publier (soumis à validation Recteur)",
              "à publier",
              "publié",
            ].includes(formation?.parcoursup_statut)
          ) {
            body.parcoursup_raison_depublication = parcoursup_raison_depublication;
            body.parcoursup_statut = "non publié";
            shouldRemovePsReconciliation = ["en attente de publication", "publié"].includes(
              formation.parcoursup_statut
            );
          }
        }

        if (Object.keys(body).length > 0) {
          const updatedFormation = await _put(`${endpointNewFront}/entity/formations2021/${formation._id}`, {
            num_academie: formation.num_academie,
            ...body,
            last_update_who: user.email,
            last_update_at: Date.now(),
            updates_history: buildUpdatesHistory(
              formation,
              { ...body, last_update_who: user.email },
              Object.keys(body)
            ),
          });

          if (shouldRemoveAfReconciliation || shouldRestoreAfReconciliation) {
            try {
              await _put(`${endpointNewFront}/affelnet/reconciliation`, {
                uai_formation: formation.uai_formation,
                uai_gestionnaire: formation.etablissement_gestionnaire_uai,
                uai_formateur: formation.etablissement_formateur_uai,
                cfd: formation.cfd,
                email: shouldRemoveAfReconciliation ? user.email : null,
              });
            } catch (e) {
              // do nothing
            }
          }

          if (shouldRemovePsReconciliation || shouldRestorePsReconciliation) {
            try {
              await _put(`${endpointNewFront}/parcoursup/reconciliation`, {
                uai_gestionnaire: formation.etablissement_gestionnaire_uai,
                uai_affilie: formation.etablissement_formateur_uai,
                cfd: formation.cfd,
                email: shouldRemovePsReconciliation ? user.email : null,
              });
            } catch (e) {
              // do nothing
            }
          }

          onFormationUpdate(updatedFormation);
          setFieldValue("affelnet", getPublishRadioValue(updatedFormation?.affelnet_statut));
          setFieldValue("parcoursup", getPublishRadioValue(updatedFormation?.parcoursup_statut));
          setFieldValue("affelnet_infos_offre", updatedFormation?.affelnet_infos_offre);
          setFieldValue("affelnet_raison_depublication", updatedFormation?.affelnet_raison_depublication);
          setFieldValue("parcoursup_raison_depublication", updatedFormation?.parcoursup_raison_depublication);
        }

        onClose();
        resolve("onSubmitHandler publish complete");
      });
    },
  });

  const isParcoursupPublishDisabled = ["hors périmètre"].includes(formation?.parcoursup_statut);
  const isAffelnetPublishDisabled = ["hors périmètre"].includes(formation?.affelnet_statut);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <ModalOverlay />
      <ModalContent bg="white" color="primaryText" borderRadius="none" my="0">
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
          <Heading as="h2" fontSize="2rem">
            <Flex>
              <Text as={"span"}>
                <ArrowRightLine boxSize={26} />
              </Text>
              <Text as={"span"} ml={4}>
                Valider le rapprochement de l’offre de formation
              </Text>
            </Flex>
          </Heading>
        </ModalHeader>
        <ModalBody p={0} display="flex" flexDirection="column">
          <Box px={[4, 16]}>
            <Heading as="h3" fontSize="1.5rem" mb={3} color="bluefrance">
              Vérifier la similitude des informations
            </Heading>
          </Box>
          <Flex px={[4, 16]} pb={[4, 16]} flexGrow="1">
            <Box border="1px solid" borderColor="bluefrance" p={8} w="50%">
              <Heading as="h3" fontSize="1.5rem" mb={3}>
                Informations Parcoursup
              </Heading>
              <Flex flexDirection="column">
                {/* <Box mb={3}>
                  <StatusBadge source="Parcoursup" status={formation?.parcoursup_statut} />
                </Box> */}
                <Text mb={4} mt={4}>
                  Libellé formation : <InfoTooltip description={"tooltip"} />
                  <Text as="span" variant="highlight">
                    {formation.libelle_formation}
                  </Text>{" "}
                </Text>
                <Text mb={4} mt={4}>
                  Code formation diplôme : <InfoTooltip description={"tooltip"} />
                  <Text as="span" variant="highlight">
                    {formation.codes_cfd_mna.join(",")}
                  </Text>{" "}
                </Text>
                <Text mb={4} mt={4}>
                  Codes UAI collectés : <InfoTooltip description={"tooltip"} />
                  <Text as="span" variant="highlight">
                    {formation.uai_gestionnaire}
                    <InfoBadge text="Gestionnaire" variant="published" />
                  </Text>
                  <Text as="span" variant="highlight">
                    {formation.uai_composante}
                    <InfoBadge text="Composante" variant="published" />
                  </Text>
                  <Text as="span" variant="highlight">
                    {formation.uai_affilie}
                    <InfoBadge text="Affilié" variant="published" />
                  </Text>
                </Text>
                <Text mb={4} mt={4}>
                  Siret : <InfoTooltip description={"tooltip"} />
                  <Text as="span" variant="highlight">
                    {formation.siret_cerfa}
                  </Text>{" "}
                </Text>
                <Text mb={4} mt={4}>
                  Nom de l’établissement : <InfoTooltip description={"tooltip"} />
                  <Text as="span" variant="highlight">
                    {formation.libelle_uai_composante}
                  </Text>{" "}
                </Text>
                <Text mb={4} mt={4}>
                  Adresse : <InfoTooltip description={"tooltip"} />
                  <Text as="span" variant="highlight">
                    {formation.complement_adresse_1}
                  </Text>{" "}
                </Text>
              </Flex>
            </Box>
            <Box border="1px solid" borderColor="bluefrance" p={8} w="50%">
              <Heading as="h3" fontSize="1.5rem" mb={3}>
                Informations Catalogue 2021
              </Heading>
              <Flex flexDirection="column">
                <Text mb={4} mt={4}>
                  Libellé formation : <InfoTooltip description={"tooltip"} />
                  <Text as="span" variant="highlight">
                    {formation.libelle_formation}
                  </Text>{" "}
                </Text>
                <Text mb={4} mt={4}>
                  Code formation diplôme BCN : <InfoTooltip description={"tooltip"} />
                  <Text as="span" variant="highlight">
                    {formation.codes_cfd_mna.join(",")}
                  </Text>{" "}
                </Text>
                <Text mb={4} mt={4}>
                  Code UAI du lieu de formation : <InfoTooltip description={"tooltip"} />
                  <Text as="span" variant="highlight">
                    {formation.uai_gestionnaire}
                    <InfoBadge text="Formation" variant="published" />
                  </Text>
                </Text>
                <Text mb={4} mt={4}>
                  Code UAI rattaché au SIRET : <InfoTooltip description={"tooltip"} />
                  <Text as="span" variant="highlight">
                    {formation.uai_gestionnaire}
                    <InfoBadge text="Formateur" variant="published" />
                  </Text>
                </Text>
                <Text mb={4} mt={4}>
                  Siret Organisme : <InfoTooltip description={"tooltip"} />
                  <Text as="span" variant="highlight">
                    {formation.siret_cerfa}
                  </Text>{" "}
                </Text>
                <Text mb={4} mt={4}>
                  Lieu de la formation : <InfoTooltip description={"tooltip"} />
                  <Text as="span" variant="highlight">
                    {formation.complement_adresse_1}
                  </Text>{" "}
                </Text>
                <Text mb={4} mt={4}>
                  Enseigne : <InfoTooltip description={"tooltip"} />
                  <Text as="span" variant="highlight">
                    {formation.complement_adresse_1}
                  </Text>{" "}
                </Text>
                <Text mb={4} mt={4}>
                  Adresse de l’organisme : <InfoTooltip description={"tooltip"} />
                  <Text as="span" variant="highlight">
                    {formation.complement_adresse_1}
                  </Text>{" "}
                </Text>
              </Flex>
            </Box>
          </Flex>
          <Box boxShadow={"0 -4px 16px 0 rgba(0, 0, 0, 0.08)"}>
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
                variant="secondary"
                onClick={() => {
                  onClose();
                }}
                mr={[0, 4]}
                px={8}
                mb={[3, 0]}
                color="redmarianne"
                borderColor="redmarianne"
              >
                Rejeter
              </Button>
              <Button
                type="submit"
                variant="primary"
                onClick={handleSubmit}
                isLoading={isSubmitting}
                loadingText="Enregistrement des modifications"
              >
                Valider
              </Button>
            </Flex>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export { ReconciliationPsModal };
