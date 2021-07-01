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
  Spinner,
  Text,
} from "@chakra-ui/react";
import { Breadcrumb } from "../../common/components/Breadcrumb";
import Layout from "../layout/Layout";
import { setTitle } from "../../common/utils/pageUtils";
import { _get } from "../../common/httpClient";
import { AddFill, Dots, SubtractLine } from "../../theme/components/icons";
import { StatusBadge } from "../../common/components/StatusBadge";

const endpointNewFront = `${process.env.REACT_APP_BASE_URL}/api`;

export default ({ plateforme }) => {
  const [niveaux, setNiveaux] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

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
                                {diplomes.map(({ value, count, regles }) => {
                                  // check if it has one rule at diplome level
                                  const [diplomeRule] = regles.filter(
                                    ({ regle_complementaire }) => regle_complementaire === "{}"
                                  );

                                  const otherRules = regles.filter(
                                    ({ regle_complementaire }) => regle_complementaire !== "{}"
                                  );

                                  return (
                                    <Accordion
                                      allowMultiple
                                      bg="#FFFFFF"
                                      key={`${niveau.value}-${value}`}
                                      borderBottom={"1px solid"}
                                      borderColor={"grey.300"}
                                    >
                                      <AccordionItem border="none" m={0}>
                                        {({ isExpanded }) => (
                                          <>
                                            <AccordionButton>
                                              <Flex px={4} alignItems="center" w={"full"}>
                                                <Flex grow={1} alignItems="center">
                                                  {otherRules?.length > 0 ? (
                                                    isExpanded ? (
                                                      <SubtractLine fontSize="12px" color="bluefrance" mr={2} />
                                                    ) : (
                                                      <AddFill fontSize="12px" color="bluefrance" mr={2} />
                                                    )
                                                  ) : (
                                                    ""
                                                  )}
                                                  <Text>{value}</Text>
                                                </Flex>
                                                <Flex
                                                  flexBasis={"40%"}
                                                  justifyContent={"space-between"}
                                                  alignItems="center"
                                                >
                                                  <Flex minW={8}>{count}</Flex>
                                                  <Flex>
                                                    {diplomeRule ? (
                                                      <StatusBadge source={plateforme} status={diplomeRule.statut} />
                                                    ) : (
                                                      <StatusBadge source={plateforme} status="hors périmètre" />
                                                    )}
                                                  </Flex>
                                                  <Flex alignItems="center">
                                                    <Dots color={"bluefrance"} boxSize={4} />
                                                  </Flex>
                                                </Flex>
                                              </Flex>
                                            </AccordionButton>
                                            {otherRules?.length > 0 && (
                                              <AccordionPanel>
                                                <Box px={8}>
                                                  {otherRules.map(
                                                    ({
                                                      _id,
                                                      nom_regle_complementaire,
                                                      statut,
                                                      regle_complementaire,
                                                    }) => (
                                                      <Box key={_id}>
                                                        {nom_regle_complementaire} {statut} : {regle_complementaire}
                                                      </Box>
                                                    )
                                                  )}
                                                </Box>
                                              </AccordionPanel>
                                            )}
                                          </>
                                        )}
                                      </AccordionItem>
                                    </Accordion>
                                  );
                                })}
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
        </Container>
      </Box>
    </Layout>
  );
};
