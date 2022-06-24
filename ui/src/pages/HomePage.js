import React, { useEffect, useState } from "react";
import Layout from "./layout/Layout";
import packageJson from "../../package.json";

import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Link,
  List,
  ListItem,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from "@chakra-ui/react";

import { NavLink } from "react-router-dom";
import Changelog from "../common/components/Changelog/Changelog";
import changelog from "../CHANGELOG";
import { _get } from "../common/httpClient";
import { ArrowRightLine, ExternalLinkLine } from "../theme/components/icons";
import { Breadcrumb } from "../common/components/Breadcrumb";
import { setTitle } from "../common/utils/pageUtils";

const CATALOGUE_API = `${process.env.REACT_APP_BASE_URL}/api`;

export default () => {
  const [loading, setLoading] = useState(true);
  const [countEstablishments, setCountEstablishments] = useState(0);
  const [countFormations, setCountFormations] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function run() {
      try {
        const params = new window.URLSearchParams({
          query: JSON.stringify({ published: true }),
        });

        const countEtablissement = await _get(`${CATALOGUE_API}/entity/etablissements/count?${params}`, false);
        const count = await _get(`${CATALOGUE_API}/entity/formations/count?${params}`, false);

        if (mounted) {
          setCountEstablishments(countEtablissement);
          setCountFormations(count);
          setLoading(false);
        }
      } catch (e) {
        console.log(e);
      }
    }
    run();

    return () => {
      // cleanup hook
      mounted = false;
    };
  }, []);

  const title = "Accueil";
  setTitle(title);

  return (
    <Layout>
      <Box w="100%" pt={[4, 8]} px={[1, 1, 12, 24]} color="#1E1E1E">
        <Container maxW="xl">
          {/*<Box bg="#F8F8F8" color="pinksoft.500" borderLeft="4px" role="none" p={5}>*/}
          {/*  <Flex>*/}
          {/*    <Box>*/}
          {/*      <InformationLine />*/}
          {/*    </Box>*/}
          {/*    <Text color="black" textStyle="sm" px={2}>*/}
          {/*      Grâce à vos retours une anomalie a été détectée dans le code qui testait la présence d'un SIRET sur un*/}
          {/*      titre. Un correctif va être effectué très prochainement.*/}
          {/*      <br />*/}
          {/*      <Text fontWeight="700" as="span">*/}
          {/*        En attendant, les formations à des titres en apprentissage sont toutes affichées en « hors périmètre*/}
          {/*        ». Nous vous informerons dès que le correctif sera appliqué.*/}
          {/*      </Text>*/}
          {/*    </Text>*/}
          {/*  </Flex>*/}
          {/*</Box>*/}
          <Breadcrumb pages={[{ title: title }]} />
        </Container>
      </Box>
      <Box w="100%" py={[4, 8]} px={[1, 1, 12, 24]} color="#1E1E1E">
        <Container maxW="xl">
          <Flex flexDirection={["column", "column", "column", "column", "row"]}>
            <Box minW="250px">
              <Box bg="#F9F8F6" p={3}>
                <Heading textStyle="rf-text" fontWeight="700" p={2}>
                  SOMMAIRE
                </Heading>
                <List stylePosition="inside">
                  <ListItem py={1}>
                    <Link href={"#mise-a-jour"} variant="summary">
                      <strong>1.</strong> Mise à jour des données
                    </Link>
                  </ListItem>
                  <ListItem py={1}>
                    <Link href={"#organisme-de-formation"} variant="summary">
                      <strong>2.</strong> Vous êtes organisme de formation
                    </Link>
                  </ListItem>
                  <ListItem py={1}>
                    <Link href={"#en-academie"} variant="summary">
                      <strong>3.</strong> Vous travaillez en académie
                    </Link>
                  </ListItem>
                  <ListItem py={1}>
                    <Link href={"#journal"} variant="summary">
                      <strong>4.</strong> Journal des modifications
                    </Link>
                  </ListItem>
                </List>
              </Box>
            </Box>
            <Box px={[1, 5]} mt={[4, 4, 4, 0]}>
              <Heading as="h1" textStyle={"h2"}>
                Le catalogue des offres de formations en apprentissage recense aujourd’hui :
              </Heading>
              <Box>
                <br /> &nbsp;
                {loading && <Text>chargement...</Text>}
                {!loading && (
                  <Flex flexDirection={["column", "column", "column", "row"]}>
                    <Link as={NavLink} to={"/recherche/formations"} variant="card" w={["100%", "100%", "75%", "40%"]}>
                      <Text fontWeight="700" textStyle="h6">
                        {countFormations.toLocaleString("fr-FR")} formations
                      </Text>
                      <Flex>
                        <Text flex="1" textStyle="sm">
                          en apprentissage
                        </Text>
                        <Box alignSelf="flex-end" fontSize="gamma" color={"bluefrance"}>
                          <ArrowRightLine alignSelf="center" color="bluefrance" boxSize={4} />
                        </Box>
                      </Flex>
                    </Link>
                    <Link
                      as={NavLink}
                      to={"/recherche/etablissements"}
                      variant="card"
                      w={["100%", "100%", "75%", "40%"]}
                      mx={[0, 0, 0, 5]}
                      mt={[5, 5, 5, 0]}
                    >
                      <Heading fontWeight="700" textStyle="h6">
                        {countEstablishments.toLocaleString("fr-FR")} organismes
                      </Heading>
                      <Flex>
                        <Text flex="1" textStyle="sm">
                          de formation
                        </Text>
                        <Box alignSelf="flex-end" fontSize="gamma" color={"bluefrance"}>
                          <ArrowRightLine alignSelf="center" color="bluefrance" boxSize={4} />
                        </Box>
                      </Flex>
                    </Link>
                  </Flex>
                )}
                <br />
                <br />
                <Box textStyle="rf-text">
                  <Heading as="h2" textStyle="h4" id="mise-a-jour" tabIndex="-1">
                    Mise à jour des données
                  </Heading>
                  <br />
                  <Text textStyle="rf-text">
                    Les référencements et mises à jour effectués dans les bases “Offre des Carif-Oref” de chaque région
                    sont répercutés quotidiennement dans le “Catalogue des offres de formations en apprentissage” (délai
                    de 72h entre modifications demandées au Carif-Oref et publication dans le Catalogue).
                  </Text>
                </Box>
                <br /> <br />
                <Box>
                  <Heading as="h2" textStyle="h4" id="organisme-de-formation" tabIndex="-1">
                    Vous êtes organisme de formation
                  </Heading>
                  <br />
                  <Text textStyle="rf-text">
                    <strong>
                      Pour ajouter une offre de formation au Catalogue de l’offre de formation en apprentissage
                    </strong>
                    , merci de la déclarer <br /> auprès du Carif-Oref de votre région en allant sur la page{" "}
                    <Link
                      href="https://reseau.intercariforef.org/referencer-son-offre-de-formation"
                      textDecoration="underline"
                      isExternal
                    >
                      "référencer son offre de formation{" "}
                      <ExternalLinkLine w={"0.75rem"} h={"0.75rem"} mb={"0.125rem"} />"
                    </Link>
                  </Text>
                  <br />
                  <Text textStyle="rf-text">
                    <strong> Pour modifier les caractéristiques de votre organisme </strong> (raison sociale, SIRET,
                    adresse postale, etc.), vous pouvez vous rapprocher de l’INSEE afin de réaliser les modifications à
                    la source.
                  </Text>
                </Box>
                <br />
                <br />
                <Box>
                  <Heading as="h2" textStyle="h4" id="en-academie" tabIndex="-1">
                    Vous travaillez en académie
                  </Heading>
                  {/*<br />*/}
                  {/*<Link color="bluefrance" textDecoration="underline">*/}
                  {/*  <strong>Accéder à vos actions expertes</strong>*/}
                  {/*</Link>*/}
                  <br />
                  <Text textStyle="rf-text">
                    <strong>Pour signaler une incohérence </strong>(UAI, Code diplôme, Code RNCP), vous pouvez vous
                    rapprocher de votre Carif-Oref afin qu'il vous aide à identifier l'origine du problème et vous
                    accompagne dans sa résolution auprès des instances (DEPP, BCN, France Compétences).{" "}
                  </Text>
                </Box>
              </Box>
              <Box flexDirection="column" mt={12}>
                <Heading as="h2" textStyle="h4" mb={3} id="journal" tabIndex="-1">
                  Journal des modifications
                </Heading>
                <br />
                <Box>
                  <Tabs variant="search">
                    <TabList bg="white" px={0}>
                      <Tab ml={[0, 0]}>Dernières modifications</Tab>
                      <Tab>A venir</Tab>
                    </TabList>
                    <TabPanels>
                      <TabPanel p={0}>
                        <Flex>
                          <Changelog
                            content={changelog}
                            order="desc"
                            showVersion={packageJson.version}
                            hideFilter={true}
                            embedded
                          />
                        </Flex>
                      </TabPanel>
                      <TabPanel p={0}>
                        <Flex>
                          <Changelog content={changelog} order="desc" nbVersion={1} hideFilter={true} embedded />
                        </Flex>
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                  <Button variant="secondary" as={NavLink} to="/changelog">
                    Voir le journal des modifications
                  </Button>
                </Box>
              </Box>
            </Box>
          </Flex>
        </Container>
      </Box>
    </Layout>
  );
};
