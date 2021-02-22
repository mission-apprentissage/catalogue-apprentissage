import {
  Box,
  Button,
  Center,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  Stack,
  Textarea,
} from "@chakra-ui/react";
import { StatusBadge } from "../StatusBadge";
import React, { useState } from "react";
import { useFormik } from "formik";
import { _put } from "../../httpClient";
import useAuth from "../../hooks/useAuth";

const endpointNewFront = process.env.REACT_APP_ENDPOINT_NEW_FRONT || "https://catalogue.apprentissage.beta.gouv.fr/api";

const getPublishRadioValue = (status) => {
  if (["publié", "en attente de publication"].includes(status)) {
    return "true";
  }
  if (["non publié"].includes(status)) {
    return "false";
  }

  return undefined;
};

const PublishModal = ({ isOpen, onClose, formation, onFormationUpdate }) => {
  const [user] = useAuth();
  const [isAffelnetFormOpen, setAffelnetFormOpen] = useState(
    ["publié", "en attente de publication"].includes(formation?.affelnet_statut)
  );

  const { values, handleChange, handleSubmit, isSubmitting, setFieldValue } = useFormik({
    initialValues: {
      affelnet: getPublishRadioValue(formation?.affelnet_statut),
      parcoursup: getPublishRadioValue(formation?.parcoursup_statut),
      affelnet_infos_offre: formation?.affelnet_infos_offre,
    },
    onSubmit: ({ affelnet, parcoursup, affelnet_infos_offre }) => {
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
            shouldRestoreAfReconciliation = formation.affelnet_statut === "non publié";
          }
        } else if (affelnet === "false") {
          if (
            ["en attente de publication", "à publier (soumis à validation)", "à publier", "publié"].includes(
              formation?.affelnet_statut
            )
          ) {
            body.affelnet_statut = "non publié";
            shouldRemoveAfReconciliation = ["en attente de publication", "publié"].includes(
              formation.parcoursup_statut
            );
          }
        }

        if (parcoursup === "true") {
          if (["non publié", "à publier (soumis à validation)", "à publier"].includes(formation?.parcoursup_statut)) {
            body.parcoursup_statut = "en attente de publication";
            shouldRestorePsReconciliation = formation.parcoursup_statut === "non publié";
          }
        } else if (parcoursup === "false") {
          if (
            ["en attente de publication", "à publier (soumis à validation)", "à publier", "publié"].includes(
              formation?.parcoursup_statut
            )
          ) {
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
                uai_affilie: formation.uai_formation,
                uai_composante: formation.etablissement_formateur_uai,
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
        }

        onClose();
        resolve("onSubmitHandler publish complete");
      });
    },
  });

  const isParcoursupPublishDisabled = ["hors périmètre"].includes(formation?.parcoursup_statut);
  const isAffelnetPublishDisabled = ["hors périmètre"].includes(formation?.affelnet_statut);

  return (
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
                <RadioGroup defaultValue={values.affelnet} id="affelnet" name="affelnet">
                  <Stack spacing={4} direction="row">
                    <Radio
                      mb={0}
                      size="lg"
                      value="true"
                      isDisabled={isAffelnetPublishDisabled}
                      onChange={(evt) => {
                        setAffelnetFormOpen(true);
                        handleChange(evt);
                      }}
                    >
                      Oui
                    </Radio>
                    <Radio
                      mb={0}
                      size="lg"
                      value="false"
                      isDisabled={isAffelnetPublishDisabled}
                      onChange={(evt) => {
                        setAffelnetFormOpen(false);
                        handleChange(evt);
                      }}
                    >
                      Non
                    </Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>
              <FormControl display={isAffelnetFormOpen ? "flex" : "none"} alignItems="center" w="auto" mt={3}>
                <FormLabel htmlFor="affelnet_infos_offre" mb={0} fontSize="delta" fontWeight={700}>
                  Informations offre de formation (facultatif) :
                </FormLabel>
                <Textarea
                  name="affelnet_infos_offre"
                  value={values.affelnet_infos_offre}
                  onChange={handleChange}
                  placeholder="Précisez ici les informations complémentaires que vous souhaitez voir figurer sur la fiche de la formation sur Affelnet, ex : démarches sur obtention contrat apprentissage, modalités inscription, rythme alternance, date entrée formation..."
                  rows={7}
                />
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
                <RadioGroup defaultValue={values.parcoursup} id="parcoursup" name="parcoursup">
                  <Stack spacing={4} direction="row">
                    <Radio
                      mb={0}
                      size="lg"
                      value="true"
                      isDisabled={isParcoursupPublishDisabled}
                      onChange={handleChange}
                    >
                      Oui
                    </Radio>
                    <Radio
                      mb={0}
                      size="lg"
                      value="false"
                      isDisabled={isParcoursupPublishDisabled}
                      onChange={handleChange}
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
                  setFieldValue("affelnet", getPublishRadioValue(formation?.affelnet_statut));
                  setFieldValue("parcoursup", getPublishRadioValue(formation?.parcoursup_statut));
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
                onClick={handleSubmit}
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

export { PublishModal };
