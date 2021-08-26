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
  Select,
  Spinner,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { Breadcrumb } from "../../common/components/Breadcrumb";
import Layout from "../layout/Layout";
import { setTitle } from "../../common/utils/pageUtils";
import { _delete, _get, _post, _put } from "../../common/httpClient";
import { FolderLine, FolderOpenLine } from "../../theme/components/icons";
import { RuleModal } from "./components/RuleModal";
import { Diplome } from "./components/Diplome";
import { Headline } from "./components/Headline";
import { useQuery } from "react-query";
import { academies } from "../../constants/academies";
import useAuth from "../../common/hooks/useAuth";
import { hasAcademyRight, hasAllAcademiesRight, isUserAdmin } from "../../common/utils/rolesUtils";

const endpointNewFront = `${process.env.REACT_APP_BASE_URL}/api`;

const createRule = async ({
  plateforme,
  niveau,
  diplome,
  statut,
  regle_complementaire,
  regle_complementaire_query,
  nom_regle_complementaire,
  condition_integration,
  duree,
  statut_academies,
  num_academie,
}) => {
  return await _post(`${endpointNewFront}/entity/perimetre/regle`, {
    plateforme,
    niveau,
    diplome,
    statut,
    regle_complementaire,
    regle_complementaire_query,
    nom_regle_complementaire,
    condition_integration,
    duree,
    statut_academies,
    num_academie,
  });
};

const updateRule = async ({
  _id,
  plateforme,
  niveau,
  diplome,
  statut,
  regle_complementaire,
  regle_complementaire_query,
  nom_regle_complementaire,
  condition_integration,
  duree,
  statut_academies,
}) => {
  return await _put(`${endpointNewFront}/entity/perimetre/regle/${_id}`, {
    plateforme,
    niveau,
    diplome,
    statut,
    regle_complementaire,
    regle_complementaire_query,
    nom_regle_complementaire,
    condition_integration,
    duree,
    statut_academies,
  });
};

const deleteRule = async ({ _id }) => {
  return await _delete(`${endpointNewFront}/entity/perimetre/regle/${_id}`);
};

const getIntegrationCount = async ({ plateforme, niveau, academie }) => {
  try {
    const countUrl = `${endpointNewFront}/v1/entity/perimetre/regles/integration/count`;
    const params = new URLSearchParams({
      plateforme: plateforme,
      num_academie: academie,
      ...(niveau ? { niveau } : {}),
    });
    return await _get(`${countUrl}?${params}`, false);
  } catch (e) {
    console.error(e);
    return { nbRules: 0, nbFormations: 0 };
  }
};

const CountText = ({ totalFormationsCount, plateforme, niveaux, academie, ...rest }) => {
  const [integrationCount, setIntegrationCount] = useState({});

  useEffect(() => {
    async function run() {
      const count = await getIntegrationCount({ plateforme, academie });
      setIntegrationCount(count);
    }

    run();
  }, [plateforme, academie]);

  const diplomesCount = niveaux.reduce(
    (acc, { diplomes }) =>
      acc +
      diplomes.length +
      diplomes.reduce(
        (acc2, { regles }) =>
          acc2 + regles.filter(({ nom_regle_complementaire }) => nom_regle_complementaire !== null).length,
        0
      ),
    0
  );

  return (
    <Text {...rest}>
      Actuellement{" "}
      {academie
        ? `pour l'académie de ${
            Object.values(academies).find(({ num_academie }) => num_academie === Number(academie))?.nom_academie
          }`
        : "au national"}
      , {integrationCount?.nbRules ?? "-"} diplômes ou titres en apprentissage ({integrationCount?.nbFormations ?? "-"}{" "}
      formations) doivent ou peuvent intégrer la plateforme {plateforme} sur les {diplomesCount} recensés (
      {totalFormationsCount} formations dont le diplôme a une date de fin supérieure au 31/08 de l'année en cours) dans
      le Catalogue général.
    </Text>
  );
};

export default ({ plateforme }) => {
  const [user] = useAuth();
  const [niveaux, setNiveaux] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentRule, setCurrentRule] = useState(null);
  const [currentAcademie, setCurrentAcademie] = useState(null);
  const [niveauxCount, setNiveauxCount] = useState({});
  const [academiesList, setAcademiesList] = useState([]);

  const title = `Conditions d’intégration des formations dans la plateforme ${plateforme}`;
  setTitle(title);

  const niveauxURL = `${endpointNewFront}/v1/entity/perimetre/niveau`;
  const { data: niveauxData } = useQuery("niveaux", () => _get(niveauxURL, false), {
    refetchOnWindowFocus: false,
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  useEffect(() => {
    if (user) {
      if (isUserAdmin(user) || hasAllAcademiesRight(user)) {
        setAcademiesList(Object.values(academies));
        setCurrentAcademie(null);
      } else {
        setAcademiesList(Object.values(academies).filter(({ num_academie }) => hasAcademyRight(user, num_academie)));
        const [firstAcademy] = user.academie?.split(",")?.map((academieStr) => Number(academieStr)) ?? [];
        setCurrentAcademie(`${firstAcademy}`);
      }
    }
  }, [user]);

  useEffect(() => {
    async function run() {
      try {
        const reglesUrl = `${endpointNewFront}/v1/entity/perimetre/regles`;
        const regles = await _get(`${reglesUrl}?plateforme=${plateforme}`, false);

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

        const total = niveauxData.reduce((acc, { niveau }) => acc + niveau.count, 0);
        setTotalCount(total);

        const obsoleteRegles = regles.filter(({ _id }) => !reglesInTree.includes(_id));
        if (obsoleteRegles.length > 0) {
          console.error("Des règles obsolètes ont été trouvées :", obsoleteRegles);
          // This rules should probably be deleted
        }
        setNiveaux(niveauxTree);
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

  return (
    <Layout>
      <Box w="100%" pt={[4, 8]} px={[1, 1, 12, 24]}>
        <Container maxW="xl">
          <Breadcrumb pages={[{ title: "Accueil", to: "/" }, { title: title }]} />
          <Heading textStyle="h2" color="grey.800" mt={5} pb={4}>
            {title}
          </Heading>
          <Text fontWeight={700} pb={4}>
            Déterminer par niveau et par titres et diplômes, les formations qui doivent ou peuvent intégrer la
            plateforme {plateforme} et leurs règles de publication.
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
                    <Select
                      id={"academie"}
                      name={"academie"}
                      w={"auto"}
                      onChange={(e) => {
                        const academie = e.target.value === "national" ? null : e.target.value;
                        setCurrentAcademie(academie);
                      }}
                    >
                      {user && (isUserAdmin(user) || hasAllAcademiesRight(user)) && (
                        <option value={"national"}>au National</option>
                      )}
                      {academiesList.map(({ nom_academie, num_academie }) => {
                        return (
                          <option key={num_academie} value={num_academie}>
                            de {nom_academie} ({num_academie})
                          </option>
                        );
                      })}
                    </Select>
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
                <Box minH="70vh">
                  <Accordion bg="#FFFFFF" mb={24} allowToggle>
                    {niveaux.map(({ niveau, diplomes }) => {
                      return (
                        <AccordionItem border="none" key={niveau.value} mt={6}>
                          {({ isExpanded }) => (
                            <>
                              <AccordionButton borderBottom={"1px solid"} borderColor={"grey.300"} px={0}>
                                <Flex alignItems="center" w={"full"} justifyContent={"space-between"}>
                                  <Flex alignItems="center">
                                    {isExpanded ? (
                                      <FolderOpenLine color="bluefrance" mr={4} boxSize={5} />
                                    ) : (
                                      <FolderLine color="bluefrance" mr={4} boxSize={5} />
                                    )}
                                    <Text textStyle={"h4"}>Niveau {niveau.value}</Text>
                                  </Flex>
                                  <Text textStyle={"rf-text"}>
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
