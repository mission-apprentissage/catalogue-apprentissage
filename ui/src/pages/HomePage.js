import React, { useState, useEffect } from "react";
import Layout from "./layout/Layout";
import {
  Box,
  Button,
  Container,
  Heading,
  Flex,
  ListItem,
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
      <Box bg="secondaryBackground" w="100%" pt={[4, 8]} px={[1, 24]}>
        <Container maxW="xl">
          <Breadcrumb>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>Accueil</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
        </Container>
      </Box>
      <Box bg="secondaryBackground" w="100%" py={[1, 8]} px={[1, 24]}>
        <Container maxW="xl">
          <Heading as="h1" fontSize="beta" mb={2}>
            Catalogue des offres de formations en apprentissage.
          </Heading>
          <Box>
            Le catalogue des offres de formation en apprentissage recense aujourd’hui près de
            <br /> &nbsp;
            {loading && <Text>chargement...</Text>}
            {!loading && (
              <strong>
                {countFormations2021} formations 2021 et plus de {countEstablishments} établissements !
              </strong>
            )}
            <br />
            <br />
            <span>La mise à jour du 03/03/2021 :</span>
            <Box px={[1, 4]}>
              <OrderedList px={0} mx={0} stylePosition="inside">
                <ListItem>
                  Modifications des filtres pour le périmètre Parcoursup : Modification du filtre à publier (soumis à
                  validation) qui devient pour les MC4 à publier (soumis à validation Recteur) et pour les titres de niv
                  6 et les DCG à publier (vérifier accès direct postbac).
                </ListItem>
                <ListItem>
                  Certaines MC de niveau 3 sont codées dans le catalogue comme étant de niveau 3 alors qu'en réalité se
                  sont des MC de niveau 4. Ces mentions complémentaires sont réintégrées dans le périmètre Parcoursup et
                  se retrouvent dans le filtre à publier (soumis à validation Recteur), une correction sur le niveau
                  affiché a été réalisée.
                </ListItem>
                <ListItem>
                  Les certifications qualités transmises au fil de l'eau sont intégrées une fois par semaine
                  (généralement le mardi avec visibilité le mercredi).
                </ListItem>
                <ListItem>Fonctionnalité de dépublication opérationnelle.</ListItem>
                <ListItem>Ajout dans la fiche formation de l'adresse du site de formation (champs modifiable)</ListItem>
                <ListItem>
                  Suite aux travaux de recette intégration Affelnet : identification et exclusion du périmètre Affelnet
                  des formations qui ne relèvent pas du niveau post 3ème dans le catalogue selon le dispositif de
                  formation du MEF.
                </ListItem>
                <ListItem>
                  Certaines MC de niveau 3 sont codées dans le catalogue comme étant de niveau 3 alors qu'en réalité se
                  sont des MC de niveau 4. Ces mentions complémentaires sont exclues du périmètre AFFELNET.
                </ListItem>

                <ListItem fontWeight={700} mt={3}>
                  Si vous êtes un CFA et que vous ne retrouvez pas votre offre de formation en apprentissage dans ce
                  catalogue, merci de vous adresser au Carif-Oref de votre région pour déclarer vos formations en
                  apprentissage:{" "}
                  <Link
                    href="https://reseau.intercariforef.org/referencer-son-offre-de-formation"
                    textDecoration="underline"
                    color="blue.500"
                    fontWeight="bold"
                    isExternal
                  >
                    https://reseau.intercariforef.org/referencer-son-offre-de-formation{" "}
                    <FontAwesomeIcon icon={faExternalLinkAlt} />
                  </Link>
                </ListItem>
              </OrderedList>
            </Box>
            <br />
            Les référencements et mises à jour effectuées dans les bases Offre des Carif-Oref sont répercutées
            quotidiennement dans le catalogue Apprentissage (délai 72h entre modifications demandées et publication). Si
            vous souhaitez modifier les caractéristiques de votre établissement : raison sociale, SIRET, adresse
            postale, .. vous pouvez vous rapprocher de l’INSEE afin de réaliser les modifications à la source. Pour
            toute autre incohérence (UAI, Code diplôme, Code RNCP) vous pouvez vous rapprocher de votre Carif-Oref afin
            qu'il vous aide à identifier l'origine du problème et vous accompagne dans sa résolution auprès des
            instances (DEPP, BCN, France Compétences).
            <br />
            <br />
            Vos retours utilisateurs sont les bienvenus afin d’améliorer l’usage de ce catalogue, vous pouvez ainsi
            réaliser des modifications directement sur la base si vous repérez une coquille. Nous avons basculé vers une
            version accessible en ligne qui vous permet de modifier directement certains champs, d’avoir au fil de l’eau
            la visibilité sur les améliorations apportées au catalogue et éviter les échanges de fichiers plats.
            <br />
          </Box>
          <Flex mt={5} flexDirection={["column", "row"]} justifyContent="space-around">
            <Button as={NavLink} bg="#007bff" color="#fff" to="/recherche/formations-2021">
              Consulter la liste des formations 2021
            </Button>
            <Button as={NavLink} bg="#007bff" color="#fff" to="/recherche/etablissements" mt={[2, 0]}>
              Consulter la liste des établissements
            </Button>
          </Flex>

          <Center flexDirection="column" mt={12}>
            <Heading as="h3" mb={3} fontSize="beta">
              Dernières modifications
            </Heading>
            <Flex>
              <Changelog content={changelog} order="desc" showVersion="last2" hideFilter={true} />
            </Flex>
            <Flex mt={1} mb={4} flexDirection={["column", "row"]} justifyContent={["space-around", "flex-start"]}>
              <Button as={NavLink} bg="#007bff" color="#fff" to="/changelog">
                Voir les précédentes versions
              </Button>
            </Flex>
          </Center>
        </Container>
      </Box>
    </Layout>
  );
};
