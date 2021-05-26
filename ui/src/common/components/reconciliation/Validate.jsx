import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Radio,
  RadioGroup,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { useFormik } from "formik";
import { _put } from "../../httpClient";
import useAuth from "../../hooks/useAuth";
import { buildUpdatesHistory } from "../../utils/formationUtils";
import * as Yup from "yup";
import { ValidateIcon } from "../../../theme/components/icons";

const endpointNewFront = `${process.env.REACT_APP_BASE_URL}/api`;

const Validate = ({ formation, onClose }) => {
  const [user] = useAuth();

  const [canSubmit, setCanSubmit] = useState(false);

  const { values, handleChange, handleSubmit, isSubmitting, setFieldValue, errors } = useFormik({
    initialValues: {
      parcoursup: undefined,
    },
    onSubmit: ({ parcoursup }) => {
      return new Promise(async (resolve) => {
        // const body = {};
        // let shouldRemoveAfReconciliation = false;
        // let shouldRemovePsReconciliation = false;
        // let shouldRestoreAfReconciliation = false;
        // let shouldRestorePsReconciliation = false;

        // // check if can edit depending on the status
        // if (affelnet === "true") {
        //   if (["non publié", "à publier (soumis à validation)", "à publier"].includes(formation?.affelnet_statut)) {
        //     body.affelnet_statut = "en attente de publication";
        //     body.affelnet_infos_offre = affelnet_infos_offre;
        //     body.affelnet_raison_depublication = null;
        //     shouldRestoreAfReconciliation = formation.affelnet_statut === "non publié";
        //   } else if (["publié"].includes(formation?.affelnet_statut)) {
        //     body.affelnet_infos_offre = affelnet_infos_offre;
        //   }
        // } else if (affelnet === "false") {
        //   if (
        //     ["en attente de publication", "à publier (soumis à validation)", "à publier", "publié"].includes(
        //       formation?.affelnet_statut
        //     )
        //   ) {
        //     body.affelnet_raison_depublication = affelnet_raison_depublication;
        //     body.affelnet_statut = "non publié";
        //     shouldRemoveAfReconciliation = ["en attente de publication", "publié"].includes(
        //       formation.parcoursup_statut
        //     );
        //   }
        // }

        // if (parcoursup === "true") {
        //   if (
        //     [
        //       "non publié",
        //       "à publier (vérifier accès direct postbac)",
        //       "à publier (soumis à validation Recteur)",
        //       "à publier",
        //     ].includes(formation?.parcoursup_statut)
        //   ) {
        //     body.parcoursup_statut = "en attente de publication";
        //     shouldRestorePsReconciliation = formation.parcoursup_statut === "non publié";
        //     body.parcoursup_raison_depublication = null;
        //   }
        // } else if (parcoursup === "false") {
        //   if (
        //     [
        //       "en attente de publication",
        //       "à publier (vérifier accès direct postbac)",
        //       "à publier (soumis à validation Recteur)",
        //       "à publier",
        //       "publié",
        //     ].includes(formation?.parcoursup_statut)
        //   ) {
        //     body.parcoursup_raison_depublication = parcoursup_raison_depublication;
        //     body.parcoursup_statut = "non publié";
        //     shouldRemovePsReconciliation = ["en attente de publication", "publié"].includes(
        //       formation.parcoursup_statut
        //     );
        //   }
        // }

        // if (Object.keys(body).length > 0) {
        //   const updatedFormation = await _put(`${endpointNewFront}/entity/formations2021/${formation._id}`, {
        //     num_academie: formation.num_academie,
        //     ...body,
        //     last_update_who: user.email,
        //     last_update_at: Date.now(),
        //     updates_history: buildUpdatesHistory(
        //       formation,
        //       { ...body, last_update_who: user.email },
        //       Object.keys(body)
        //     ),
        //   });

        //   if (shouldRemoveAfReconciliation || shouldRestoreAfReconciliation) {
        //     try {
        //       await _put(`${endpointNewFront}/affelnet/reconciliation`, {
        //         uai_formation: formation.uai_formation,
        //         uai_gestionnaire: formation.etablissement_gestionnaire_uai,
        //         uai_formateur: formation.etablissement_formateur_uai,
        //         cfd: formation.cfd,
        //         email: shouldRemoveAfReconciliation ? user.email : null,
        //       });
        //     } catch (e) {
        //       // do nothing
        //     }
        //   }

        //   if (shouldRemovePsReconciliation || shouldRestorePsReconciliation) {
        //     try {
        //       await _put(`${endpointNewFront}/parcoursup/reconciliation`, {
        //         uai_gestionnaire: formation.etablissement_gestionnaire_uai,
        //         uai_affilie: formation.etablissement_formateur_uai,
        //         cfd: formation.cfd,
        //         email: shouldRemovePsReconciliation ? user.email : null,
        //       });
        //     } catch (e) {
        //       // do nothing
        //     }
        //   }

        //   // onFormationUpdate(updatedFormation);
        //   setFieldValue("affelnet", getPublishRadioValue(updatedFormation?.affelnet_statut));
        //   setFieldValue("parcoursup", getPublishRadioValue(updatedFormation?.parcoursup_statut));
        //   setFieldValue("affelnet_infos_offre", updatedFormation?.affelnet_infos_offre);
        //   setFieldValue("affelnet_raison_depublication", updatedFormation?.affelnet_raison_depublication);
        //   setFieldValue("parcoursup_raison_depublication", updatedFormation?.parcoursup_raison_depublication);
        // }

        resolve("onSubmitHandler publish complete");
      });
    },
  });

  return (
    <>
      <Flex px={[4, 16]} mb="3">
        <Box border="1px solid" borderColor="bluefrance" p={8} w="full">
          <Heading as="h3" fontSize="1.5rem" mb={3}>
            Récapitualif
          </Heading>
          <Text as="span">
            La formation Parcoursup “BTS - Services Communication - en apprentissage” associée à l’organisme “Ecole
            Auvergne Formation” a bien été rapprochée à la formation du Catalogue 2021 “COMMUNICATION (BTS)” associée à
            l’organisme “EAF”
          </Text>
        </Box>
      </Flex>
      <Flex px={[4, 16]} pb={[4, 16]}>
        <Box border="1px solid" borderColor="bluefrance" p={8} w="full">
          <Heading as="h3" fontSize="1.5rem" mb={3}>
            Gérer la publication
          </Heading>
          <Text
            as="div"
            variant="highlight"
            borderLeft="3px solid"
            borderColor="greensoft.500"
            display="flex"
            flexDirection="row"
            justifyContent="center"
            alignItems="flex-start"
            p={3}
            mb={5}
          >
            <ValidateIcon width="14px" height="14px" color="greensoft.500" mr="2" mt="0.35rem" />
            <Text fontWeight="normal">
              La formation répond bien aux conditions d’intégrations à la plateforme Parcoursup
            </Text>
          </Text>
          <Flex flexDirection="column">
            <FormControl display="flex" flexDirection="column" w="auto">
              <FormLabel htmlFor="parcoursup" mb={3} fontSize="epsilon" fontWeight={400}>
                Elle apparait aujourd’hui dans le Catalogue 2021 sous le statut “publiée”.
                <Text fontWeight="bold">Conserver la publication dans Parcoursup ?</Text>
              </FormLabel>
              <RadioGroup defaultValue={values.parcoursup} id="parcoursup" name="parcoursup">
                <Stack spacing={2} direction="column">
                  <Radio
                    mb={0}
                    size="lg"
                    value="true"
                    onChange={(evt) => {
                      setCanSubmit(true);
                      handleChange(evt);
                    }}
                  >
                    <Text as={"span"} fontSize="zeta">
                      Oui
                    </Text>
                  </Radio>
                  <Radio
                    mb={0}
                    size="lg"
                    value="false"
                    onChange={(evt) => {
                      setCanSubmit(true);
                      handleChange(evt);
                    }}
                  >
                    <Text as={"span"} fontSize="zeta">
                      Non
                    </Text>
                  </Radio>
                </Stack>
              </RadioGroup>
            </FormControl>
          </Flex>
        </Box>
      </Flex>
      <Box boxShadow={"0 -4px 16px 0 rgba(0, 0, 0, 0.08)"}>
        <Flex flexDirection={["column", "row"]} p={[3, 8]} justifyContent="flex-end">
          <Button
            variant="secondary"
            onClick={() => {
              setFieldValue("parcoursup", undefined);
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
            onClick={handleSubmit}
            isLoading={isSubmitting}
            loadingText="Enregistrement des modifications"
            isDisabled={!canSubmit}
          >
            Enregistrer
          </Button>
        </Flex>
      </Box>
    </>
  );
};

export { Validate };
