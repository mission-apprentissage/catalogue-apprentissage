import React, { useState, useEffect } from "react";
import Layout from "./layout/Layout";
import {
  Box,
  Button,
  Container,
  Heading,
  Flex,
  ListItem,
  Spacer,
  List,
  OrderedList,
  Link,
  Text,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Center,
} from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import Changelog from "../common/components/Changelog/Changelog";
import changelog from "../CHANGELOG";
import { _get } from "../common/httpClient";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { faInfoCircle, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { Code } from "@chakra-ui/react";
import { Grid, GridItem } from "@chakra-ui/react";

const endpointNewFront = `${process.env.REACT_APP_BASE_URL}/api`;
const endpointTCO =
  process.env.REACT_APP_ENDPOINT_TCO || "https://tables-correspondances.apprentissage.beta.gouv.fr/api";

export default () => {
  const [loading, setLoading] = useState(true);
  const [countEstablishments, setCountEstablishments] = useState(0);
  const [countFormations2021, setCountFormations2021] = useState(0);
  let mounted = true;

  useEffect(() => {
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
          <Box bg="#F8F8F8" color={"#D07C75"} borderLeft="4px" role="none" p={5}>
            <Flex>
              <Box>
                <FontAwesomeIcon icon={faInfoCircle} color={"#D07C75"} />
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
                    Les référencements et mises à jour effectuées dans les bases “Offre des Carif-Oref” sont répercutées
                    <br />
                    quotidiennement dans le “Catalogue des offres de formations en apprentissage” (délai 72h entre
                    modifications
                    <br /> demandées et publication).
                  </Text>
                </Box>
                <br /> <br />
                <Box>
                  <Heading as="h4" textStyle="h4">
                    Vous êtes organisme de formation / établissement de formation ?
                  </Heading>
                  <br />
                  <Text textStyle="rf-text">
                    Pour ajouter une offre de formation au catalogue, merci de la déclarer auprès du Carif-Oref de votre
                    région en <br />
                    allant sur la page “référencer son offre de formation” .
                  </Text>
                  <br />
                  <Text textStyle="rf-text">
                    Pour modifier des caractéristiques de votre établissement (raison sociale, SIRET, adresse postale,
                    etc.), vous pouvez <br />
                    vous rapprocher de l’INSEE afin de réaliser les modifications à la source.
                  </Text>
                </Box>
                <br />
                <br />
                <Box>
                  <Heading as="h4" textStyle="h4">
                    Vous travaillez en académie
                  </Heading>
                  <br />
                  <Link color="bluefrance">Accéder à vos actions expertes</Link>
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
                <Box borderTop="1px solid" borderColor="bluefrance" width="230px">
                  <Text color="bluefrance">Dernières modifications</Text>
                </Box>
                <br />
                <Flex>
                  <Changelog content={changelog} order="desc" showVersion="last2" hideFilter={true} />
                </Flex>
                <Flex mt={1} mb={4} flexDirection={["column", "row"]} justifyContent={["space-around", "flex-start"]}>
                  <Button as={NavLink} color="bluefrance" to="/changelog">
                    Voir le journal des modifications
                  </Button>
                </Flex>
              </Box>
            </Box>
          </Grid>
        </Container>
      </Box>
    </Layout>
  );
};
