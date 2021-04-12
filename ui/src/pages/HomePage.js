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
            <span>Mise à jour du 12/04/2021 :</span>
            <br />
            <Text>Sur les formations :</Text>
            <Box px={[1, 4]}>
              <OrderedList px={0} mx={0} stylePosition="inside">
                <ListItem>
                  Intégration de 2 594 formations depuis le mois de mars grâce au travail de collecte des carif-oref
                </ListItem>
                <ListItem>Affichage du code MEF affelnet et information sur l'offre de formation Affelnet</ListItem>
                <ListItem>
                  Possibilité d'éditer l'information de l'offre de formation affelnet dans le module de publication
                </ListItem>
                <ListItem>
                  RNCP : identification des certificateurs et des siret habilités à former sur les titres.
                  <Text>
                    L’anomalie concernant les titres en apprentissages est désormais résolue. La mention « à publier »
                    est de nouveau appliquée aux formations à des titres Niv 5, et la mention “à publier (vérifier accès
                    direct post bac)” à des titres de Niv 6 proposées soit pour des titres dont le certificateur est le
                    Ministère du Travail, soit pour des titres ayant d'autres certificateurs quand le SIRET des
                    établissements est EXPLICITEMENT mentionné sur la fiche RNCP et habilité soit à FORMER, soit à
                    ORGANISER et à FORMER. Les formations à des titres en apprentissage proposées par des établissements
                    dont le SIRET ne figure pas sur la fiche RNCP du titre en question, ou qui sont simplement habilités
                    à ORGANISER sont affichées dans le catalogue en « non éligible ». Nous avons ajouté dans la fiche
                    formation la mention du certificateur, et la mention de l'habilitation délivrée. En effet, pour
                    mémoire : il appartient à l'établissement de se rapprocher du certificateur pour solliciter la mise
                    à jour éventuelle des données (validité, certificateur et/ou établissements partenaires, voie(s)
                    d’accès...) ou de se mettre à jour auprès de France Compétences :{" "}
                    <Link
                      as="span"
                      href="mailto:certificationprofessionnelle@francecompetences.fr"
                      textDecoration="underline"
                      color="blue.500"
                      fontWeight="bold"
                    >
                      certificationprofessionnelle@francecompetences.fr
                    </Link>
                    .
                  </Text>
                </ListItem>
              </OrderedList>
            </Box>
            <Text mt={2}>Sur les établissements :</Text>
            <Box px={[1, 4]}>
              <OrderedList px={0} mx={0} stylePosition="inside">
                <ListItem>Intégration de près de 800 UAI depuis le mois de mars, dont YY UAI Agri</ListItem>
              </OrderedList>
            </Box>
            <Text mt={2}>Autres fonctionnalités :</Text>
            <Box px={[1, 4]}>
              <OrderedList px={0} mx={0} stylePosition="inside">
                <ListItem>Modification de l'export</ListItem>
                <ListItem>Correction des codes postaux en erreur</ListItem>
                <ListItem>Correction des doublons</ListItem>
                <ListItem>Réduction du temps de passage des traitements nocturnes</ListItem>
              </OrderedList>
            </Box>
            <Text fontWeight={700} mt={3}>
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
            </Text>
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
