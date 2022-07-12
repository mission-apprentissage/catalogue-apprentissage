import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  HStack,
  ListItem,
  Radio,
  RadioGroup,
  Stack,
  Switch,
  Text,
  Textarea,
  UnorderedList,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { buildUpdatesHistory } from "../../../../common/utils/historyUtils";
import { StatusBadge } from "../../../../common/components/StatusBadge";
import React, { useCallback, useEffect, useState } from "react";
import { useFormik } from "formik";
import { RejectedModal } from "./RejectedModal";
import { Section } from "./Section";
import { ButtonIndicator } from "./ButtonIndicator";
import useAuth from "../../../../common/hooks/useAuth";
import * as Yup from "yup";
import { _post, _put } from "../../../../common/httpClient";
import { PARCOURSUP_STATUS } from "../../../../constants/status";

import { CheckLine, Close, Error, Validate } from "../../../../theme/components/icons";

const ReconciliationModalHeader = React.memo(
  ({
    formation,
    onClose,
    step,
    onStepChanged,
    onValidationSubmit,
    onStepClicked,
    onMnaFormationSelected,
    defaultIndex = 0,
  }) => {
    const { isOpen: isOpenSubModal, onOpen: onOpenSubModal, onClose: onCloseSubM } = useDisclosure();
    const [mnaFormation, setMnaFormation] = useState(formation.matching_mna_formation[defaultIndex]);
    const [canSubmit, setCanSubmit] = useState(true);
    const [showRaison, setShowRaison] = useState(false);
    const [currentMnaFormation, setCurrentMnaFormation] = useState(defaultIndex);
    const [selectedFormation, setSelectedFormation] = useState([]);
    const slidesCount = formation.matching_mna_formation.length;
    const [user] = useAuth();
    const toast = useToast();

    const onSubmitReject = () => {
      onCloseSubM();
      onClose();
      window.location.reload();
    };

    useEffect(() => {
      setMnaFormation(formation.matching_mna_formation[defaultIndex]);
      setCurrentMnaFormation(defaultIndex);
    }, [formation, defaultIndex]);

    const {
      values,
      handleChange,
      handleSubmit: handleSave,
      errors,
      isSubmitting,
    } = useFormik({
      initialValues: {
        parcoursup_keep_publish: "true",
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
          try {
            const body = {
              parcoursup_id: formation.id_parcoursup,
            };
            if (parcoursup_keep_publish === "true") {
              body.parcoursup_statut = PARCOURSUP_STATUS.PUBLIE;
              body.last_statut_update_date = new Date();
              body.parcoursup_raison_depublication = null;
              body.parcoursup_published_date = Date.now();
            } else if (parcoursup_keep_publish === "false") {
              body.parcoursup_raison_depublication = parcoursup_raison_depublication;
              body.parcoursup_statut = PARCOURSUP_STATUS.NON_PUBLIE;
              body.last_statut_update_date = new Date();
              body.parcoursup_published_date = null;
            }

            const formationsARapprocher = [];
            if (selectedFormation.length > 0) {
              for (let index = 0; index < selectedFormation.length; index++) {
                formationsARapprocher.push(formation.matching_mna_formation[selectedFormation[index]]);
              }
            } else {
              formationsARapprocher.push(formation.matching_mna_formation[currentMnaFormation]);
            }

            for (let index = 0; index < formationsARapprocher.length; index++) {
              const formationARapprocher = formationsARapprocher[index];
              if (Object.keys(body).length > 0) {
                await _put(`/api/entity/formations/${formationARapprocher._id}`, {
                  num_academie: formationARapprocher.num_academie,
                  ...body,
                  last_update_who: user.email,
                  last_update_at: Date.now(),
                  updates_history: buildUpdatesHistory(
                    formationARapprocher,
                    { ...body, last_update_who: user.email },
                    Object.keys(body)
                  ),
                });
              }
              await _post("/api/parcoursup/reconciliation", {
                id_formation: formation._id,
                id_parcoursup: formation.id_parcoursup,
                uai_affilie: formation.uai_affilie,
                uai_gestionnaire: formation.uai_gestionnaire,
                uai_composante: formation.uai_composante,
                code_cfd: formationARapprocher.cfd,
                mnaFormationId: formationARapprocher._id,
                reject: false,
              });
            }
          } catch (e) {
            console.error(e);
            const response = await (e?.json ?? {});
            const message = response?.message ?? e?.message;

            toast({
              title: "Error",
              description: message,
              status: "error",
              duration: 10000,
            });
          }

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

    const cancelRapprochement = async () => {
      await _post("/api/parcoursup/reconciliation", {
        id_formation: formation._id,
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

        setSelectedFormation(selected);
      },
      [currentMnaFormation, selectedFormation]
    );

    let onGoToStepPublish = useCallback(() => {
      const index = selectedFormation[0] ?? 0;
      setMnaFormation(formation.matching_mna_formation[index]);
      setCurrentMnaFormation(index);
      onMnaFormationSelected(index);
      onStepChanged(2);
    }, [formation.matching_mna_formation, onMnaFormationSelected, onStepChanged, selectedFormation]);

    const height =
      formation.statut_reconciliation === "VALIDE"
        ? "250px"
        : formation.statut_reconciliation === "REJETE"
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
        : "470px";

    const showRejectRaisons = (formation) => {
      return formation.rapprochement_rejete_raisons.map((r) =>
        r === "Autre" ? `${r}: ${formation.rapprochement_rejete_raison_autre}` : r
      );
    };

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
                {step === 2 && <CheckLine color="greensoft.500" ml={2} mb={1} />}
                {slidesCount === 1 && `1. Valider le rapprochement`}
                {slidesCount > 1 && `1. Valider le(s) rapprochement(s)`}
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
                  <Box flexGrow="1">
                    <Text textStyle="lg" fontWeight="bold" mb={3} color="error" flexGrow="1" mt={3}>
                      Raison du signalement:
                    </Text>
                    <UnorderedList>
                      {showRejectRaisons(formation).map((raison, i) => {
                        return (
                          <ListItem color="error" key={i}>
                            {raison}
                          </ListItem>
                        );
                      })}
                    </UnorderedList>
                  </Box>
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
                        onClick={onGoToStepPublish}
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
                      <Error color="redmarianne" mr="2" mt="0.35rem" />
                      <Text fontWeight="normal">
                        {slidesCount} formations référencées dans le Catalogue (base Carif-Oref) peuvent être
                        rapprochées ensembles à la formation Parcoursup
                      </Text>
                    </Text>

                    <HStack>
                      {Array(slidesCount)
                        .fill("")
                        .map((unuse, ide) => (
                          <ButtonIndicator
                            text={ide + 1}
                            withIcon={selectedFormation.includes(ide)}
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
                      <Text textStyle="h6">Formations Catalogue</Text>
                    </Box>
                    {slidesCount > 1 && (
                      <HStack>
                        <Switch
                          variant="icon"
                          onChange={onSelectChecked}
                          isChecked={selectedFormation.includes(currentMnaFormation)}
                          id={`select-rapprochement`}
                        />
                        <Text>à rapprocher</Text>
                      </HStack>
                    )}
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
                      <Error color="redmarianne" mr="2" mt="0.35rem" />
                      <Text fontWeight="normal">
                        {slidesCount} formations référencées dans le Catalogue (base Carif-Oref) peuvent être
                        rapprochées ensembles à la formation Parcoursup
                      </Text>
                    </Text>

                    <HStack>
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
                    Formation Parcoursup 2021
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
                      {(mnaFormation.parcoursup_statut === PARCOURSUP_STATUS.PUBLIE ||
                        mnaFormation.parcoursup_statut === PARCOURSUP_STATUS.A_PUBLIER) && (
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
                          <Validate width="30px" height="30px" color="greensoft.500" mr="2" mt="0.35rem" />
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
                          <Error color="redmarianne" mr="2" mt="0.35rem" />
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
                            <StatusBadge source="Parcoursup" status={PARCOURSUP_STATUS.HORS_PERIMETRE} />
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
                                    {mnaFormation.parcoursup_statut === PARCOURSUP_STATUS.PUBLIE
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
                                  isChecked
                                >
                                  <Text as={"span"} fontSize="zeta">
                                    <StatusBadge source="Parcoursup" status={PARCOURSUP_STATUS.PUBLIE} />
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
                                    <StatusBadge source="Parcoursup" status={PARCOURSUP_STATUS.NON_PUBLIE} />
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

          {step === 3 && (
            <>
              <Box px={[4, 16]} mb={5}>
                <HStack spacing="8" minH="60px" alignItems="stretch" textStyle="rf-text" fontWeight="700">
                  <HStack w="full">
                    {slidesCount > 1 && (
                      <>
                        {Array(slidesCount)
                          .fill("")
                          .map((unuse, ide) => {
                            return formation.validated_formation_ids?.includes(
                              formation.matching_mna_formation[ide]._id
                            ) ? (
                              <ButtonIndicator
                                text={ide + 1}
                                active={ide === currentMnaFormation}
                                onClicked={() => {
                                  setCurrentMnaFormation(ide);
                                  onMnaFormationSelected(ide);
                                  setMnaFormation(formation.matching_mna_formation[ide]);
                                }}
                                key={ide}
                              />
                            ) : null;
                          })}
                      </>
                    )}
                    <Text textStyle="sm" ml="0.9rem" color="info" flexGrow="1">
                      {formation.validated_formation_ids?.length || 0} formations rapprochées
                    </Text>
                    <Box flexGrow="1" textAlign="right">
                      {formation.statut_reconciliation === "VALIDE" && (
                        <Button type="submit" variant="primary" onClick={cancelRapprochement}>
                          Annuler le rapprochement
                        </Button>
                      )}
                    </Box>
                  </HStack>
                </HStack>
              </Box>

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
                      <Text textStyle="h6">Formations Catalogue</Text>
                    </Box>
                  </HStack>
                }
              />
            </>
          )}
        </Box>
      </>
    );
  }
);

export { ReconciliationModalHeader };
