import React, { useCallback, useEffect, useState } from "react";
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
  Heading,
  Spinner,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { Breadcrumb } from "../../common/components/Breadcrumb";
import Layout from "../layout/Layout";
import { setTitle } from "../../common/utils/pageUtils";
import { FolderLine, FolderOpenLine } from "../../theme/components/icons";
import { RuleModal } from "./components/RuleModal";
import { Diplome } from "./components/Diplome";
import { Headline } from "./components/Headline";
import useAuth from "../../common/hooks/useAuth";
import { hasAllAcademiesRight, isUserAdmin } from "../../common/utils/rolesUtils";
import { ExportButton } from "./components/ExportButton";
import { CountText } from "./components/CountText";
import {
  createRule,
  deleteRule,
  getIntegrationCount,
  getRules,
  updateRule,
  useNiveaux,
} from "../../common/api/perimetre";
import { AcademiesSelect } from "./components/AcademiesSelect";
import { DiplomesAutosuggest } from "./components/DiplomesAutosuggest";

export default ({ plateforme }) => {
  const [user] = useAuth();
  const [niveaux, setNiveaux] = useState([]);
  const [rules, setRules] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentRule, setCurrentRule] = useState(null);
  const [currentAcademie, setCurrentAcademie] = useState(null);
  const [niveauxCount, setNiveauxCount] = useState({});
  const [selectedNiveauIndex, setSelectedNiveauIndex] = useState(null);
  const [selectedDiplome, setSelectedDiplome] = useState(null);

  const title = `Règles d'intégration des formations à la plateforme ${plateforme}`;
  setTitle(title);

  const { data: niveauxData } = useNiveaux();

  useEffect(() => {
    async function run() {
      try {
        const regles = await getRules({ plateforme });
        let reglesInTree = [];

        const niveauxTree = niveauxData.map(({ niveau, diplomes }) => {
          return {
            niveau,
            diplomes: diplomes
              .map((diplome) => {
                const filteredRegles = regles.filter(
                  ({ niveau: niv, diplome: dip }) => niveau.value === niv && diplome.value === dip
                );
                reglesInTree = [...reglesInTree, ...filteredRegles.map(({ _id }) => _id)];
                return {
                  ...diplome,
                  regles: filteredRegles,
                };
              })
              .sort((diplomeA, diplomeB) => diplomeB.count - diplomeA.count),
          };
        });

        const total = niveauxData.reduce((acc, { niveau }) => acc + niveau.count, 0);
        setTotalCount(total);

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

  useEffect(() => {
    async function run() {
      const counts = {};
      await Promise.all(
        niveaux.map(async ({ niveau }) => {
          counts[niveau.value] = await getIntegrationCount({
            plateforme,
            niveau: niveau.value,
            academie: currentAcademie,
          });
        })
      );
      setNiveauxCount(counts);
    }

    if (plateforme) {
      run();
    } else {
      setNiveauxCount({});
    }
  }, [currentAcademie, niveaux, plateforme]);

  const onAcademieChange = useCallback((academie) => setCurrentAcademie(academie), []);

  return (
    <Layout>
      <Box w="100%" pt={[4, 8]} px={[1, 1, 12, 24]}>
        <Container maxW="xl">
          <Breadcrumb pages={[{ title: "Accueil", to: "/" }, { title: title }]} />
          <Heading textStyle="h2" color="grey.800" mt={5} pb={4}>
            {title}
          </Heading>
          <Text fontWeight={700} pb={4}>
            Déterminer les conditions d'intégrations des formations en apprentissage du Catalogue (Carif-Oref) sur la
            plateforme {plateforme}
          </Text>
          <Box mt={4}>
            {niveaux.length === 0 && (
              <Center h="70vh">
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
                  <Button
                    variant="primary"
                    onClick={() => {
                      setCurrentRule(null);
                      onOpen();
                    }}
                  >
                    Ajouter un diplôme, un titre ou des formations
                  </Button>
                </Flex>
                <CountText
                  py={4}
                  totalFormationsCount={totalCount}
                  niveaux={niveaux}
                  plateforme={plateforme}
                  academie={currentAcademie}
                />
                <Box py={4}>
                  <DiplomesAutosuggest
                    onSuggestionSelected={({ suggestion }) => {
                      const index = niveaux.findIndex(({ niveau }) => niveau.value === suggestion.niveau);
                      setSelectedNiveauIndex(index);
                      setTimeout(() => setSelectedDiplome(suggestion.value), 800);
                    }}
                  />
                </Box>
                {user && (isUserAdmin(user) || hasAllAcademiesRight(user)) && (
                  <Flex justifyContent={"flex-end"}>
                    <ExportButton plateforme={plateforme} rules={rules} />
                  </Flex>
                )}
                <Box minH="70vh">
                  <Accordion bg="#FFFFFF" mb={24} index={selectedNiveauIndex} allowToggle>
                    {niveaux.map(({ niveau, diplomes }, index) => {
                      return (
                        <AccordionItem border="none" key={niveau.value} mt={6}>
                          {({ isExpanded }) => (
                            <>
                              <AccordionButton
                                borderBottom={"1px solid"}
                                borderColor={"grey.300"}
                                px={0}
                                onClick={() =>
                                  setSelectedNiveauIndex((prevIndex) => (prevIndex !== index ? index : null))
                                }
                              >
                                <Flex alignItems="center" w={"full"} justifyContent={"space-between"}>
                                  <Flex alignItems="center">
                                    {isExpanded ? (
                                      <FolderOpenLine color="bluefrance" mr={4} boxSize={5} />
                                    ) : (
                                      <FolderLine color="bluefrance" mr={4} boxSize={5} />
                                    )}
                                    <Text textStyle={"h4"} textAlign={"start"}>
                                      Niveau {niveau.value}
                                    </Text>
                                  </Flex>
                                  <Text textStyle={"rf-text"} textAlign={"end"}>
                                    {niveauxCount[niveau.value]?.nbRules ?? 0} diplômes et titres doivent ou peuvent
                                    intégrer la plateforme ce qui représente{" "}
                                    {niveauxCount[niveau.value]?.nbFormations ?? 0} formations
                                  </Text>
                                </Flex>
                              </AccordionButton>
                              <AccordionPanel p={0} bg="#FFFFFF" mb={16}>
                                <Headline plateforme={plateforme} />
                                {diplomes.map((diplome, index) => (
                                  <Diplome
                                    bg={index % 2 === 0 ? "#fff" : "grey.100"}
                                    key={`${niveau.value}-${diplome.value}`}
                                    plateforme={plateforme}
                                    niveau={niveau.value}
                                    diplome={diplome}
                                    onShowRule={onShowRule}
                                    onCreateRule={onCreateRule}
                                    onUpdateRule={onUpdateRule}
                                    onDeleteRule={onDeleteRule}
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
