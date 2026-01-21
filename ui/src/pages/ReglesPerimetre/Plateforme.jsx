import { useCallback, useEffect, useState } from "react";
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Center,
  Container,
  Flex,
  FormLabel,
  Spinner,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { Breadcrumb } from "../../common/components/Breadcrumb";
import Layout from "../layout/Layout";
import { setTitle } from "../../common/utils/pageUtils";
import { RuleModal } from "./components/RuleModal";
import { Diplome } from "./components/Diplome";
import { Headline } from "./components/Headline";
import useAuth from "../../common/hooks/useAuth";
import { hasAccessTo, hasAccessToAtLeastOneOf, hasAllAcademiesRight, isUserAdmin } from "../../common/utils/rolesUtils";
import { ExportButton } from "./components/ExportButton";
import {
  createRule,
  deleteRule,
  deleteStatutAcademieRule,
  // getIntegrationCount,
  getRules,
  updateRule,
  updateStatutAcademieRule,
  useNiveaux,
} from "../../common/api/perimetre";
import { AcademiesSelect } from "./components/AcademiesSelect";
import { DiplomesAutosuggest } from "./components/DiplomesAutosuggest";
import { PLATEFORME } from "../../constants/plateforme";
import { ACADEMIES } from "../../constants/academies";
import { AFFELNET_STATUS } from "../../constants/status";
import { Alert } from "../../common/components/Alert";

export default ({ plateforme }) => {
  const [user] = useAuth();
  const [niveaux, setNiveaux] = useState([]);
  const [rules, setRules] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentRule, setCurrentRule] = useState(null);
  const [currentAcademie, setCurrentAcademie] = useState(null);
  // const [niveauxCount, setNiveauxCount] = useState({});
  const [selectedDiplome, setSelectedDiplome] = useState(null);
  const toast = useToast();
  const [currentIndex, setCurrentIndex] = useState(-1);

  let title;
  let editAcl;
  let createAcl;

  switch (plateforme) {
    case PLATEFORME.AFFELNET:
      title = currentAcademie
        ? `Règles d’intégration des formations en apprentissage dans Affelnet-lycée – Académie de ${ACADEMIES[String(currentAcademie)?.padStart(2, "0")]?.nom_academie}`
        : `Règles d’intégration des formations en apprentissage dans Affelnet-lycée`;
      editAcl = "page_perimetre/affelnet-edit-rule";
      createAcl = "page_perimetre/affelnet-add-rule";

      break;
    case PLATEFORME.PARCOURSUP:
      title = currentAcademie
        ? `Règles d’intégration des formations à la plateforme Parcoursup – Académie de ${ACADEMIES[String(currentAcademie)?.padStart(2, "0")]?.nom_academie}`
        : `Règles d'intégration des formations à la plateforme Parcoursup`;
      editAcl = "page_perimetre/parcoursup-edit-rule";
      createAcl = "page_perimetre/parcoursup-add-rule";
      break;
    default:
      title = "Règles d’intégration des formations";
      break;
  }

  const acls = [editAcl, createAcl];

  setTitle(title);

  const subtitle = currentAcademie ? (
    <>
      Certains types de formations sont définis au national comme <u>pouvant</u> être publiés sur Affelnet-lycée, selon
      les pratiques de l’académie. Ces formations sont listées sur cette page, pour vous permettre de confirmer ou non
      l’inclusion dans le périmètre pour votre académie. En l’absence de confirmation, aucune de ces offres ne sont
      publiables, et elles sont maintenues dans le statut “À définir”.
    </>
  ) : (
    `Déterminer les conditions d'intégrations des formations en apprentissage du Catalogue (Carif-Oref) sur la plateforme ${plateforme}`
  );

  const { data: niveauxData } = useNiveaux({ plateforme });

  useEffect(() => {
    const abortController = new AbortController();
    async function run() {
      try {
        const regles = await getRules({ plateforme }, { signal: abortController.signal });
        let reglesInTree = [];

        const niveauxTree = niveauxData.map(({ niveau, diplomes }) => {
          return {
            niveau,
            diplomes: diplomes.map((diplome) => {
              const filteredRegles = regles.filter(
                ({ niveau: niv, diplome: dip }) => niveau.value === niv && diplome.value === dip
              );
              reglesInTree = [...reglesInTree, ...filteredRegles.map(({ _id }) => _id)];
              return {
                ...diplome,
                regles: filteredRegles,
              };
            }),
          };
        });

        const obsoleteRegles = regles.filter(({ _id }) => !reglesInTree.includes(_id));
        if (obsoleteRegles.length > 0) {
          console.error("Des règles obsolètes ont été trouvées :", obsoleteRegles);
          // This rules should probably be deleted
        }
        setNiveaux(niveauxTree);
        setRules(regles.filter(({ _id }) => reglesInTree.includes(_id)));
      } catch (e) {
        console.error(e);
      }
    }

    if (niveauxData) {
      run();
    }

    return () => {
      abortController.abort();
      setNiveaux([]);
      setRules([]);
    };
  }, [plateforme, niveauxData]);

  const onShowRule = useCallback((rule) => {
    setCurrentRule(rule);
  }, []);

  useEffect(() => {
    if (currentRule) {
      onOpen();
    }
  }, [currentRule, onOpen]);

  const onCreateRule = useCallback(async (ruleData) => {
    const newRule = await createRule(ruleData);
    const { niveau: ruleNiveau, diplome: ruleDiplome } = newRule;
    setNiveaux((currentTree) => {
      return currentTree.map(({ niveau, diplomes }) => {
        if (niveau.value !== ruleNiveau) {
          return { niveau, diplomes };
        }

        return {
          niveau,
          diplomes: diplomes.map((diplome) => {
            if (diplome.value !== ruleDiplome) {
              return diplome;
            }

            return {
              ...diplome,
              regles: [...diplome.regles, newRule],
            };
          }),
        };
      });
    });
    return newRule;
  }, []);

  const onUpdateRule = useCallback(async (ruleData) => {
    const updatedRule = await updateRule(ruleData);
    const { niveau: ruleNiveau, diplome: ruleDiplome } = updatedRule;

    setNiveaux((currentTree) => {
      return currentTree.map(({ niveau, diplomes }) => {
        if (niveau.value !== ruleNiveau) {
          return {
            niveau,
            diplomes: diplomes.map((diplome) => {
              return {
                ...diplome,
                regles: diplome.regles.filter(({ _id }) => _id !== updatedRule._id),
              };
            }),
          };
        }

        return {
          niveau,
          diplomes: diplomes.map((diplome) => {
            if (diplome.value !== ruleDiplome) {
              return {
                ...diplome,
                regles: diplome.regles.filter(({ _id }) => _id !== updatedRule._id),
              };
            }

            const regles = diplome.regles.map((regle) => {
              if (regle._id !== updatedRule._id) {
                return regle;
              }
              return updatedRule;
            });

            if (regles.every(({ _id }) => _id !== updatedRule._id)) {
              regles.push(updatedRule);
            }

            return {
              ...diplome,
              regles,
            };
          }),
        };
      });
    });
    return updatedRule;
  }, []);

  const onUpdateStatutAcademieRule = useCallback(
    async (ruleData) => {
      const updatedRule = await updateStatutAcademieRule(ruleData);
      const { niveau: ruleNiveau, diplome: ruleDiplome } = updatedRule;

      toast({
        title: "Modification acceptée",
        description: "La modification a été prise en compte et sera visible sur les offres catalogue demain.",
        status: "success",
        duration: 10000,
        isClosable: true,
      });

      setNiveaux((currentTree) => {
        return currentTree.map(({ niveau, diplomes }) => {
          if (niveau.value !== ruleNiveau) {
            return {
              niveau,
              diplomes: diplomes.map((diplome) => {
                return {
                  ...diplome,
                  regles: diplome.regles.filter(({ _id }) => _id !== updatedRule._id),
                };
              }),
            };
          }

          return {
            niveau,
            diplomes: diplomes.map((diplome) => {
              if (diplome.value !== ruleDiplome) {
                return {
                  ...diplome,
                  regles: diplome.regles.filter(({ _id }) => _id !== updatedRule._id),
                };
              }

              const regles = diplome.regles.map((regle) => {
                if (regle._id !== updatedRule._id) {
                  return regle;
                }
                return updatedRule;
              });

              if (regles.every(({ _id }) => _id !== updatedRule._id)) {
                regles.push(updatedRule);
              }

              return {
                ...diplome,
                regles,
              };
            }),
          };
        });
      });
      return updatedRule;
    },
    [toast]
  );

  const onDeleteStatutAcademieRule = useCallback(
    async (ruleData) => {
      const updatedRule = await deleteStatutAcademieRule(ruleData);
      const { niveau: ruleNiveau, diplome: ruleDiplome } = updatedRule;

      toast({
        title: "Modification acceptée",
        description: "La modification a été prise en compte et sera visible sur les offres catalogue demain.",
        status: "success",
        duration: 10000,
        isClosable: true,
      });

      setNiveaux((currentTree) => {
        return currentTree.map(({ niveau, diplomes }) => {
          if (niveau.value !== ruleNiveau) {
            return {
              niveau,
              diplomes: diplomes.map((diplome) => {
                return {
                  ...diplome,
                  regles: diplome.regles.filter(({ _id }) => _id !== updatedRule._id),
                };
              }),
            };
          }

          return {
            niveau,
            diplomes: diplomes.map((diplome) => {
              if (diplome.value !== ruleDiplome) {
                return {
                  ...diplome,
                  regles: diplome.regles.filter(({ _id }) => _id !== updatedRule._id),
                };
              }

              const regles = diplome.regles.map((regle) => {
                if (regle._id !== updatedRule._id) {
                  return regle;
                }
                return updatedRule;
              });

              if (regles.every(({ _id }) => _id !== updatedRule._id)) {
                regles.push(updatedRule);
              }

              return {
                ...diplome,
                regles,
              };
            }),
          };
        });
      });
      return updatedRule;
    },
    [toast]
  );

  const onDeleteRule = useCallback(async (ruleData) => {
    const deletedRule = await deleteRule(ruleData);
    const { niveau: ruleNiveau, diplome: ruleDiplome } = deletedRule;
    setNiveaux((currentTree) => {
      return currentTree.map(({ niveau, diplomes }) => {
        if (niveau.value !== ruleNiveau) {
          return { niveau, diplomes };
        }

        return {
          niveau,
          diplomes: diplomes.map((diplome) => {
            if (diplome.value !== ruleDiplome) {
              return diplome;
            }

            return {
              ...diplome,
              regles: diplome.regles.filter((regle) => regle._id !== deletedRule._id),
            };
          }),
        };
      });
    });
  }, []);

  // useEffect(() => {
  //   let mounted = true;
  //   const abortController = new AbortController();

  //   async function run() {
  //     try {
  //       setNiveauxCount({});
  //       const counts = {};
  //       await Promise.all(
  //         niveaux.map(async ({ niveau }) => {
  //           counts[niveau.value] = await getIntegrationCount(
  //             {
  //               plateforme,
  //               niveau: niveau.value,
  //               academie: currentAcademie,
  //             },
  //             { signal: abortController.signal }
  //           );
  //         })
  //       );
  //       if (mounted) {
  //         setNiveauxCount(counts);
  //       }
  //     } catch (e) {
  //       if (!abortController.signal.aborted) {
  //         throw e;
  //       }
  //     }
  //   }

  //   if (plateforme) {
  //     run();
  //   }

  //   return () => {
  //     // cleanup hook
  //     mounted = false;
  //     setNiveauxCount({});
  //     abortController.abort();
  //   };
  // }, [currentAcademie, niveaux, plateforme]);

  const onAcademieChange = useCallback((academie) => {
    setCurrentAcademie(academie);
  }, []);

  useEffect(() => {
    if (currentAcademie) {
      setCurrentIndex(niveaux.map((value, index) => index));
    } else {
      setCurrentIndex(-1);
    }
  }, [currentAcademie, niveaux]);

  if (!user || hasAccessToAtLeastOneOf(user, acls) === false) {
    return;
  }

  return (
    <Layout>
      <Box w="100%" pt={[4, 8]} px={[1, 1, 12, 24]}>
        <Container maxW="7xl">
          <Breadcrumb
            pages={[
              { title: "Accueil", to: "/" },
              { title: "Règles de périmètre", to: "/regles-perimetre" },
              { title: title },
            ]}
          />
          <Text textStyle="h2" color="grey.800" mt={5} pb={4}>
            {title}
          </Text>
          <Text fontWeight={700} pb={4}>
            {subtitle}
          </Text>
          <Box mt={4}>
            {niveaux.length === 0 && (
              <Center h="70vh" display="flex" flexDirection="column">
                <Text>Le chargement de cette page peut durer 30 secondes environ. Veuillez patienter…</Text>
                <br />
                <Spinner />
              </Center>
            )}

            {niveaux.length !== 0 && (
              <>
                <Flex
                  zIndex={1}
                  bg={"white"}
                  position={"sticky"}
                  top={0}
                  justifyContent={"space-between"}
                  py={4}
                  borderTop={"1px solid"}
                  borderBottom={"1px solid"}
                  borderColor={"grey.300"}
                >
                  <Flex alignItems={"center"}>
                    <FormLabel htmlFor="academie">Afficher les conditions :</FormLabel>
                    <AcademiesSelect
                      id={"academie"}
                      name={"academie"}
                      w={"auto"}
                      onChange={onAcademieChange}
                      user={user}
                    />
                  </Flex>

                  {hasAccessTo(user, createAcl) && !currentAcademie && (
                    <Button
                      variant="primary"
                      onClick={() => {
                        setCurrentRule(null);
                        onOpen();
                      }}
                    >
                      Ajouter un diplôme, un titre ou des formations
                    </Button>
                  )}
                </Flex>
                {!!currentAcademie && (
                  <Alert type={"warning"}>
                    Les réglages effectués sur cette page seront répercutés le lendemain sur les offres. Si une règle ”
                    À publier” est appliquée sur un type de formation, les offres correspondantes seront publiables le
                    lendemain. Si une règle “Hors périmètre Affelnet” est appliquée, les offres disparaîtront du
                    périmètre le lendemain.
                  </Alert>
                )}

                {!currentAcademie && (
                  <Box py={4}>
                    <DiplomesAutosuggest
                      plateforme={plateforme}
                      onSuggestionSelected={({ suggestion }) => {
                        setTimeout(() => setSelectedDiplome(suggestion.value), 400);
                      }}
                    />
                  </Box>
                )}
                {!currentAcademie && user && (isUserAdmin(user) || hasAllAcademiesRight(user)) && (
                  <Flex justifyContent={"flex-end"}>
                    <ExportButton plateforme={plateforme} rules={rules} />
                  </Flex>
                )}
                <Box minH="70vh">
                  <Accordion
                    bg="#FFFFFF"
                    mb={24}
                    index={currentIndex}
                    // index={niveaux.map((value, index) => index)}
                    allowMultiple={!!currentAcademie}
                    allowToggle
                  >
                    {niveaux
                      .filter(({ diplomes }) =>
                        currentAcademie
                          ? !!diplomes.find(
                              ({ regles }) =>
                                !!regles.find((regle) => [AFFELNET_STATUS.A_DEFINIR].includes(regle.statut))
                            )
                          : true
                      )
                      .map(({ niveau, diplomes }, index) => {
                        return (
                          <AccordionItem border="none" key={niveau.value} mt={6}>
                            {({ isExpanded }) => (
                              <>
                                <AccordionButton
                                  borderBottom={"1px solid"}
                                  borderColor={"grey.300"}
                                  px={0}
                                  onClick={() =>
                                    index === currentIndex ? setCurrentIndex(-1) : setCurrentIndex(index)
                                  }
                                >
                                  <Flex alignItems="center" w={"full"} justifyContent={"space-between"}>
                                    <Flex alignItems="center">
                                      <Text textStyle={"h4"} textAlign={"start"}>
                                        Niveau {niveau.value}
                                      </Text>
                                    </Flex>
                                    {/* {!currentAcademie && (
                                      <Text textStyle={"rf-text"} textAlign={"end"}>
                                        {niveauxCount[niveau.value]?.nbRules ?? "-"} diplômes et titres doivent ou
                                        peuvent intégrer la plateforme ce qui représente{" "}
                                        {niveauxCount[niveau.value]?.nbFormations ?? "-"} formations
                                      </Text>
                                    )} */}
                                  </Flex>
                                </AccordionButton>
                                <AccordionPanel p={0} bg="#FFFFFF" mb={16}>
                                  <Headline plateforme={plateforme} academie={currentAcademie} />
                                  {diplomes.map((diplome) => (
                                    <Diplome
                                      // bg={index % 2 === 0 ? "#fff" : "grey.100"}
                                      key={`${niveau.value}-${diplome.value}`}
                                      plateforme={plateforme}
                                      niveau={niveau.value}
                                      diplome={diplome}
                                      onShowRule={onShowRule}
                                      onCreateRule={onCreateRule}
                                      onUpdateRule={onUpdateRule}
                                      onDeleteRule={onDeleteRule}
                                      onUpdateStatutAcademieRule={onUpdateStatutAcademieRule}
                                      onDeleteStatutAcademieRule={onDeleteStatutAcademieRule}
                                      isExpanded={isExpanded}
                                      academie={currentAcademie}
                                      isSelected={selectedDiplome === diplome.value}
                                    />
                                  ))}
                                </AccordionPanel>
                              </>
                            )}
                          </AccordionItem>
                        );
                      })}
                  </Accordion>
                </Box>
              </>
            )}
          </Box>

          <RuleModal
            isOpen={isOpen}
            onClose={() => {
              onClose();
              setCurrentRule(null);
            }}
            rule={currentRule}
            onUpdateRule={onUpdateRule}
            onDeleteRule={onDeleteRule}
            onCreateRule={onCreateRule}
            plateforme={plateforme}
            academie={currentAcademie}
          />
        </Container>
      </Box>
    </Layout>
  );
};
