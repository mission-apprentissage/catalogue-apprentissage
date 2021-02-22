import React from "react";
import Layout from "../layout/Layout";
import {
  Container,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Heading,
  Flex,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@chakra-ui/react";

import "./howToReglement.css";
import { NavLink, useLocation } from "react-router-dom";

const HowToReglement = () => {
  const { hash } = useLocation();
  const defaultIndex = hash === "#conditions-etablissement" ? [0] : [];

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
              <BreadcrumbLink>Guide réglementaire</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
        </Container>
      </Box>
      <Flex bg="secondaryBackground" className="howToReglement">
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
                <a
                  href="https://resana.numerique.gouv.fr/public/information/consulterAccessUrl?cle_url=1016905377VD4HZ1NfAj4HalM1CmRXdwY4DjMKKwNqDGdQbQFgXW4COA88B2MDZVFk"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  (cf note MESRI décembre 2020)
                </a>
              </h4>
              <br />
              <p>
                <strong>
                  Avant de référencer l’établissement et son offre de formation en apprentissage, les services
                  académiques vérifient leur éligibilité.
                </strong>{" "}
                L’établissement doit en amont d’une demande d’intégration s’assurer que les informations le concernant
                sont à jour.
              </p>
              <br />
              <span className="purple">
                En violet, les traitements automatisés pour faciliter les travaux de référencement :
              </span>
              <br />
              <br />
              <div>
                <Accordion allowMultiple defaultIndex={defaultIndex} bg="white" mb={6}>
                  <AccordionItem id="conditions-etablissement">
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        1. Condition concernant l’établissement lui-même : la certification qualité
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4}>
                      <ul>
                        <li>
                          <strong className="underline">
                            Établissements précédemment sous convention régionale dits CFA historiques
                          </strong>
                          <ul>
                            <li className="purple">Recherche UAI dans fichier DEPP 950</li>
                            <li className="purple">=> traitement automatisé</li>
                          </ul>
                        </li>
                        <li>
                          <strong className="underline">
                            Établissements délivrant des formations en apprentissage hors ‘CFA historiques’
                          </strong>
                          <br />
                          <br />
                          Deux situations peuvent se présenter :
                          <ol>
                            <li>
                              les établissements sont déclarés en préfecture <strong>ET</strong> attestent de leur
                              qualité au sens du décret du 30 juin 2015 émanant de l’organisme certificateur et
                              référencé sur le site internet du CNEFOP.
                              <ul>
                                <li className="purple">Recherche via le Siret dans fichier DGEFP</li>
                                <li className="purple">+ Recherche via le Siret dans DATADOCK mention “Datadocké”</li>
                                <li className="purple">=> traitement automatisé</li>
                              </ul>
                            </li>
                            <li>
                              les établissements sont déclarés en préfecture <strong>ET</strong> attestent de leur
                              qualité par une certification Qualiopi demandée directement dans la liste des
                              certificateurs habilités
                              <ul>
                                <li>cette vérification est réalisée par les référents en académie</li>
                                <li>
                                  <strong>=> vérification à réaliser</strong>
                                </li>
                              </ul>
                            </li>
                          </ol>
                        </li>
                      </ul>
                      <br />
                      <br />
                      <span className="purple">
                        Si l’une de ces conditions n’est pas remplie, l’établissement figure dans le catalogue
                        non-éligible
                      </span>
                    </AccordionPanel>
                  </AccordionItem>
                </Accordion>

                <Accordion allowMultiple bg="white" mb={6}>
                  <AccordionItem>
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        2. Conditions complémentaires concernant la formation délivrée par un établissement éligible :
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4}>
                      Dès lors que l’établissement est habilité à délivrer le titre ou diplôme, que celui-ci est réalisé
                      par voie d’apprentissage et qu’il s’agit d’une formation du 1er cycle de l’enseignement supérieur,
                      la formation est éligible au référencement sur Parcoursup.
                      <ul>
                        <li>
                          <strong className="underline">
                            Toutes les formations en apprentissage doivent être enregistrées au RNCP,
                          </strong>
                          qu’il s’agisse ou non d’un titre ou diplôme délivré au nom de l’Etat. Dès lors que
                          l’établissement est habilité à délivrer le titre ou diplôme et que celui-ci est réalisé par
                          voie d’apprentissage.
                          <ul>
                            <li className="purple">=> Recherche données de France Compétences</li>
                          </ul>
                        </li>
                      </ul>
                      Il revient aux CFA de se mettre à jour auprès de France Compétences :
                      certificationprofessionnelle@francecompetences.fr
                    </AccordionPanel>
                  </AccordionItem>
                </Accordion>

                <Accordion allowMultiple bg="white" mb={6}>
                  <AccordionItem>
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        <span className="underline">Doivent intégrer</span> la plateforme Parcoursup{" "}
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4}>
                      <ul>
                        <li>
                          <strong className="underline">
                            Diplôme national ou titre ou diplôme délivré au nom de l’Etat :{" "}
                          </strong>
                          selon les conditions spécifiques prévues par la réglementation propre à la formation
                          <ul>
                            <li>
                              Diplôme national ou délivré au nom de l’Etat :{" "}
                              <strong>
                                sous réserve de vérifications à effectuer en lien avec le Ministère de l’Enseignement
                                Supérieur, de la Recherche et de l’Innovation.
                              </strong>
                            </li>
                            <li>Les BTS ou BTSA sont automatiquement référencés et ne nécessitent aucun traitement.</li>
                          </ul>
                        </li>
                      </ul>
                    </AccordionPanel>
                  </AccordionItem>
                </Accordion>

                <Accordion allowMultiple bg="white" mb={6}>
                  <AccordionItem>
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        <span className="underline">Peuvent intégrer</span> la plateforme Parcoursup{" "}
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4}>
                      <ul>
                        <li>
                          <strong className="underline">Titre ou diplôme non délivré au nom de l’Etat :</strong>
                          Toutes les formations enregistrées au RNCP et pour lesquelles l'établissement est soit
                          l’autorité responsable de la certification, soit partenaire de l’autorité certificatrice et
                          que le titre est réalisé par voie d’apprentissage.
                          <ul>
                            <li className="purple">Recherche données de France Compétences</li>
                            <li className="purple">=> traitement automatisé</li>
                          </ul>
                        </li>
                        <li>
                          <strong className="underline">Mention Complémentaire de niveau 4 :</strong>
                          sous réserve d'une autorisation du recteur.
                        </li>
                      </ul>
                    </AccordionPanel>
                  </AccordionItem>
                </Accordion>

                <Accordion allowMultiple bg="white" mb={6}>
                  <AccordionItem>
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        <span className="underline">Ne peuvent intégrer</span> les plateformes Parcoursup et Affelnet
                        les formations ne remplissant pas les conditions ci-dessus.
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4}>
                      <ul>
                        <li className="purple">Traitement automatiques réalisés ci-dessus</li>
                      </ul>
                    </AccordionPanel>
                  </AccordionItem>
                </Accordion>
              </div>

              <Accordion allowMultiple bg="white" mb={6}>
                <AccordionItem>
                  <AccordionButton>
                    <Box flex="1" textAlign="left">
                      3. Bases de données et mises à jour des informations relatives aux CFA et aux formations
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={4}>
                    <strong>Concernant l'établissement de formation :</strong>
                    <Box mt={2} mb={5}>
                      <ul>
                        <li>
                          la <strong>Base Centrale des Etablissements (BCE)</strong>, consultable sur{" "}
                          <a
                            href="https://www.education.gouv.fr/acce_public/index.php"
                            target="_blank"
                            rel="noreferrer noopener"
                          >
                            l’application de consultation et cartographie des établissements (ACCE)
                          </a>
                          ;
                          <ul>
                            <li>
                              l’établissement peut solliciter la mise à jour de ses données (dénomination officielle,
                              immatriculation UAI,...) via le formulaire « Contact » du site ACCE ;
                            </li>
                          </ul>
                        </li>
                        <li>
                          <a href="http://www.cnefop.gouv.fr/qualite/" target="_blank" rel="noreferrer noopener">
                            le site internet du CNEFOP
                          </a>{" "}
                          pour consulter la liste des organismes certificateurs au sens au Décret du 30 juin 2015
                        </li>
                        <li>
                          <a
                            href="https://travail-emploi.gouv.fr/formation-professionnelle/acteurs-cadre-et-qualite-de-la-formation-professionnelle/liste-organismes-certificateurs"
                            target="_blank"
                            rel="noreferrer noopener"
                          >
                            le site internet du Ministère du Travail
                          </a>{" "}
                          pour la liste des organismes certificateurs qualité Qualiopi
                        </li>
                        <li>
                          <a
                            href="https://www.insee.fr/fr/information/1972062"
                            target="_blank"
                            rel="noreferrer noopener"
                          >
                            le site de l’INSEE
                          </a>
                          , permettant d’accéder aux données administratives à partir du Siret de l'établissement
                          <ul>
                            <li>
                              l’établissement peut y signaler des modifications (changement d'adresse, de statut,
                              d'activité, de raison sociale, ouverture ou fermeture d'un établissement...) afin qu’elles
                              soient mises à jour.
                            </li>
                          </ul>
                        </li>
                      </ul>
                    </Box>
                    <strong>Concernant la formation :</strong>
                    <Box mt={2} mb={5}>
                      <ul>
                        <li>
                          <a
                            href="https://certificationprofessionnelle.fr/recherche"
                            target="_blank"
                            rel="noreferrer noopener"
                          >
                            le Répertoire national des certifications professionnelles (RNCP)
                          </a>{" "}
                          listant les certificateurs référencés pour chacune des certifications enregistrées au RNCP
                          (hors Répertoire Spécifique)
                          <ul>
                            <li>
                              il appartient à l'établissement de se rapprocher du certificateur pour solliciter la mise
                              à jour éventuelle des données (validité, certificateur et/ou établissements partenaires,
                              voie(s) d’accès...) ou de se mettre à jour auprès de France Compétences :
                              certificationprofessionnelle@francecompetences.fr.
                            </li>
                          </ul>
                        </li>
                      </ul>
                    </Box>
                  </AccordionPanel>
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
