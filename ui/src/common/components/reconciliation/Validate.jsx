import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Radio,
  RadioGroup,
  Stack,
  Text,
  Textarea,
  FormErrorMessage,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { useFormik } from "formik";
import useAuth from "../../hooks/useAuth";
import { buildUpdatesHistory } from "../../utils/formationUtils";
import * as Yup from "yup";
import { ValidateIcon, DoubleArrows, ErrorIcon } from "../../../theme/components/icons";
import { _post, _put } from "../../../common/httpClient";

const Validate = ({ formation, mnaFormation, onClose, onValidationSubmit }) => {
  const [canSubmit, setCanSubmit] = useState(false);
  const [showRaison, setShowRaison] = useState(false);
  const [user] = useAuth();

  const { values, handleChange, handleSubmit, isSubmitting, setFieldValue, errors } = useFormik({
    initialValues: {
      parcoursup_keep_publish: undefined,
      parcoursup_raison_depublication: "",
    },
    validationSchema: Yup.object().shape({
      parcoursup_keep_publish: Yup.string().nullable(),
      parcoursup_raison_depublication: showRaison
        ? Yup.string().nullable().required("Veuillez saisir la raison")
        : Yup.string().nullable(),
    }),
    onSubmit: ({ parcoursup_keep_publish, parcoursup_raison_depublication }) => {
      return new Promise(async (resolve) => {
        const body = {};
        let shouldRemovePsReconciliation = false;
        let shouldRestorePsReconciliation = false;
        if (parcoursup_keep_publish === "true") {
          // if (
          //   [
          //     "non publié",
          //     "à publier (vérifier accès direct postbac)",
          //     "à publier (soumis à validation Recteur)",
          //     "en attente de publication",
          //     "à publier",
          //   ].includes(mnaFormation?.parcoursup_statut)
          // ) {
          body.parcoursup_statut = "publié";
          shouldRestorePsReconciliation = mnaFormation.parcoursup_statut === "non publié";
          body.parcoursup_raison_depublication = null;
          // }
        } else if (parcoursup_keep_publish === "false") {
          // if (
          //   [
          //     "en attente de publication",
          //     "à publier (vérifier accès direct postbac)",
          //     "à publier (soumis à validation Recteur)",
          //     "à publier",
          //     "publié",
          //   ].includes(mnaFormation?.parcoursup_statut)
          // ) {
          body.parcoursup_raison_depublication = parcoursup_raison_depublication;
          body.parcoursup_statut = "non publié";
          shouldRemovePsReconciliation = ["en attente de publication", "publié"].includes(
            mnaFormation.parcoursup_statut
          );
          // }
        }

        if (Object.keys(body).length > 0) {
          await _put(`/api/entity/formations2021/${mnaFormation._id}`, {
            num_academie: mnaFormation.num_academie,
            ...body,
            last_update_who: user.email,
            last_update_at: Date.now(),
            updates_history: buildUpdatesHistory(
              mnaFormation,
              { ...body, last_update_who: user.email },
              Object.keys(body)
            ),
          });

          if (shouldRemovePsReconciliation || shouldRestorePsReconciliation) {
            try {
              await _put(`/api/parcoursup/reconciliation`, {
                uai_gestionnaire: mnaFormation.etablissement_gestionnaire_uai,
                uai_affilie: mnaFormation.etablissement_formateur_uai,
                cfd: mnaFormation.cfd,
                email: shouldRemovePsReconciliation ? user.email : null,
              });
            } catch (e) {
              // do nothing
            }
          }
        }

        const mapping = [];

        mapping.push({
          id: mnaFormation.etablissement_formateur_id,
          siret: mnaFormation.etablissement_formateur_siret,
          type: "formateur",
        });
        mapping.push({
          id: mnaFormation.etablissement_gestionnaire_id,
          siret: mnaFormation.etablissement_gestionnaire_siret,
          type: "gestionnaire",
        });

        await _post("/api/parcoursup/reconciliation", {
          id_formation: formation._id,
          id_parcoursup: formation.id_parcoursup,
          uai_affilie: formation.uai_affilie,
          uai_gestionnaire: formation.uai_gestionnaire,
          uai_composante: formation.uai_composante,
          code_cfd: mnaFormation.cfd,
          mnaFormationId: mnaFormation._id,
          mapping,
          reject: false,
        });

        onValidationSubmit();
        resolve("onSubmitHandler publish complete");
      });
    },
  });

  return (
    <Flex flexDirection="row-reverse" px={[4, 16]}>
      <Flex w="35%">
        <Box p={8} w="full">
          <Heading as="h3" fontSize="1.5rem" mb={3}>
            Récapilutatif du rapprochement
          </Heading>
          <Box mb={4} mt={4}>
            Formation Parcoursup
            <Text as="span" variant="highlight" mt="1" display="inline-block">
              {formation.libelle_specialite}
            </Text>
            <br />
            <br />
            <Text as="span" variant="highlight" mt="1" display="inline-block">
              {formation.libelle_uai_composante}
            </Text>
          </Box>
          <DoubleArrows width="12px" height="14px" color="grey.800" my={5} />
          <Box mb={4} mt={4}>
            rapproché à la formation du Catalogue 2021
            <Text as="span" variant="highlight" mt="1" display="inline-block">
              {mnaFormation.intitule_long}
            </Text>
            <br />
            <br />
            <Text as="span" variant="highlight" mt="1" display="inline-block">
              {mnaFormation.etablissement_gestionnaire_entreprise_raison_sociale ||
                mnaFormation.etablissement_gestionnaire_enseigne}
            </Text>
          </Box>
        </Box>
      </Flex>
      <Flex w="65%">
        <Box p={8} w="full">
          <Heading as="h3" fontSize="1.3rem" mb={3} color="bluefrance" flexGrow="1">
            Vérification automatique des conditions d’intégration
          </Heading>
          {(mnaFormation.parcoursup_statut === "publié" || mnaFormation.parcoursup_statut === "à publier") && (
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
                La formation est paramétrée dans la plateforme Parcoursup et répond bien aux conditions d’intégration.{" "}
                <Text fontWeight="bold" as="span">
                  Elle apparait aujourd’hui dans le Catalogue 2021 sous le statut{" "}
                  {mnaFormation.parcoursup_statut === "publié" ? "“publiée”" : "“à publier”"}.
                </Text>
              </Text>
            </Text>
          )}
          {mnaFormation.parcoursup_statut === "hors périmètre" && (
            <Text
              as="div"
              variant="highlight"
              borderLeft="3px solid"
              borderColor="redmarianne"
              display="flex"
              flexDirection="row"
              justifyContent="center"
              alignItems="flex-start"
              p={3}
              mb={5}
            >
              <ErrorIcon color="redmarianne" mr="2" mt="0.35rem" />
              <Text fontWeight="normal">
                La formation est paramétrée dans la plateforme Parcoursup mais ne répond pas aux conditions
                d’intégration.
                <Text fontWeight="bold" as="span">
                  Elle apparait aujourd’hui dans le Catalogue 2021 sous le statut “hors-périmètre”.
                  <br />
                  <br />
                  Elle sera donc automatiquement passée au statut “dé-publiée”
                </Text>
                <br />
                <br />
                <Button
                  type="submit"
                  variant="primary"
                  onClick={handleSubmit}
                  isLoading={isSubmitting}
                  loadingText="Enregistrement..."
                >
                  J’ai compris
                </Button>
              </Text>
            </Text>
          )}
          {mnaFormation.parcoursup_statut !== "hors périmètre" && (
            <>
              <Flex flexDirection="column">
                <FormControl display="flex" flexDirection="column" w="auto">
                  <FormLabel htmlFor="parcoursup_keep_publish" mb={3} fontSize="epsilon" fontWeight={400}>
                    <Heading as="h3" fontSize="1.3rem" mb={3} color="bluefrance" flexGrow="1">
                      {mnaFormation.parcoursup_statut === "publié"
                        ? "Conserver la publication"
                        : "Demander la publication"}{" "}
                      <Text as="span" color="redmarianne">
                        *
                      </Text>
                    </Heading>
                  </FormLabel>
                  <RadioGroup
                    defaultValue={values.parcoursup_keep_publish}
                    id="parcoursup_keep_publish"
                    name="parcoursup_keep_publish"
                    border="1px solid"
                    borderColor="bluefrance"
                    p={6}
                  >
                    <Stack spacing={2} direction="column">
                      <Radio
                        mb={0}
                        size="lg"
                        value="true"
                        onChange={(evt) => {
                          setShowRaison(false);
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
                          setShowRaison(true);
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
                {showRaison && (
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
                        name="parcoursup_raison_depublication"
                        value={values.parcoursup_raison_depublication}
                        onChange={handleChange}
                        placeholder="Précisez ici la raison pour laquelle vous ne souhaitez pas publier la formation sur Parcoursup"
                        rows={2}
                      />
                      <FormErrorMessage>{errors.parcoursup_raison_depublication}</FormErrorMessage>
                    </Flex>
                  </FormControl>
                )}
              </Flex>
              <Flex flexDirection={["column", "row"]} mt={5} justifyContent="flex-start">
                <Box flexGrow="1">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setFieldValue("parcoursup_keep_publish", undefined);
                      onClose();
                    }}
                    mr={[0, 4]}
                    px={8}
                    mb={[3, 0]}
                  >
                    Annuler
                  </Button>
                </Box>

                <Button
                  type="submit"
                  variant="primary"
                  onClick={handleSubmit}
                  isLoading={isSubmitting}
                  loadingText="Enregistrement..."
                  isDisabled={!canSubmit}
                >
                  Enregistrer
                </Button>
              </Flex>
            </>
          )}
        </Box>
      </Flex>
    </Flex>
  );
};

export { Validate };
