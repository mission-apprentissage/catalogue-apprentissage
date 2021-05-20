import React from "react";
import Layout from "../layout/Layout";
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
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

import { NavLink, useLocation } from "react-router-dom";
import { AddFill, SubtractLine } from "../../theme/components/icons";

const HowToReglement = () => {
  const { hash } = useLocation();
  const defaultIndex = hash === "#conditions-etablissement" ? [0] : [];

  return (
    <Layout>
      <Box w="100%" pt={[4, 8]} px={[1, 24]} color="#1E1E1E">
        <Container maxW="xl">
          <Breadcrumb>
            <BreadcrumbItem>
              <BreadcrumbLink fontSize="omega" as={NavLink} to="/">
                Accueil
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink fontSize="omega">Guide réglementaire</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
        </Container>
      </Box>
      <Flex w="100%" py={[1, 8]} px={[1, 24]} color="#1E1E1E" className="howToReglement">
        <Container mt={5} mb={12} maxW="xl">
          <Box>
            <Box className="mission-summary">
              <Heading as="h1" fontSize="beta" mb={8} mt={2}>
                Guide réglementaire
              </Heading>
              <Heading as="h3" fontSize="gamma">
                Conditions d’intégration de l’offre de formation en Apprentissage sur Parcoursup et Affelnet
              </Heading>
              <h4>
                (
                <Link
                  href="https://resana.numerique.gouv.fr/public/information/consulterAccessUrl?cle_url=1016905377VD4HZ1NfAj4HalM1CmRXdwY4DjMKKwNqDGdQbQFgXW4COA88B2MDZVFk"
                  color="bluefrance"
                  isExternal
                >
                  cf note MESRI décembre 2020
                </Link>
                )
              </h4>
              <br />
              <p>
                Avant de référencer un organisme et son offre de formation en apprentissage, les services académiques
                vérifient leur éligibilité.
                <br />
                <strong>Vous êtes un organisme de formation :</strong> assurez-vous que les données relatives à votre
                offre et organisme de formation sont à jour dans les différentes{" "}
                <Link href="#informations-complementaires" color="bluefrance">
                  bases de données
                </Link>
                .
              </p>
              <br />
              <Text as="span" color="#7d4e5b">
                En brun, les traitements automatisés pour faciliter les travaux de référencement
              </Text>
              <div>
                <Heading as="h4" fontSize="epsilon" mb={4} mt={8}>
                  Conditions d’éligibilité de l’organisme et de l’offre de formation
                </Heading>
                <Accordion allowMultiple defaultIndex={defaultIndex} bg="#F9F8F6" mb={6}>
                  <AccordionItem border="none" id="conditions-etablissement">
                    {({ isExpanded }) => (
                      <>
                        <AccordionButton>
                          <Box flex="1" textAlign="left">
                            1. Condition concernant l’établissement lui-même : la certification qualité
                          </Box>
                          {isExpanded ? (
                            <SubtractLine fontSize="12px" color="bluefrance" />
                          ) : (
                            <AddFill fontSize="12px" color="bluefrance" />
                          )}
                        </AccordionButton>
                        <AccordionPanel pb={4}>
                          <UnorderedList>
                            <ListItem>
                              <Text as="span" fontWeight="bold" textDecoration="underline">
                                Établissements précédemment sous convention régionale dits CFA historiques
                              </Text>
                              <UnorderedList styleType="circle">
                                <ListItem>
                                  <Text as="span" color="#7d4e5b">
                                    Recherche UAI dans fichier DEPP 950
                                  </Text>
                                </ListItem>
                                <ListItem>
                                  <Text as="span" color="#7d4e5b">
                                    => traitement automatisé
                                  </Text>
                                </ListItem>
                              </UnorderedList>
                            </ListItem>
                            <ListItem>
                              <Text as="span" fontWeight="bold" textDecoration="underline">
                                Établissements délivrant des formations en apprentissage hors ‘CFA historiques’
                              </Text>
                              <br />
                              <br />
                              Deux situations peuvent se présenter :
                              <OrderedList>
                                <ListItem>
                                  les établissements sont déclarés en préfecture <strong>ET</strong> attestent de leur
                                  qualité au sens du décret du 30 juin 2015 émanant de l’organisme certificateur et
                                  référencé sur le site internet du CNEFOP.
                                  <UnorderedList styleType="square">
                                    <ListItem>
                                      <Text as="span" color="#7d4e5b">
                                        Recherche via le Siret dans fichier DGEFP
                                      </Text>
                                    </ListItem>
                                    <ListItem>
                                      <Text as="span" color="#7d4e5b">
                                        + Recherche via le Siret dans DATADOCK mention “Datadocké”
                                      </Text>
                                    </ListItem>
                                    <ListItem>
                                      <Text as="span" color="#7d4e5b">
                                        => traitement automatisé
                                      </Text>
                                    </ListItem>
                                  </UnorderedList>
                                </ListItem>
                                <ListItem>
                                  les établissements sont déclarés en préfecture <strong>ET</strong> attestent de leur
                                  qualité par une certification Qualiopi demandée directement dans la liste des
                                  certificateurs habilités
                                  <UnorderedList styleType="square">
                                    <ListItem>cette vérification est réalisée par les référents en académie</ListItem>
                                    <ListItem>
                                      <strong>=> vérification à réaliser</strong>
                                    </ListItem>
                                  </UnorderedList>
                                </ListItem>
                              </OrderedList>
                            </ListItem>
                          </UnorderedList>
                          <br />
                          <br />
                          <Text as="span" color="#7d4e5b">
                            Si l’une de ces conditions n’est pas remplie, l’établissement figure dans le catalogue
                            non-éligible
                          </Text>
                        </AccordionPanel>
                      </>
                    )}
                  </AccordionItem>
                </Accordion>

                <Accordion allowMultiple bg="#F9F8F6" mb={6}>
                  <AccordionItem border="none">
                    {({ isExpanded }) => (
                      <>
                        <AccordionButton>
                          <Box flex="1" textAlign="left">
                            2. Conditions complémentaires concernant la formation délivrée par un établissement éligible
                            :
                          </Box>
                          {isExpanded ? (
                            <SubtractLine fontSize="12px" color="bluefrance" />
                          ) : (
                            <AddFill fontSize="12px" color="bluefrance" />
                          )}
                        </AccordionButton>
                        <AccordionPanel pb={4}>
                          Dès lors que l’établissement est habilité à délivrer le titre ou diplôme, que celui-ci est
                          réalisé par voie d’apprentissage et qu’il s’agit d’une formation du 1er cycle de
                          l’enseignement supérieur, la formation est éligible au référencement sur Parcoursup.
                          <UnorderedList>
                            <ListItem>
                              <Text as="span" fontWeight="bold" textDecoration="underline">
                                Toutes les formations en apprentissage doivent être enregistrées au RNCP,
                              </Text>
                              qu’il s’agisse ou non d’un titre ou diplôme délivré au nom de l’Etat. Dès lors que
                              l’établissement est habilité à délivrer le titre ou diplôme et que celui-ci est réalisé
                              par voie d’apprentissage.
                              <UnorderedList styleType="circle">
                                <ListItem>
                                  <Text as="span" color="#7d4e5b">
                                    => Recherche données de France Compétences
                                  </Text>
                                </ListItem>
                              </UnorderedList>
                            </ListItem>
                          </UnorderedList>
                          Il revient aux CFA de se mettre à jour auprès de France Compétences :
                          certificationprofessionnelle@francecompetences.fr
                        </AccordionPanel>
                      </>
                    )}
                  </AccordionItem>
                </Accordion>

                <Heading as="h4" fontSize="epsilon" mb={4} mt={8}>
                  Conditions d’intégration sur les plateformes Parcoursup et Affelnet
                </Heading>
                <Accordion allowMultiple bg="#F9F8F6" mb={6}>
                  <AccordionItem border="none">
                    {({ isExpanded }) => (
                      <>
                        <AccordionButton>
                          <Box flex="1" textAlign="left">
                            <Text as="span" fontWeight="bold" textDecoration="underline">
                              Doivent intégrer
                            </Text>{" "}
                            la plateforme Parcoursup{" "}
                          </Box>
                          {isExpanded ? (
                            <SubtractLine fontSize="12px" color="bluefrance" />
                          ) : (
                            <AddFill fontSize="12px" color="bluefrance" />
                          )}
                        </AccordionButton>
                        <AccordionPanel pb={4}>
                          <UnorderedList>
                            <ListItem>
                              <Text as="span" fontWeight="bold" textDecoration="underline">
                                Diplôme national ou titre ou diplôme délivré au nom de l’Etat :{" "}
                              </Text>
                              selon les conditions spécifiques prévues par la réglementation propre à la formation
                              <UnorderedList styleType="circle">
                                <ListItem>
                                  Diplôme national ou délivré au nom de l’Etat :{" "}
                                  <strong>
                                    sous réserve de vérifications à effectuer en lien avec le Ministère de
                                    l’Enseignement Supérieur, de la Recherche et de l’Innovation.
                                  </strong>
                                </ListItem>
                                <ListItem>
                                  Les BTS ou BTSA sont automatiquement référencés et ne nécessitent aucun traitement.
                                </ListItem>
                              </UnorderedList>
                            </ListItem>
                          </UnorderedList>
                        </AccordionPanel>
                      </>
                    )}
                  </AccordionItem>
                </Accordion>

                <Accordion allowMultiple bg="#F9F8F6" mb={6}>
                  <AccordionItem border="none">
                    {({ isExpanded }) => (
                      <>
                        <AccordionButton>
                          <Box flex="1" textAlign="left">
                            <Text as="span" fontWeight="bold" textDecoration="underline">
                              Peuvent intégrer
                            </Text>{" "}
                            la plateforme Parcoursup{" "}
                          </Box>
                          {isExpanded ? (
                            <SubtractLine fontSize="12px" color="bluefrance" />
                          ) : (
                            <AddFill fontSize="12px" color="bluefrance" />
                          )}
                        </AccordionButton>
                        <AccordionPanel pb={4}>
                          <UnorderedList>
                            <ListItem>
                              <Text as="span" fontWeight="bold" textDecoration="underline">
                                Titre ou diplôme non délivré au nom de l’Etat :
                              </Text>
                              Toutes les formations enregistrées au RNCP et pour lesquelles l'établissement est soit
                              l’autorité responsable de la certification, soit partenaire de l’autorité certificatrice
                              et que le titre est réalisé par voie d’apprentissage.
                              <UnorderedList styleType="circle">
                                <ListItem>
                                  <Text as="span" color="#7d4e5b">
                                    Recherche données de France Compétences
                                  </Text>
                                </ListItem>
                                <ListItem>
                                  <Text as="span" color="#7d4e5b">
                                    => traitement automatisé
                                  </Text>
                                </ListItem>
                              </UnorderedList>
                            </ListItem>
                            <ListItem>
                              <Text as="span" fontWeight="bold" textDecoration="underline">
                                Mention Complémentaire de niveau 4 :
                              </Text>
                              sous réserve d'une autorisation du recteur.
                            </ListItem>
                          </UnorderedList>
                        </AccordionPanel>
                      </>
                    )}
                  </AccordionItem>
                </Accordion>

                <Accordion allowMultiple bg="#F9F8F6" mb={6}>
                  <AccordionItem border="none">
                    {({ isExpanded }) => (
                      <>
                        <AccordionButton>
                          <Box flex="1" textAlign="left">
                            <Text as="span" fontWeight="bold" textDecoration="underline">
                              Ne peuvent intégrer
                            </Text>{" "}
                            les plateformes Parcoursup et Affelnet les formations ne remplissant pas les conditions
                            ci-dessus.
                          </Box>
                          {isExpanded ? (
                            <SubtractLine fontSize="12px" color="bluefrance" />
                          ) : (
                            <AddFill fontSize="12px" color="bluefrance" />
                          )}
                        </AccordionButton>
                        <AccordionPanel pb={4}>
                          <UnorderedList>
                            <ListItem>
                              <Text as="span" color="#7d4e5b">
                                Traitement automatiques réalisés ci-dessus
                              </Text>
                            </ListItem>
                          </UnorderedList>
                        </AccordionPanel>
                      </>
                    )}
                  </AccordionItem>
                </Accordion>
              </div>

              <Heading as="h4" fontSize="epsilon" mb={4} mt={8} id="informations-complementaires">
                Informations complémentaires
              </Heading>
              <Accordion allowMultiple bg="#F9F8F6" mb={6}>
                <AccordionItem border="none">
                  {({ isExpanded }) => (
                    <>
                      <AccordionButton>
                        <Box flex="1" textAlign="left">
                          Bases de données et mises à jour des informations relatives aux CFA et aux formations
                        </Box>
                        {isExpanded ? (
                          <SubtractLine fontSize="12px" color="bluefrance" />
                        ) : (
                          <AddFill fontSize="12px" color="bluefrance" />
                        )}
                      </AccordionButton>
                      <AccordionPanel pb={4}>
                        <strong>Concernant l'établissement de formation :</strong>
                        <Box mt={2} mb={5}>
                          <UnorderedList>
                            <ListItem>
                              la <strong>Base Centrale des Etablissements (BCE)</strong>, consultable sur{" "}
                              <Link
                                href="https://www.education.gouv.fr/acce_public/index.php"
                                color="bluefrance"
                                isExternal
                              >
                                l’application de consultation et cartographie des établissements (ACCE)
                              </Link>
                              ;
                              <UnorderedList styleType="circle">
                                <ListItem>
                                  l’établissement peut solliciter la mise à jour de ses données (dénomination
                                  officielle, immatriculation UAI,...) via le formulaire « Contact » du site ACCE ;
                                </ListItem>
                              </UnorderedList>
                            </ListItem>
                            <ListItem>
                              <Link href="http://www.cnefop.gouv.fr/qualite/" color="bluefrance" isExternal>
                                le site internet du CNEFOP
                              </Link>{" "}
                              pour consulter la liste des organismes certificateurs au sens au Décret du 30 juin 2015
                            </ListItem>
                            <ListItem>
                              <Link
                                href="https://travail-emploi.gouv.fr/formation-professionnelle/acteurs-cadre-et-qualite-de-la-formation-professionnelle/liste-organismes-certificateurs"
                                color="bluefrance"
                                isExternal
                              >
                                le site internet du Ministère du Travail
                              </Link>{" "}
                              pour la liste des organismes certificateurs qualité Qualiopi
                            </ListItem>
                            <ListItem>
                              <Link href="https://www.insee.fr/fr/information/1972062" color="bluefrance" isExternal>
                                le site de l’INSEE
                              </Link>
                              , permettant d’accéder aux données administratives à partir du Siret de l'établissement
                              <UnorderedList styleType="circle">
                                <ListItem>
                                  l’établissement peut y signaler des modifications (changement d'adresse, de statut,
                                  d'activité, de raison sociale, ouverture ou fermeture d'un établissement...) afin
                                  qu’elles soient mises à jour.
                                </ListItem>
                              </UnorderedList>
                            </ListItem>
                          </UnorderedList>
                        </Box>
                        <strong>Concernant la formation :</strong>
                        <Box mt={2} mb={5}>
                          <UnorderedList>
                            <ListItem>
                              <Link
                                href="https://certificationprofessionnelle.fr/recherche"
                                color="bluefrance"
                                isExternal
                              >
                                le Répertoire national des certifications professionnelles (RNCP)
                              </Link>{" "}
                              listant les certificateurs référencés pour chacune des certifications enregistrées au RNCP
                              (hors Répertoire Spécifique)
                              <UnorderedList styleType="circle">
                                <ListItem>
                                  il appartient à l'établissement de se rapprocher du certificateur pour solliciter la
                                  mise à jour éventuelle des données (validité, certificateur et/ou établissements
                                  partenaires, voie(s) d’accès...) ou de se mettre à jour auprès de France Compétences :{" "}
                                  <Link href="mailto:certificationprofessionnelle@francecompetences.fr">
                                    certificationprofessionnelle@francecompetences.fr
                                  </Link>
                                  .
                                </ListItem>
                              </UnorderedList>
                            </ListItem>
                          </UnorderedList>
                        </Box>
                      </AccordionPanel>
                    </>
                  )}
                </AccordionItem>
              </Accordion>
            </Box>
          </Box>
        </Container>
      </Flex>
    </Layout>
  );
};

export default HowToReglement;
