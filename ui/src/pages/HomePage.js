import React, { useState, useEffect } from "react";
import Layout from "./layout/Layout";
import packageJson from "../../package.json";

import {
  Box,
  Button,
  Container,
  Heading,
  Flex,
  ListItem,
  List,
  Link,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Text,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  // eslint-disable-next-line no-unused-vars
  Center,
} from "@chakra-ui/react";

import { NavLink } from "react-router-dom";
import Changelog from "../common/components/Changelog/Changelog";
import changelog from "../CHANGELOG";
import { _get } from "../common/httpClient";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// eslint-disable-next-line no-unused-vars
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { faInfoCircle, faArrowRight } from "@fortawesome/free-solid-svg-icons";
// eslint-disable-next-line no-unused-vars
import { Code } from "@chakra-ui/react";
// eslint-disable-next-line no-unused-vars
import { Grid, GridItem } from "@chakra-ui/react";
import { ExternalLinkLine } from "../theme/components/icons/External-link-line";
import { InformationLine } from "../theme/components/icons/Information-line";

const endpointNewFront = process.env.REACT_APP_ENDPOINT_NEW_FRONT || "https://catalogue.apprentissage.beta.gouv.fr/api";
const endpointTCO =
  process.env.REACT_APP_ENDPOINT_TCO || "https://tables-correspondances.apprentissage.beta.gouv.fr/api";

export default () => {
  const [loading, setLoading] = useState(true);
  const [countEstablishments, setCountEstablishments] = useState(0);
  const [countFormations2021, setCountFormations2021] = useState(0);

  useEffect(() => {
    async function run() {
      try {
        const params = new window.URLSearchParams({
          query: JSON.stringify({ published: true }),
        });

        const countEtablissement = await _get(`${endpointTCO}/entity/etablissements/count?${params}`, false);
        setCountEstablishments(countEtablissement);

        const countFormations2021 = await _get(`${endpointNewFront}/entity/formations2021/count?${params}`, false);
        setCountFormations2021(countFormations2021);

        setLoading(false);
      } catch (e) {
        console.log(e);
      }
    }
    run();
  }, []);

  return (
    <Layout>
      <Box w="100%" pt={[4, 8]} px={[1, 24]} color="#1E1E1E">
        <Container maxW="xl">
          <Box bg="#F8F8F8" color="pinksoft.500" borderLeft="4px" role="none" p={5}>
            <Flex>
              <Box>
                <InformationLine />
              </Box>
              <Text color="black" textStyle="sm" px={2}>
                Grâce à vos retours une anomalie a été détectée dans le code qui testait la présence d'un SIRET sur un
                titre. Un correctif va être effectué très prochainement.
                <br />
                <Text fontWeight="700" as="span">
                  En attendant, les formations à des titres en apprentissage sont toutes affichées en « hors périmètre
                  ». Nous vous informerons dès que le correctif sera appliqué.
                </Text>
              </Text>
            </Flex>
          </Box>
          <Breadcrumb py={5}>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink fontSize="omega">Accueil</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
        </Container>
      </Box>
      <Box w="100%" py={[1, 8]} px={[1, 24]} color="#1E1E1E">
        <Container maxW="xl">
          <Grid templateColumns={["auto", "auto", "auto", "250px auto"]} w="100%">
            <Box>
              <Box bg="#F9F8F6" p={3}>
                <Heading textStyle="rf-text" fontWeight="700" p={2}>
                  SOMMAIRE
                </Heading>
                <List stylePosition="inside" px={3} textStyle="sm" fontWeight={400}>
                  <ListItem>
                    <strong>1.</strong> Mise à jour des données
                  </ListItem>
                  <ListItem>
                    <strong>2.</strong> Vous êtes organisme de formation
                  </ListItem>
                  <ListItem>
                    <strong>3.</strong> Vous travaillez en académie
                  </ListItem>
                  <ListItem>
                    <strong>4.</strong> Journal des modifications
                  </ListItem>
                </List>
              </Box>
            </Box>
            <Box px={5}>
              <Heading as="h1" textStyle="h2">
                Le catalogue des offres de formations en apprentissage recense aujourd’hui :
              </Heading>
              <Box>
                <br /> &nbsp;
                {loading && <Text>chargement...</Text>}
                {!loading && (
                  <Flex flexDirection={["column", "column", "column", "row"]}>
                    <Box bg="#F9F8F6" p={5} w="340px" h="100px">
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
                    <Box bg="#F9F8F6" p={5} w="340px" h="100px" mx={[0, 0, 0, 5]} mt={[5, 5, 5, 0]}>
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
                    {/* <Box bg="tomato" p="4" mx={5} w="400px" h="50px">
                      <Text fontWeight="extrabold" fontSize="20px">
                        {countEstablishments} établissements
                      </Text>
                    </Box>{" "} */}
                  </Flex>
                )}
                <br />
                <br />
                <Box textStyle="rf-text">
                  <Heading as="h4" textStyle="h4">
                    Mise à jour des données
                  </Heading>
                  <br />
                  <Text textStyle="rf-text">
                    Les référencements et mises à jour effectués dans les bases “Offre des Carif-Oref” de chaque région
                    sont répercutés <br /> quotidiennement dans le “Catalogue des offres de formations en apprentissage”
                    (délai de 72h entre modifications <br /> demandées au Carif-Oref et publication dans le Catalogue).
                  </Text>
                </Box>
                <br /> <br />
                <Box>
                  <Heading as="h4" textStyle="h4">
                    Vous êtes organisme de formation
                  </Heading>
                  <br />
                  <Text textStyle="rf-text">
                    <strong>
                      Pour ajouter une offre de formation au Catalogue de l’offre de formation en apprentissage
                    </strong>
                    , merci de la déclarer <br /> auprès du Carif-Oref de votre région en allant sur la page “
                    <Link color="bluefrance" textDecoration="underline">
                      référencer son offre de formation
                    </Link>
                    ”
                    <ExternalLinkLine w={"0.75rem"} h={"0.75rem"} color="bluefrance" />
                  </Text>
                  <br />
                  <Text textStyle="rf-text">
                    <strong> Pour modifier les caractéristiques de votre organisme </strong> (raison sociale, SIRET,
                    adresse postale, etc.), vous pouvez vous <br /> rapprocher de l’INSEE afin de réaliser les
                    modifications à la source.
                  </Text>
                </Box>
                <br />
                <br />
                <Box>
                  <Heading as="h4" textStyle="h4">
                    Vous travaillez en académie
                  </Heading>
                  <br />
                  <Link color="bluefrance" textDecoration="underline">
                    <strong>Accéder à vos actions expertes</strong>
                  </Link>
                  <br />
                  <Text textStyle="rf-text">
                    <strong>Pour signaler une incohérence </strong>(UAI, Code diplôme, Code RNCP), vous pouvez vous
                    rapprocher de votre Carif-Oref <br />
                    afin qu'il vous aide à identifier l'origine du problème et vous accompagne dans sa résolution auprès
                    des instances <br /> (DEPP, BCN, France Compétences).{" "}
                  </Text>
                </Box>
              </Box>
              <Box flexDirection="column" mt={12}>
                <Heading as="h4" textStyle="h4" mb={3}>
                  Journal des modifications
                </Heading>
                <br />
                <Box>
                  <Tabs variant="unstyled">
                    <TabList textStyle="sm" px={0} bg="white">
                      <Tab
                        fontWeight="700"
                        color="bluefrance"
                        _selected={{
                          borderTop: "2px solid #000091",
                          borderLeft: "1px solid #CECECE",
                          borderRight: "1px solid #CECECE",
                          outline: "1px solid white",
                          zIndex: "1",
                        }}
                      >
                        Dernières modifications
                      </Tab>
                      <Tab bg="#EEF1F8" mx={2} color="#383838" fontWeight="700" textStyle="sm">
                        A venir
                      </Tab>
                    </TabList>
                    <TabPanels px={0}>
                      <TabPanel color="#383838" p={0} px={0} h={[1000, 1000, 800, 550]}>
                        <Flex>
                          <Changelog
                            content={changelog}
                            order="desc"
                            showVersion={packageJson.version}
                            hideFilter={true}
                          />
                        </Flex>
                      </TabPanel>
                      <TabPanel color="#1E1E1E">
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
          </Grid>
        </Container>
      </Box>
    </Layout>
  );
};
