import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  useDisclosure,
  Stack,
  HStack,
  FormLabel,
  FormControl,
  Radio,
  RadioGroup,
  Textarea,
  FormErrorMessage,
  Switch,
} from "@chakra-ui/react";
import { buildUpdatesHistory } from "../../../../common/utils/formationUtils";
import { StatusBadge } from "../../../../common/components/StatusBadge";
import React, { useState, useEffect, useCallback } from "react";
import { useFormik } from "formik";
import { RejectedModal } from "./RejectedModal";
import { Section } from "./Section";
import { ButtonIndicator } from "./ButtonIndicator";
import useAuth from "../../../../common/hooks/useAuth";
import * as Yup from "yup";
import { _post, _put } from "../../../../common/httpClient";
import { PARCOURSUP_STATUS } from "../../../../constants/status";

import { Close, CheckLine, ValidateIcon, ErrorIcon } from "../../../../theme/components/icons";

const ReconciliationModalHeader = React.memo(
  ({ formation, onClose, step, onStepChanged, onValidationSubmit, onStepClicked, onMnaFormationSelected }) => {
    const { isOpen: isOpenSubModal, onOpen: onOpenSubModal, onClose: onCloseSubM } = useDisclosure();
    const [mnaFormation, setMnaFormation] = useState(formation.matching_mna_formation[0]);
    const [canSubmit, setCanSubmit] = useState(false);
    const [showRaison, setShowRaison] = useState(false);
    const [currentMnaFormation, setCurrentMnaFormation] = useState(0);
    const [selectedFormation, setSelectedFormation] = useState([]);
    const slidesCount = formation.matching_mna_formation.length;
    const [user] = useAuth();

    const onSubmitReject = () => {
      onCloseSubM();
      onClose();
      window.location.reload();
    };

    useEffect(() => {
      setMnaFormation(formation.matching_mna_formation[0]);
    }, [formation]);

    const { values, handleChange, handleSubmit: handleSave, errors, isSubmitting } = useFormik({
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

    const cancelReject = async () => {
      await _post("/api/parcoursup/reconciliation", {
        id_formation: formation._id,
        reject: true,
        matching_rejete_raison: `##USER_CANCEL##`,
      });
      window.location.reload();
    };

    let onSelectChecked = useCallback(
      (e) => {
        let selected = [];
        if (e.target.checked) {
          selected = [...selectedFormation, currentMnaFormation];
        } else {
          selected = selectedFormation.filter((s) => s !== currentMnaFormation);
        }

        // TODO do multiple reconciliation

        setSelectedFormation(selected);
      },
      [currentMnaFormation, selectedFormation]
    );

    const height =
      formation.statut_reconciliation === "REJETE"
        ? "450px"
        : step === 1
        ? slidesCount > 1
          ? "370px"
          : "255px"
        : mnaFormation.parcoursup_statut !== PARCOURSUP_STATUS.HORS_PERIMETRE
        ? showRaison
          ? slidesCount > 1
            ? "745px"
            : "635px"
          : slidesCount > 1
          ? "620px"
          : "505px"
        : slidesCount > 1
        ? "560px"
        : "450px";

    return (
      <>
        <Box border="1px solid red" h={height} />
        <Box position="fixed" top="0" left="0" right="0" bg="white" pl="5rem" pr="6rem" overflow="hidden" h={height}>
          <HStack pt={5} borderBottom="1px solid #E7E7E7" px={[4, 16]} mb={3}>
            <>
              <Text
                variant="secondary"
                onClick={() => {
                  onStepClicked(1);
                }}
                py={2}
                px={2}
                fontWeight="bold"
                textStyle="h4"
                h="auto"
                color={step === 1 ? "bluefrance" : "gray.600"}
                cursor="pointer"
              >
                {slidesCount === 1 && `1. Valider le rapprochement`}
                {slidesCount > 1 && `1. Valider le(s) rapprochement(s)`}
                {step === 2 && <CheckLine color="greensoft.500" ml={2} mb={1} />}
              </Text>
              <Text
                disabled={step !== 2}
                py={2}
                fontWeight="bold"
                textStyle="h4"
                h="auto"
                color={step === 2 ? "bluefrance" : "gray.600"}
              >
                2. Gérer la publication
              </Text>
              <Box flexGrow="1" textAlign="end">
                <Button color="bluefrance" fontSize={"epsilon"} onClick={onClose} variant="unstyled" fontWeight={400}>
                  fermer{" "}
                  <Text as={"span"} ml={2}>
                    <Close boxSize={4} />
                  </Text>
                </Button>
              </Box>
            </>
          </HStack>

          {step === 1 && (
            <>
              <HStack px={[4, 16]} mb={5}>
                {formation.statut_reconciliation === "REJETE" && (
                  <Text textStyle="lg" fontWeight="bold" mb={3} color="error" flexGrow="1" mt={3}>
                    Raison du signalement: {formation.matching_rejete_raison.split("#-REJECT_COMPLEMENT-#").join(": ")}
                  </Text>
                )}
                {formation.statut_reconciliation !== "REJETE" && (
                  <Text textStyle="sm" fontStyle="italic" mb={3} color="info" flexGrow="1">
                    Vérifier la similitude des informations
                  </Text>
                )}

                {formation.statut_reconciliation === "REJETE" && (
                  <Button type="submit" variant="primary" bg="error" onClick={cancelReject}>
                    Annuler ce signalement d'anomalie
                  </Button>
                )}
                {formation.statut_reconciliation !== "REJETE" && (
                  <HStack>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        onOpenSubModal();
                      }}
                      cursor="pointer"
                    >
                      Signaler une anomalie
                    </Button>
                    <Box flexGrow="1" textAlign="end">
                      <Button
                        type="submit"
                        variant="primary"
                        onClick={() => {
                          onStepChanged(2);
                        }}
                        isDisabled={slidesCount > 1 && selectedFormation.length === 0}
                      >
                        {slidesCount === 1 && `Valider le rapprochement et passer à l’étape suivante`}
                        {slidesCount > 1 && `Valider le(s) rapprochement(s) et passer à l’étape suivante`}
                      </Button>
                    </Box>
                  </HStack>
                )}
              </HStack>

              {slidesCount > 1 && (
                <Box px={[4, 16]} mb={5}>
                  <HStack spacing="8" minH="60px" alignItems="stretch" textStyle="rf-text" fontWeight="700">
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
                      h="full"
                      w="55%"
                    >
                      <ErrorIcon color="redmarianne" mr="2" mt="0.35rem" />
                      <Text fontWeight="normal">
                        {slidesCount} formations référencées dans le Catalogue 2021 (base Carif-Oref) peuvent être
                        rapprochées ensembles à la formation Parcoursup
                      </Text>
                    </Text>

                    <HStack>
                      {Array(slidesCount)
                        .fill("")
                        .map((unuse, ide) => (
                          <ButtonIndicator
                            text={ide + 1}
                            // withIcon
                            active={ide === currentMnaFormation}
                            onClicked={() => {
                              setCurrentMnaFormation(ide);
                              onMnaFormationSelected(ide);
                              setMnaFormation(formation.matching_mna_formation[ide]);
                            }}
                            key={ide}
                          />
                        ))}
                      <Text textStyle="sm" ml="0.9rem" color="info" flexGrow="1">
                        {selectedFormation.length} formations sélectionnées
                      </Text>
                    </HStack>
                  </HStack>
                </Box>
              )}

              <Section
                minH="30px"
                withBorder
                left={
                  <Text textStyle="h6" fontWeight="700" mb={4}>
                    Champs
                  </Text>
                }
                middle={
                  <Text textStyle="h6" mb={4}>
                    Formation Parcoursup
                  </Text>
                }
                right={
                  <HStack mb={4}>
                    <Box flexGrow="1">
                      <Text textStyle="h6">Formations Catalogue 2021</Text>
                    </Box>
                    <HStack>
                      <Switch
                        variant="icon"
                        onChange={onSelectChecked}
                        isChecked={selectedFormation.includes(currentMnaFormation)}
                        id={`select-rapprochement`}
                      />
                      <Text>à rapprocher</Text>
                    </HStack>
                  </HStack>
                }
              />
              <Section
                minH="30px"
                withBorder
                left={
                  <Box mb={4} mt={4}>
                    Status :
                  </Box>
                }
                middle={
                  <Box mb={4} mt={4}>
                    Paramétrée
                  </Box>
                }
                right={
                  <Box mb={4} mt={4}>
                    {mnaFormation.parcoursup_statut === PARCOURSUP_STATUS.HORS_PERIMETRE && (
                      <StatusBadge
                        source="Parcoursup"
                        status="nonConforme"
                        text="non-conforme au guide règlementaire"
                      />
                    )}
                    {mnaFormation.parcoursup_statut !== PARCOURSUP_STATUS.HORS_PERIMETRE && (
                      <StatusBadge source="Parcoursup" status="conforme" text="conforme au guide règlementaire" />
                    )}
                  </Box>
                }
              />
              <RejectedModal
                isOpen={isOpenSubModal}
                onClose={onCloseSubM}
                formation={formation}
                onSubmitReject={onSubmitReject}
              />
            </>
          )}
          {formation.statut_reconciliation !== "REJETE" && step === 2 && (
            <Box mt={5}>
              {slidesCount > 1 && (
                <Box px={[4, 16]} mb={5}>
                  <HStack spacing="8" minH="60px" alignItems="stretch" textStyle="rf-text" fontWeight="700">
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
                      h="full"
                      w="55%"
                    >
                      <ErrorIcon color="redmarianne" mr="2" mt="0.35rem" />
                      <Text fontWeight="normal">
                        {slidesCount} formations référencées dans le Catalogue 2021 (base Carif-Oref) peuvent être
                        rapprochées ensembles à la formation Parcoursup
                      </Text>
                    </Text>

                    <HStack>
                      {Array(slidesCount)
                        .fill("")
                        .map((unuse, ide) => {
                          if (selectedFormation.includes(ide)) {
                            return (
                              <ButtonIndicator
                                text={ide + 1}
                                withIcon
                                active={ide === currentMnaFormation}
                                onClicked={() => {
                                  setCurrentMnaFormation(ide);
                                  onMnaFormationSelected(ide);
                                  setMnaFormation(formation.matching_mna_formation[ide]);
                                }}
                                key={ide}
                              />
                            );
                          }
                          return <ButtonIndicator text={ide + 1} key={ide} />;
                        })}
                      <Text textStyle="sm" ml="0.9rem" color="info" flexGrow="1">
                        {selectedFormation.length} formations sélectionnées à l'étape 1.
                      </Text>
                    </HStack>
                  </HStack>
                </Box>
              )}
              <Section
                minH="30px"
                withBorder
                left={
                  <Text textStyle="h6" fontWeight="700" mb={4}>
                    Champs
                  </Text>
                }
                middle={
                  <Text textStyle="h6" mb={4}>
                    Formation Parcoursup
                  </Text>
                }
                right={
                  <Text textStyle="h6" mb={4}>
                    Formations Catalogue 2021
                  </Text>
                }
              />
              <Section
                minH="30px"
                left={
                  <Box mb={4} mt={4}>
                    Status
                  </Box>
                }
                middle={
                  <Flex mb={4} mt={4} flexDirection="column" h="full">
                    <Box mb={4} mt={4} h="30px">
                      Paramétrée
                    </Box>
                    <Box flexGrow="1">
                      {(mnaFormation.parcoursup_statut === "publié" ||
                        mnaFormation.parcoursup_statut === "à publier") && (
                        <Text
                          as="div"
                          variant="highlight"
                          borderLeft="3px solid"
                          borderColor="bluefrance"
                          display="flex"
                          flexDirection="row"
                          justifyContent="center"
                          alignItems="flex-start"
                          p={3}
                          mb={5}
                          h="full"
                        >
                          <ValidateIcon width="30px" height="30px" color="greensoft.500" mr="2" mt="0.35rem" />
                          <Text fontWeight="normal">
                            La formation paramétrée dans Parcoursup est conforme aux conditions d’intégrations définies
                            par le guide reglementaire
                          </Text>
                        </Text>
                      )}
                      {mnaFormation.parcoursup_statut === PARCOURSUP_STATUS.HORS_PERIMETRE && (
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
                          h="full"
                        >
                          <ErrorIcon color="redmarianne" mr="2" mt="0.35rem" />
                          <Text fontWeight="normal">
                            la formation paramétrée dans Parcoursup n’est pas conforme aux conditions d’intégrations
                            définies par le guide reglementaire
                          </Text>
                        </Text>
                      )}
                    </Box>
                    <Box mb={4} mt={4} h="30px" />
                  </Flex>
                }
                right={
                  <Flex mb={4} mt={4} flexDirection="column" h="full">
                    <Box mb={4} mt={4} h="30px">
                      {mnaFormation.parcoursup_statut === PARCOURSUP_STATUS.HORS_PERIMETRE && (
                        <StatusBadge
                          source="Parcoursup"
                          status="nonConforme"
                          text="non-conforme au guide règlementaire"
                        />
                      )}
                      {mnaFormation.parcoursup_statut !== PARCOURSUP_STATUS.HORS_PERIMETRE && (
                        <StatusBadge source="Parcoursup" status="conforme" text="conforme au guide règlementaire" />
                      )}
                    </Box>

                    {mnaFormation.parcoursup_statut === PARCOURSUP_STATUS.HORS_PERIMETRE && (
                      <Box flexGrow="1">
                        <Flex flexDirection="column" border="1px solid" borderColor="bluefrance" p={6} h="full">
                          <Heading as="h3" fontSize="1.3rem" mb={3}>
                            Statut automatiquement appliqué
                          </Heading>
                          <Text as={"span"} fontSize="zeta">
                            <StatusBadge source="Parcoursup" status="non publié" />
                          </Text>
                        </Flex>
                      </Box>
                    )}
                    {mnaFormation.parcoursup_statut !== PARCOURSUP_STATUS.HORS_PERIMETRE && (
                      <Box flexGrow="1">
                        <Flex flexDirection="column" border="1px solid" borderColor="bluefrance" p={6} h="full">
                          <FormControl display="flex" flexDirection="column" w="auto">
                            <RadioGroup
                              defaultValue={values.parcoursup_keep_publish}
                              id="parcoursup_keep_publish"
                              name="parcoursup_keep_publish"
                            >
                              <Stack spacing={2} direction="column" h="150px">
                                <FormLabel htmlFor="parcoursup_keep_publish" mb={3} fontSize="epsilon" fontWeight={400}>
                                  <Heading as="h3" fontSize="1.3rem" flexGrow="1">
                                    {mnaFormation.parcoursup_statut === "publié"
                                      ? "Appliquer le statut de publication"
                                      : "Demander la publication"}{" "}
                                    <Text as="span" color="redmarianne">
                                      *
                                    </Text>
                                  </Heading>
                                </FormLabel>
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
                                    <StatusBadge source="Parcoursup" status="publié" />
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
                                    <StatusBadge source="Parcoursup" status="non publié" />
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
                              mt={2}
                            >
                              <FormLabel
                                htmlFor="parcoursup_raison_depublication"
                                mb={3}
                                fontSize="epsilon"
                                fontWeight={400}
                              >
                                Raison de non publication:
                              </FormLabel>
                              <Flex flexDirection="column" w="100%">
                                <Textarea
                                  name="parcoursup_raison_depublication"
                                  value={values.parcoursup_raison_depublication}
                                  onChange={handleChange}
                                  placeholder="Précisez ici la raison pour laquelle vous ne souhaitez pas publier la formation sur Parcoursup"
                                  rows={3}
                                />
                                <FormErrorMessage>{errors.parcoursup_raison_depublication}</FormErrorMessage>
                              </Flex>
                            </FormControl>
                          )}
                        </Flex>
                      </Box>
                    )}
                    <Flex mb={4} mt={4} h="30px" justifyContent="flex-end">
                      {mnaFormation.parcoursup_statut === PARCOURSUP_STATUS.HORS_PERIMETRE && (
                        <Button
                          type="submit"
                          variant="primary"
                          onClick={handleSave}
                          isLoading={isSubmitting}
                          loadingText="Enregistrement..."
                        >
                          J’ai compris
                        </Button>
                      )}
                      {mnaFormation.parcoursup_statut !== PARCOURSUP_STATUS.HORS_PERIMETRE && (
                        <Button
                          type="submit"
                          variant="primary"
                          onClick={handleSave}
                          isLoading={isSubmitting}
                          loadingText="Enregistrement..."
                          isDisabled={!canSubmit}
                        >
                          Enregistrer
                        </Button>
                      )}
                    </Flex>
                  </Flex>
                }
              />
            </Box>
          )}
        </Box>
      </>
    );
  }
);

export { ReconciliationModalHeader };