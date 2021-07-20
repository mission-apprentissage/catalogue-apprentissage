import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Box,
  Center,
  Container,
  Flex,
  Heading,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spinner,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { Breadcrumb } from "../../common/components/Breadcrumb";
import Layout from "../layout/Layout";
import { setTitle } from "../../common/utils/pageUtils";
import { _get } from "../../common/httpClient";
import { AddFill, Dots, SubtractLine } from "../../theme/components/icons";
import { StatusBadge } from "../../common/components/StatusBadge";
import { RuleModal } from "./RuleModal";

const endpointNewFront = `${process.env.REACT_APP_BASE_URL}/api`;

const Line = ({
  isExpanded,
  showIcon,
  label,
  count,
  status,
  plateforme,
  niveau,
  diplome,
  regle_complementaire,
  shouldFetchCount,
  onShowRule,
  ...rest
}) => {
  const [lineCount, setLineCount] = useState(count);

  useEffect(() => {
    async function run() {
      try {
        const countUrl = `${endpointNewFront}/v1/entity/perimetre/regle/count`;
        const count = await _get(
          `${countUrl}?niveau=${niveau}&diplome=${diplome}&regle_complementaire=${regle_complementaire}`,
          false
        );
        setLineCount(count);
      } catch (e) {
        console.error(e);
      }
    }
    if (regle_complementaire && !count && shouldFetchCount) {
      run();
    }
  }, [count, diplome, niveau, regle_complementaire, shouldFetchCount]);

  return (
    <AccordionButton as={Box} role={"button"}>
      <Flex px={4} alignItems="center" w={"full"}>
        <Flex grow={1} alignItems="center" {...rest}>
          {showIcon ? (
            isExpanded ? (
              <SubtractLine fontSize="12px" color="bluefrance" mr={2} />
            ) : (
              <AddFill fontSize="12px" color="bluefrance" mr={2} />
            )
          ) : (
            ""
          )}
          <Text>{label}</Text>
        </Flex>
        <Flex flexBasis={"40%"} justifyContent={"space-between"} alignItems="center">
          <Flex minW={8}>{lineCount}</Flex>
          <Flex>
            {status ? (
              <StatusBadge source={plateforme} status={status} />
            ) : (
              <StatusBadge source={plateforme} status="hors périmètre" />
            )}
          </Flex>
          <Flex alignItems="center">
            <Menu>
              <MenuButton
                as={IconButton}
                aria-label="Options"
                icon={<Dots color={"bluefrance"} boxSize={4} />}
                variant="unstyled"
                _hover={{ bg: "grey.300" }}
                onClick={(evt) => evt.stopPropagation()}
              />
              <MenuList minW={"25rem"} minH={"10rem"} borderRadius={0} color={"bluefrance"}>
                <MenuItem
                  onClick={(evt) => {
                    evt.stopPropagation();
                    onShowRule();
                  }}
                >
                  Afficher les conditions
                </MenuItem>
                <MenuItem onClick={(evt) => evt.stopPropagation()}>Dupliquer les conditions</MenuItem>
                <MenuItem onClick={(evt) => evt.stopPropagation()}>Supprimer les conditions</MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </Flex>
      </Flex>
    </AccordionButton>
  );
};

const Diplome = ({ plateforme, niveau, diplome, onShowRule }) => {
  const { value, count, regles } = diplome;

  // check if it has one rule at diplome level
  const [diplomeRule] = regles.filter(({ regle_complementaire }) => regle_complementaire === "{}");

  const otherRules = regles.filter(({ regle_complementaire }) => regle_complementaire !== "{}");

  return (
    <Accordion allowMultiple bg="#FFFFFF" borderBottom={"1px solid"} borderColor={"grey.300"}>
      <AccordionItem border="none" m={0}>
        {({ isExpanded }) => (
          <>
            <Line
              plateforme={plateforme}
              niveau={niveau}
              diplome={value}
              isExpanded={isExpanded}
              showIcon={otherRules?.length > 0}
              label={value}
              status={diplomeRule?.statut}
              count={count}
              onShowRule={() => onShowRule(value, "")}
            />
            {otherRules?.length > 0 && (
              <AccordionPanel p={0}>
                {otherRules.map(({ _id, nom_regle_complementaire, statut, regle_complementaire }) => (
                  <Line
                    pl={6}
                    key={_id}
                    plateforme={plateforme}
                    niveau={niveau}
                    diplome={value}
                    isExpanded={false}
                    showIcon={false}
                    label={nom_regle_complementaire}
                    status={statut}
                    regle_complementaire={regle_complementaire}
                    shouldFetchCount={isExpanded}
                    onShowRule={() => onShowRule(value, regle_complementaire, nom_regle_complementaire)}
                  />
                ))}
              </AccordionPanel>
            )}
          </>
        )}
      </AccordionItem>
    </Accordion>
  );
};

export default ({ plateforme }) => {
  const [niveaux, setNiveaux] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentRule, setCurrentRule] = useState({});

  const title = `Conditions d’intégration des formations dans la plateforme ${plateforme}`;
  setTitle(title);

  useEffect(() => {
    async function run() {
      try {
        const niveauxURL = `${endpointNewFront}/v1/entity/perimetre/niveau`;
        const niveaux = await _get(niveauxURL, false);

        const reglesUrl = `${endpointNewFront}/v1/entity/perimetre/regles`;
        const regles = await _get(`${reglesUrl}?plateforme=${plateforme}`, false);

        let reglesInTree = [];

        const niveauxTree = niveaux.map(({ niveau, diplomes }) => {
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

        const total = niveaux.reduce((acc, { niveau }) => acc + niveau.count, 0);
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
    run();
  }, [plateforme]);

  const onShowRule = (title, rule, name) => {
    setCurrentRule({ title, rule, name });
    onOpen();
  };

  return (
    <Layout>
      <Box w="100%" pt={[4, 8]} px={[1, 1, 12, 24]}>
        <Container maxW="xl">
          <Breadcrumb pages={[{ title: "Accueil", to: "/" }, { title: title }]} />
          <Heading textStyle="h2" color="grey.800" mt={5}>
            {title}
          </Heading>
          <Box mt={4}>
            {niveaux.length === 0 && (
              <Center h="70vh">
                <Spinner />
              </Center>
            )}

            {niveaux.length !== 0 && (
              <>
                <Text pb={4}>
                  {totalCount} formations dans le catalogue général, dont le diplôme a une date de fin supérieure au
                  31/08 de l'année en cours.
                </Text>
                <Box minH="70vh">
                  {niveaux.map(({ niveau, diplomes }) => {
                    return (
                      <Accordion allowMultiple bg="#FFFFFF" key={niveau.value}>
                        <AccordionItem border="none">
                          {({ isExpanded }) => (
                            <>
                              <AccordionButton bg="#F9F8F6">
                                <Flex alignItems="center" w={"full"}>
                                  <Flex grow={1} alignItems="center">
                                    {isExpanded ? (
                                      <SubtractLine fontSize="12px" color="bluefrance" mr={2} />
                                    ) : (
                                      <AddFill fontSize="12px" color="bluefrance" mr={2} />
                                    )}
                                    <Text color="bluefrance" fontWeight={700}>
                                      {niveau.value}
                                    </Text>
                                  </Flex>
                                  <Flex flexBasis={"40%"}>{niveau.count}</Flex>
                                </Flex>
                              </AccordionButton>
                              <AccordionPanel p={0} bg="#FFFFFF">
                                {diplomes.map((diplome) => (
                                  <Diplome
                                    key={`${niveau.value}-${diplome.value}`}
                                    plateforme={plateforme}
                                    niveau={niveau.value}
                                    diplome={diplome}
                                    onShowRule={onShowRule}
                                  />
                                ))}
                              </AccordionPanel>
                            </>
                          )}
                        </AccordionItem>
                      </Accordion>
                    );
                  })}
                </Box>
              </>
            )}
          </Box>
          <RuleModal
            isOpen={isOpen}
            onClose={onClose}
            title={currentRule.title}
            rule={currentRule.rule}
            name={currentRule.name}
          />
        </Container>
      </Box>
    </Layout>
  );
};
