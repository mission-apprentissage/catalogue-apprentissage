import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Box,
  Container,
  Flex,
  Heading,
  Text,
} from "@chakra-ui/react";
import { Breadcrumb } from "../../common/components/Breadcrumb";
import Layout from "../layout/Layout";
import { setTitle } from "../../common/utils/pageUtils";
import { _get } from "../../common/httpClient";
import { AddFill, SubtractLine } from "../../theme/components/icons";

const endpointNewFront = `${process.env.REACT_APP_BASE_URL}/api`;

export default ({ plateforme }) => {
  const [niveaux, setNiveaux] = useState([]);
  const title = `Périmètre ${plateforme}`;
  setTitle(title);

  useEffect(() => {
    async function run() {
      try {
        const niveauxURL = `${endpointNewFront}/v1/entity/perimetre/niveau`;
        const niveaux = await _get(niveauxURL, false);

        const reglesUrl = `${endpointNewFront}/v1/entity/perimetre/regles`;
        const regles = await _get(`${reglesUrl}?plateforme=${plateforme}`, false);

        let reglesInTree = [];

        const niveauxTree = Object.entries(niveaux).map(([niveau, diplomes]) => {
          return {
            niveau,
            diplomes: diplomes.map((diplome) => {
              const filteredRegles = regles.filter(
                ({ niveau: niv, diplome: dip }) => niveau === niv && diplome === dip
              );
              reglesInTree = [...reglesInTree, ...filteredRegles.map(({ _id }) => _id)];
              return {
                diplome,
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
            {niveaux.map(({ niveau, diplomes }) => {
              return (
                <Accordion allowMultiple bg="#FFFFFF" key={niveau}>
                  <AccordionItem border="none">
                    {({ isExpanded }) => (
                      <>
                        <AccordionButton bg="#F9F8F6">
                          {isExpanded ? (
                            <SubtractLine fontSize="12px" color="bluefrance" mr={2} />
                          ) : (
                            <AddFill fontSize="12px" color="bluefrance" mr={2} />
                          )}
                          <Text color="bluefrance" fontWeight={700}>
                            {niveau}
                          </Text>
                        </AccordionButton>
                        <AccordionPanel p={0} bg="#FFFFFF">
                          {diplomes.map(({ diplome, regles }) => (
                            <Accordion
                              allowMultiple
                              bg="#FFFFFF"
                              key={`${niveau}-${diplome}`}
                              borderBottom={"1px solid"}
                              borderColor={"grey.300"}
                            >
                              <AccordionItem border="none" m={0}>
                                {({ isExpanded }) => (
                                  <>
                                    <AccordionButton>
                                      <Flex px={4} alignItems="center">
                                        {regles?.length > 0 ? (
                                          isExpanded ? (
                                            <SubtractLine fontSize="12px" color="bluefrance" mr={2} />
                                          ) : (
                                            <AddFill fontSize="12px" color="bluefrance" mr={2} />
                                          )
                                        ) : (
                                          ""
                                        )}
                                        <Text>{diplome}</Text>
                                      </Flex>
                                    </AccordionButton>
                                    <AccordionPanel>
                                      {regles?.length > 0 && (
                                        <Box px={8}>
                                          {regles.map(
                                            ({ _id, nom_regle_complementaire, statut, regle_complementaire }) => (
                                              <Box key={_id}>
                                                {nom_regle_complementaire} {statut} : {regle_complementaire}
                                              </Box>
                                            )
                                          )}
                                        </Box>
                                      )}
                                    </AccordionPanel>
                                  </>
                                )}
                              </AccordionItem>
                            </Accordion>
                          ))}
                        </AccordionPanel>
                      </>
                    )}
                  </AccordionItem>
                </Accordion>
              );
            })}
          </Box>
        </Container>
      </Box>
    </Layout>
  );
};
