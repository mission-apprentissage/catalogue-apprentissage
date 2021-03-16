import React from "react";
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Container,
  Flex,
  Heading,
  Link,
  ListItem,
  OrderedList,
  Text,
  UnorderedList,
} from "@chakra-ui/react";
import Layout from "../layout/Layout";
import { NavLink } from "react-router-dom";

const HowToSignal = () => {
  return (
    <Layout>
      <Box bg="secondaryBackground" w="100%" pt={[4, 8]} px={[1, 24]}>
        <Container maxW="xl">
          <Breadcrumb>
            <BreadcrumbItem>
              <BreadcrumbLink as={NavLink} to="/">
                Accueil
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>Guide de signalements</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
        </Container>
      </Box>
      <Flex bg="secondaryBackground">
        <Container mt={5} mb={12} maxW="xl">
          <Box>
            <Box>
              <Heading as="h1" fontSize="beta" mb={8} mt={2}>
                Guide de signalements
              </Heading>
              <UnorderedList spacing={8}>
                <ListItem>
                  <Heading as="h2" mb={2} fontSize="gamma">
                    Ma formation et ou mon OFA est absent du catalogue MNA
                  </Heading>
                  <OrderedList spacing={4}>
                    <ListItem>
                      <Text fontWeight="bold">Soit vous n’avez pas encore déclaré votre formation : </Text>
                      Si vous êtes un CFA et que vous ne retrouvez pas votre offre de formation en apprentissage dans ce
                      catalogue, merci de vous adresser au Carif-Oref de votre région pour déclarer vos formations en
                      apprentissage :{" "}
                      <Link href="https://reseau.intercariforef.org/referencer-son-offre-de-formation" isExternal>
                        https://reseau.intercariforef.org/referencer-son-offre-de-formation
                      </Link>
                      . La prise en compte dans le catalogue des modifications effectuées par le Carif-Oref est réalisée
                      de façon automatique quotidiennement avec un délai de 72 heures.
                    </ListItem>
                    <ListItem>
                      <Text fontWeight="bold">Soit vous avez bien déclaré votre formation à votre Carif : </Text>
                      Votre établissement ou certaines de vos formations ne figurent pas dans le catalogue des
                      formations en apprentissage. Merci de nous envoyer un mail (
                      <Link href="mailto:catalogue@apprentissage.beta.gouv.fr">
                        catalogue@apprentissage.beta.gouv.fr
                      </Link>
                      ) avec les informations suivantes :
                      <UnorderedList>
                        <ListItem>SIRET</ListItem>
                        <ListItem>RNCP et/ou le code diplôme si pb uniquement sur une formation</ListItem>
                        <ListItem>
                          la période d'inscription telle que mentionnée dans le catalogue Carif-Oref (exprimée en
                          AAAA-MM)
                        </ListItem>
                        <ListItem>le lieu de la formation (code commune INSEE ou à défaut code postal)</ListItem>
                        <ListItem>Mail de la personne signalant l’erreur</ListItem>
                      </UnorderedList>
                      Nous vous remercions pour votre signalement. Une investigation va être menée par le Réseau des
                      Carif-Oref et la Mission Apprentissage pour le traitement que nous espérons rapide de cette
                      anomalie. Nous reviendrons vers vous avec le mail que vous nous avez renseigné dès la résolution
                      de ce dysfonctionnement.
                    </ListItem>
                  </OrderedList>
                </ListItem>
                <ListItem>
                  <Heading as="h2" mb={2} fontSize="gamma">
                    Ma formation et/ou mon établissement est présente dans le catalogue MNA et je souhaite modifier des
                    données
                  </Heading>
                  <OrderedList spacing={4}>
                    <ListItem>
                      <Text fontWeight="bold">
                        Vous souhaitez modifier des caractéristiques de votre établissement :{" "}
                      </Text>
                      Si vous souhaitez modifier les caractéristiques de votre établissement : raison sociale, SIRET,
                      adresse postale, .. vous pouvez vous rapprocher de l’INSEE afin de réaliser les modifications à la
                      source (Direccte + Infogreffe). Pour tout autre incohérence (UAI, Code diplôme, Code RNCP, code
                      ROME associé,) rapprochez-vous de votre Carif-Oref, pour la modification de ces données dans les
                      bases sources (DEPP, BCN, France Compétences). Merci de préparer les éléments suivants :
                      <UnorderedList>
                        <ListItem>SIRET</ListItem>
                        <ListItem>RNCP et/ou le code diplôme si pb uniquement sur une formation</ListItem>
                        <ListItem>
                          la période d'inscription telle que mentionnée dans le catalogue (exprimée en AAAA-MM)
                        </ListItem>
                        <ListItem>le lieu de la formation (code commune INSEE ou à défaut code postal)</ListItem>
                        <ListItem>Mail de la personne signalant l’erreur.</ListItem>
                      </UnorderedList>
                    </ListItem>
                    <ListItem>
                      <Text fontWeight="bold">
                        Vous souhaitez modifier les informations figurant dans A propos (au sein de la page
                        établissements) :
                      </Text>
                      Votre CFA est un CFA Conventionné : merci de nous envoyer l'UAI de votre CFA afin que des
                      vérifications complémentaires puissent être réalisées. Votre CFA est déclaré en préfecture : Votre
                      siren est référencé au sein de la liste publique des organismes de formations disponible sous le
                      lien suivant :{" "}
                      <Link
                        href="https://www.data.gouv.fr/fr/datasets/liste-publique-des-organismes-de-formation-l-6351-7-1-du-code-du-travail/"
                        isExternal
                      >
                        https://www.data.gouv.fr/fr/datasets/liste-publique-des-organismes-de-formation-l-6351-7-1-du-code-du-travail/
                      </Link>
                      . Il doit être connu comme un CFA dans cette base de données. Petit truc : si vous téléchargez
                      cette base de données la mention se trouve sous la colonne E avec une recherche par SIREN. Si le
                      siren de l'établissement n'est pas connu comme un CFA, on considère qu'il n'est pas déclaré en
                      tant que tel en préfecture c'est pour cela que le "NON" apparaît. Pour corriger ce problème il
                      faut donc une action de votre part au niveau de la préfecture et ou Direccte afin qu'à ce numéro
                      de SIREN une activité CFA soit cochée "OUI" pour que le souci rencontré soit corrigé à la source.
                    </ListItem>
                  </OrderedList>
                </ListItem>
              </UnorderedList>
            </Box>
          </Box>
        </Container>
      </Flex>
    </Layout>
  );
};

export default HowToSignal;
