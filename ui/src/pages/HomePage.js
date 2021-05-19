import React, { useEffect, useState } from "react";
import Layout from "./layout/Layout";
import packageJson from "../../package.json";

import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { ExternalLinkLine } from "../theme/components/icons";

const endpointNewFront = `${process.env.REACT_APP_BASE_URL}/api`;
const endpointTCO =
  process.env.REACT_APP_ENDPOINT_TCO || "https://tables-correspondances.apprentissage.beta.gouv.fr/api";

export default () => {
  const [loading, setLoading] = useState(true);
  const [countEstablishments, setCountEstablishments] = useState(0);
  const [countFormations2021, setCountFormations2021] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function run() {
      try {
        const params = new window.URLSearchParams({
          query: JSON.stringify({ published: true }),
        });

        const countEtablissement = await _get(`${endpointTCO}/entity/etablissements/count?${params}`, false);
        const countFormations2021 = await _get(`${endpointNewFront}/entity/formations2021/count?${params}`, false);

        if (mounted) {
          setCountEstablishments(countEtablissement);
          setCountFormations2021(countFormations2021);
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

  return (
    <Layout>
      <Box w="100%" pt={[4, 8]} px={[1, 24]} color="#1E1E1E">
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
          <Breadcrumb>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink fontSize="omega">Accueil</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
        </Container>
      </Box>
      <Box w="100%" py={[1, 8]} px={[1, 24]} color="#1E1E1E">
        <Container maxW="xl">
          <Flex flexDirection={["column", "column", "column", "row"]}>
            <Box minW="250px">
              <Box bg="#F9F8F6" p={3}>
                <Heading textStyle="rf-text" fontWeight="700" p={2}>
                  SOMMAIRE
                </Heading>
                <List stylePosition="inside" px={3} textStyle="sm" fontWeight={400}>
                  <ListItem>
                    <strong>1.</strong> <Link href={"#mise-a-jour"}>Mise à jour des données</Link>
                  </ListItem>
                  <ListItem>
                    <strong>2.</strong> <Link href={"#organisme-de-formation"}>Vous êtes organisme de formation</Link>
                  </ListItem>
                  <ListItem>
                    <strong>3.</strong> <Link href={"#en-academie"}>Vous travaillez en académie</Link>
                  </ListItem>
                  <ListItem>
                    <strong>4.</strong> <Link href={"#journal"}>Journal des modifications</Link>
                  </ListItem>
                </List>
              </Box>
            </Box>
            <Box px={5} mt={[4, 4, 4, 0]}>
              <Heading as="h1" textStyle="h2">
                Le catalogue des offres de formations en apprentissage recense aujourd’hui :
              </Heading>
              <Box>
                <br /> &nbsp;
                {loading && <Text>chargement...</Text>}
                {!loading && (
                  <Flex flexDirection={["column", "column", "column", "row"]}>
                    <Box
                      as={NavLink}
                      to={"/recherche/formations-2021"}
                      bg="#F9F8F6"
                      p={5}
                      w={["100%", "340px"]}
                      h="100px"
                    >
                      <Heading as="h6" textStyle="h6">
                        {countFormations2021.toLocaleString("fr-FR")} formations
                      </Heading>
                      <Flex>
                        <Text flex="1" textStyle="sm">
                          en apprentissage
                        </Text>
                        <Box alignSelf="flex-end" fontSize="gamma" color={"bluefrance"}>
                          <FontAwesomeIcon icon={faArrowRight} />
                        </Box>
                      </Flex>
                    </Box>
                    <Box
                      as={NavLink}
                      to={"/recherche/etablissements"}
                      bg="#F9F8F6"
                      p={5}
                      w={["100%", "340px"]}
                      h="100px"
                      mx={[0, 0, 0, 5]}
                      mt={[5, 5, 5, 0]}
                    >
                      <Heading as="h6" textStyle="h6">
                        {countEstablishments.toLocaleString("fr-FR")} établissements
                      </Heading>
                      <Flex>
                        <Text flex="1" textStyle="sm">
                          de formation
                        </Text>
                        <Box alignSelf="flex-end" fontSize="gamma" color={"bluefrance"}>
                          <FontAwesomeIcon icon={faArrowRight} />
                        </Box>
                      </Flex>
                    </Box>
                  </Flex>
                )}
                <br />
                <br />
                <Box textStyle="rf-text">
                  <Heading as="h4" textStyle="h4" id="mise-a-jour">
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
                  <Heading as="h4" textStyle="h4" id="organisme-de-formation">
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
                      color="bluefrance"
                      isExternal
                    >
                      "référencer son offre de formation{" "}
                      <ExternalLinkLine w={"0.75rem"} h={"0.75rem"} color="bluefrance" />"
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
                  <Heading as="h4" textStyle="h4" id="en-academie">
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
                <Heading as="h4" textStyle="h4" mb={3} id="journal">
                  Journal des modifications
                </Heading>
                <br />
                <Box>
                  <Tabs variant="unstyled">
                    <TabList textStyle="sm" px={0} bg="white">
                      <Tab
                        bg="#EEF1F8"
                        color="#383838"
                        fontWeight="700"
                        _selected={{
                          bg: "white",
                          color: "bluefrance",
                          borderTop: "2px solid #000091",
                          borderLeft: "1px solid #CECECE",
                          borderRight: "1px solid #CECECE",
                          outline: "1px solid white",
                          zIndex: "1",
                        }}
                      >
                        Dernières modifications
                      </Tab>
                      <Tab
                        mx={2}
                        bg="#EEF1F8"
                        color="#383838"
                        fontWeight="700"
                        _selected={{
                          bg: "white",
                          color: "bluefrance",
                          borderTop: "2px solid #000091",
                          borderLeft: "1px solid #CECECE",
                          borderRight: "1px solid #CECECE",
                          outline: "1px solid white",
                          zIndex: "1",
                        }}
                      >
                        A venir
                      </Tab>
                    </TabList>
                    <TabPanels px={0}>
                      <TabPanel color="#383838" p={0} px={0} h="auto">
                        <Flex>
                          <Changelog
                            content={changelog}
                            order="desc"
                            showVersion={packageJson.version}
                            hideFilter={true}
                          />
                        </Flex>
                      </TabPanel>
                      <TabPanel color="#1E1E1E" p={0} px={0} h="auto">
                        <Flex>
                          <Changelog content={changelog} order="desc" nbVersion={1} hideFilter={true} />
                        </Flex>
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                  <Button
                    as={NavLink}
                    color="bluefrance"
                    to="/changelog"
                    textStyle="rf-text"
                    border="1px solid #000091"
                    bg="white"
                    fontWeight="400"
                  >
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
