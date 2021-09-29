import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Collapse,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { ArrowDownLine, ArrowRightLine, Close } from "../../../theme/components/icons";
import { useFormik } from "formik";
import { StatusSelect } from "./StatusSelect";
import { RuleBuilder } from "./RuleBuilder";
import { ActionsSelect } from "./ActionsSelect";
import { CONDITIONS } from "../../../constants/conditionsIntegration";
import { COMMON_STATUS, PARCOURSUP_STATUS } from "../../../constants/status";
import { useQuery } from "react-query";
import { _get } from "../../../common/httpClient";
import * as Yup from "yup";
import { academies } from "../../../constants/academies";
import { isStatusChangeEnabled } from "../../../common/utils/rulesUtils";
import { RuleUpdatesHistory } from "./RuleUpdatesHistory";

const endpointNewFront = `${process.env.REACT_APP_BASE_URL}/api`;

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Veuillez saisir le nom du diplôme ou titre"),
  status: Yup.string().required("Veuillez choisir une règle de publication"),
  condition: Yup.string().required("Veuillez choisir une condition d'intégration"),
  niveau: Yup.string().required("Veuillez choisir un niveau"),
  diplome: Yup.string().required("Veuillez choisir un diplôme"),
  duration: Yup.number().nullable(),
});

const getCount = async ({ niveau, diplome, regle_complementaire, academie }) => {
  const countUrl = `${endpointNewFront}/v1/entity/perimetre/regle/count`;
  const params = new URLSearchParams({
    niveau,
    diplome,
    ...(regle_complementaire && { regle_complementaire }),
    ...(academie && { num_academie: academie }),
  });
  return await _get(`${countUrl}?${params}`, false);
};

export const getDiplomesAllowedForSubRulesUrl = (plateforme) => {
  const filters = {
    plateforme,
    nom_regle_complementaire: null,
  };

  if (plateforme === "parcoursup") {
    filters.statut = PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR;
  } else {
    filters.condition_integration = CONDITIONS.PEUT_INTEGRER;
  }

  const params = new URLSearchParams(filters);
  return `${endpointNewFront}/v1/entity/perimetre/regles?${params}`;
};

const RuleModal = ({ isOpen, onClose, rule, onUpdateRule, onDeleteRule, onCreateRule, plateforme, academie }) => {
  const {
    _id: idRule,
    diplome,
    regle_complementaire,
    regle_complementaire_query,
    nom_regle_complementaire,
    updates_history,
    statut,
    condition_integration = "",
    niveau,
    duree,
    statut_academies,
    num_academie,
  } = rule ?? {};

  const isCreating = !rule;
  const initialRef = React.useRef();
  const toast = useToast();

  const isDisabled = !!academie && !isCreating && (!num_academie || String(num_academie) !== academie);

  const isStatusChangeDisabled = !(
    isCreating || isStatusChangeEnabled({ plateforme, academie, num_academie, status: statut, condition_integration })
  );

  const isConditionChangeEnabled = !academie;
  const initialCondition = academie && isCreating ? CONDITIONS.PEUT_INTEGRER : condition_integration;
  const academieLabel = Object.values(academies).find(({ num_academie: num }) => num === num_academie)?.nom_academie;

  const niveauxURL = `${endpointNewFront}/v1/entity/perimetre/niveau`;
  const { data: niveauxData } = useQuery("niveaux", () => _get(niveauxURL, false), {
    refetchOnWindowFocus: false,
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  const reglesUrl = getDiplomesAllowedForSubRulesUrl(plateforme);
  const { data: diplomesRegles } = useQuery("diplomesRegles", () => _get(reglesUrl, false), {
    refetchOnWindowFocus: false,
  });

  const { values, handleChange, handleSubmit, isSubmitting, setFieldValue, resetForm, errors, touched } = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: nom_regle_complementaire,
      status: statut_academies?.[academie] ?? statut,
      regle: regle_complementaire,
      query: regle_complementaire_query,
      condition: initialCondition,
      niveau: niveau,
      diplome: diplome,
      duration: duree ?? "",
    },
    validationSchema: validationSchema,
    onSubmit: ({ name, status, regle, condition, niveau, diplome, duration, query }) => {
      return new Promise(async (resolve) => {
        if (idRule) {
          if (!academie) {
            await onUpdateRule({
              _id: idRule,
              niveau,
              diplome,
              nom_regle_complementaire: name,
              statut: status,
              regle_complementaire: regle,
              regle_complementaire_query: query,
              condition_integration: condition,
              duree: duration ? Number(duration) : null,
            });
          } else {
            // update the status only for the selected academy
            const statusAcademies = {
              ...statut_academies,
              [academie]: status,
            };

            // if the status equals the national one just remove the academy specificity
            if (statut === status) {
              delete statusAcademies[academie];
            }

            await onUpdateRule({
              _id: idRule,
              niveau,
              diplome,
              nom_regle_complementaire: name,
              statut: status,
              regle_complementaire: regle,
              regle_complementaire_query: query,
              duree: duration ? Number(duration) : null,
              statut_academies: statusAcademies,
            });
          }

          toast({
            title: "Mise à jour",
            description: `La règle "${name}" a été mise à jour`,
            status: "success",
            duration: 5000,
          });
        } else {
          if (!academie) {
            await onCreateRule({
              plateforme,
              niveau,
              diplome,
              nom_regle_complementaire: name,
              statut: status,
              regle_complementaire: regle,
              regle_complementaire_query: query,
              condition_integration: condition,
              duree: duration ? Number(duration) : null,
            });
          } else {
            // create rule for an academy, that will be visible at national level
            // set national status to the same as the enclosing diploma
            const nationalStatus = diplomesRegles.find(({ diplome: dip }) => dip === diplome).statut;

            await onCreateRule({
              plateforme,
              niveau,
              diplome,
              nom_regle_complementaire: name,
              statut: nationalStatus,
              regle_complementaire: regle,
              regle_complementaire_query: query,
              condition_integration: condition,
              duree: duration ? Number(duration) : null,
              num_academie: academie,
              statut_academies: {
                [academie]: status,
              },
            });
          }

          toast({
            title: "Création",
            description: `La règle "${name}" a été créée`,
            status: "success",
            duration: 5000,
          });
        }

        resetForm();
        onClose();
        resolve("onSubmitHandler rule update complete");
      });
    },
  });

  const close = () => {
    resetForm();
    onClose();
  };

  const [count, setCount] = useState(0);

  useEffect(() => {
    const run = async () => {
      const result = await getCount({
        niveau: values.niveau,
        diplome: values.diplome,
        regle_complementaire: values.regle,
        academie,
      });
      setCount(result);
    };

    if (values.niveau && values.diplome) {
      run();
    } else {
      setCount(0);
    }
  }, [values.niveau, values.diplome, values.regle, academie]);

  const { isOpen: isCriteriaOpen, onToggle: onCriteriaToggle } = useDisclosure();

  return (
    <Modal isOpen={isOpen} onClose={close} size="6xl" initialFocusRef={initialRef}>
      <ModalOverlay />
      <ModalContent bg="white" color="primaryText" borderRadius="none" ref={initialRef}>
        <Button
          display={"flex"}
          alignSelf={"flex-end"}
          color="bluefrance"
          fontSize={"epsilon"}
          onClick={close}
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
              <Flex flexDirection={"column"}>
                {isCreating ? (
                  <Text as={"span"} ml={4}>
                    Ajouter un diplôme, un titre ou des formations
                  </Text>
                ) : (
                  <>
                    <Text as={"span"} ml={4}>
                      {num_academie ? `${academieLabel} (${num_academie}) - ` : ""}
                      {values.name}
                    </Text>
                    <Text ml={4} mt={2} as={"span"} fontSize="1rem" fontWeight={400}>
                      Dernière modification le {formatDate(rule.last_update_at)} par {rule.last_update_who}
                    </Text>
                  </>
                )}
              </Flex>
            </Flex>
          </Heading>
        </ModalHeader>
        <ModalBody px={[4, 16]} pb={[4, 16]}>
          <Tabs variant="search">
            {!isCreating && (
              <TabList bg="white">
                <Tab>Conditions d'intégration</Tab>
                <Tab>Historique des modifications</Tab>
              </TabList>
            )}

            <TabPanels>
              <TabPanel>
                <Box border="1px solid" borderColor="bluefrance" p={8}>
                  <Flex flexDirection={"column"}>
                    {niveauxData && (
                      <FormControl isInvalid={errors.niveau && touched.niveau} isRequired>
                        <Flex flexDirection={"column"} alignItems={"flex-start"}>
                          <FormLabel htmlFor="niveau">Niveau</FormLabel>
                          <Select
                            isDisabled={isDisabled}
                            id={"niveau"}
                            name={"niveau"}
                            onChange={handleChange}
                            value={values.niveau}
                            w={"auto"}
                            placeholder={"Sélectionnez un niveau"}
                          >
                            {niveauxData.map(({ niveau: { value } }) => {
                              return (
                                <option key={value} value={value}>
                                  {value}
                                </option>
                              );
                            })}
                          </Select>
                          <FormErrorMessage>{errors.niveau}</FormErrorMessage>
                        </Flex>
                      </FormControl>
                    )}

                    {niveauxData && (
                      <FormControl isInvalid={errors.diplome && touched.diplome} isRequired>
                        <Flex flexDirection={"column"} alignItems={"flex-start"} mt={8}>
                          <FormLabel htmlFor={"diplome"}>Type de diplôme ou titre</FormLabel>
                          <Select
                            isDisabled={isDisabled}
                            id={"diplome"}
                            name={"diplome"}
                            onChange={handleChange}
                            value={values.diplome}
                            w={"auto"}
                            placeholder={"Sélectionnez un type de diplôme ou un titre"}
                          >
                            {niveauxData
                              .find(({ niveau: { value } }) => value === values.niveau)
                              ?.diplomes.filter(({ value }) => {
                                if (!academie) {
                                  return true;
                                }
                                return diplomesRegles.some(({ diplome }) => diplome === value);
                              })
                              .map(({ value }) => {
                                return (
                                  <option key={value} value={value}>
                                    {value}
                                  </option>
                                );
                              })}
                          </Select>
                          <FormErrorMessage>{errors.diplome}</FormErrorMessage>
                        </Flex>
                      </FormControl>
                    )}

                    <FormControl isInvalid={errors.name && touched.name} isRequired>
                      <Flex flexDirection={"column"} mt={8} alignItems={"flex-start"}>
                        <FormLabel htmlFor={"name"}>Nom du diplôme ou titre</FormLabel>
                        <Input
                          isDisabled={isDisabled}
                          id="name"
                          name="name"
                          value={values.name ?? ""}
                          onChange={handleChange}
                          w={"full"}
                        />
                        <FormErrorMessage>{errors.name}</FormErrorMessage>
                      </Flex>
                    </FormControl>

                    <FormControl isInvalid={errors.duration && touched.duration}>
                      <Flex flexDirection={"column"} mt={8} alignItems={"flex-start"}>
                        <FormLabel htmlFor={"duration"} mb={1}>
                          Durée (en années)
                        </FormLabel>
                        <Text color={"gray.600"} fontSize={"omega"} mb={4}>
                          Indiquer la durée de la formation permet d'éviter des inscriptions sur une session de
                          formation qui arrive à expiration
                        </Text>
                        <NumberInput
                          isDisabled={isDisabled}
                          id="duration"
                          name="duration"
                          size="md"
                          maxW={24}
                          value={values.duration}
                          min={1}
                          max={3}
                          onChange={(value) => {
                            // can't use handleChange since onChange receives directly value and not an Event
                            setFieldValue("duration", value);
                          }}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>

                        <FormErrorMessage>{errors.duration}</FormErrorMessage>
                      </Flex>
                    </FormControl>

                    <Flex flexDirection={"column"} mt={8} alignItems={"flex-start"}>
                      <Button mb={1} onClick={onCriteriaToggle} variant={"unstyled"}>
                        Affiner les critères{" "}
                        <ArrowDownLine boxSize={5} transform={isCriteriaOpen ? "rotate(180deg)" : "none"} />
                      </Button>
                      <Collapse in={isCriteriaOpen} animateOpacity>
                        <Box bg={"grey.100"} p={4} borderLeft={"4px solid"} borderColor={"bluefrance"} w={"full"}>
                          <RuleBuilder
                            isDisabled={isDisabled}
                            regle_complementaire_query={values.query}
                            regle_complementaire={values.regle}
                            onQueryChange={(regle, query) => {
                              setFieldValue("regle", regle);
                              setFieldValue("query", query);
                            }}
                          />
                        </Box>
                      </Collapse>
                    </Flex>
                    <Flex justifyContent={"flex-start"} mt={4}>
                      <Text fontWeight={700} color={"info"}>
                        {count} formations correspondent à l’ensemble des critères sélectionnés
                      </Text>
                    </Flex>

                    <FormControl isInvalid={errors.condition && touched.condition} isRequired>
                      <Flex flexDirection={"column"} mt={16} alignItems={"flex-start"}>
                        <FormLabel htmlFor={"condition"}>Condition d'intégration</FormLabel>
                        <ActionsSelect
                          isDisabled={!isConditionChangeEnabled}
                          id={"condition"}
                          name="condition"
                          value={values.condition}
                          onChange={(e) => {
                            if (e.target.value === CONDITIONS.NE_DOIT_PAS_INTEGRER) {
                              setFieldValue("status", COMMON_STATUS.HORS_PERIMETRE);
                            } else {
                              setFieldValue("status", "");
                            }
                            handleChange(e);
                          }}
                          size={"md"}
                          w={"auto"}
                          placeholder={"Sélectionnez une condition d'intégration"}
                        />
                        <FormErrorMessage>{errors.condition}</FormErrorMessage>
                      </Flex>
                    </FormControl>

                    <FormControl isInvalid={errors.status && touched.status} isRequired>
                      <Flex flexDirection={"column"} mt={8} alignItems={"flex-start"}>
                        <FormLabel htmlFor={"status"}>Règle de publication</FormLabel>
                        <StatusSelect
                          isDisabled={isStatusChangeDisabled}
                          id={"status"}
                          name="status"
                          plateforme={plateforme}
                          currentStatus={values.status}
                          condition={values.condition}
                          onChange={handleChange}
                          size={"md"}
                          w={"auto"}
                          placeholder={"Sélectionnez une règle de publication"}
                        />
                        <FormErrorMessage>{errors.status}</FormErrorMessage>
                      </Flex>
                    </FormControl>
                  </Flex>
                </Box>

                <Flex justifyContent={isCreating ? "flex-end" : "space-between"} mt={8}>
                  {!isCreating && (
                    <Button
                      isDisabled={isDisabled}
                      variant="outline"
                      colorScheme="red"
                      borderRadius="none"
                      onClick={async () => {
                        const isUserSure = window.confirm("Voulez vous vraiment supprimer ce diplôme ?");
                        if (isUserSure) {
                          await onDeleteRule({
                            _id: idRule,
                          });

                          toast({
                            title: "Suppression",
                            description: `La règle "${nom_regle_complementaire}" a été supprimée`,
                            status: "success",
                            duration: 5000,
                          });
                          close();
                        }
                      }}
                    >
                      Supprimer
                    </Button>
                  )}
                  <Flex>
                    <Button variant={"secondary"} mr={2} onClick={close}>
                      Annuler
                    </Button>
                    <Button
                      isDisabled={isStatusChangeDisabled}
                      variant={"primary"}
                      type={"submit"}
                      onClick={handleSubmit}
                      isLoading={isSubmitting}
                      loadingText="Enregistrement des modifications"
                    >
                      Enregistrer
                    </Button>
                  </Flex>
                </Flex>
              </TabPanel>
              <TabPanel>
                {!updates_history?.length && (
                  <Text>Aucune modification depuis la création de cet ensemble de conditions.</Text>
                )}
                {updates_history?.map(({ from, to, updated_at }) => {
                  return (
                    <Box key={updated_at} py={4} borderBottom={"1px solid"} borderColor={"grey.300"}>
                      <Text fontWeight={700} mb={2}>
                        Le {formatDate(updated_at)} à {new Date(updated_at).toLocaleTimeString("fr-FR")} par{" "}
                        {to.last_update_who ?? rule.last_update_who}
                      </Text>
                      <Flex>
                        <Flex flexBasis={"50%"} pr={2}>
                          <RuleUpdatesHistory label={"Avant"} value={from} />
                        </Flex>
                        <Flex flexBasis={"50%"} pl={2} flexDirection={"column"}>
                          <RuleUpdatesHistory label={"Après"} value={to} />
                        </Flex>
                      </Flex>
                    </Box>
                  );
                })}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export { RuleModal };
