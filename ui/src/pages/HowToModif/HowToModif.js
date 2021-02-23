import React from "react";
import { Container, Box, Flex, Heading, Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@chakra-ui/react";
import Layout from "../layout/Layout";

import "./howToModif.css";
import { NavLink } from "react-router-dom";

const HowToModif = () => {
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
              <BreadcrumbLink>Guide de modification</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
        </Container>
      </Box>
      <Flex bg="secondaryBackground" className="howToModif">
        <Container mt={5} mb={12} maxW="xl">
          <Box>
            <Box className="mission-summary">
              <Heading as="h1" fontSize="beta" mb={8} mt={2}>
                Guide de modification
              </Heading>
              <h5>
                Pour modifier un champ , il vous suffit de cliquer sur le crayon, d’effectuer la modification souhaitée
                et de la valider ensuite.
                <br />
                <br />
                Seules les cellules avec un crayon sont modifiables.
              </h5>
              <br />
              <p>
                Les cellules ne pouvant pas être modifiées concernent des champs issus de tables et nomenclatures
                officielles ( Api Entreprise, tables de la BCN, niveau de formation ...) Si toutefois vous constatez des
                incohérences dans les données sur ces tables, merci de le signaler :
              </p>
              <ul>
                <li>
                  Au CFA qui se rapproche de l’
                  <a href="https://www.insee.fr/fr/information/1972062" target="_blank" rel="noreferrer noopener">
                    INSEE
                  </a>{" "}
                  pour les champs liés aux caractéristiques de l’établissement : raison sociale, SIRET, adresse postale,
                  ...
                </li>
                <li>
                  À la{" "}
                  <a href="http://infocentre.pleiade.education.fr/bcn/" target="_blank" rel="noreferrer noopener">
                    BCN
                  </a>{" "}
                  (Banque Centrale des Nomenclatures) pour les informations relatives aux codes diplomes, intitulés,
                  niveau
                </li>
                <li>A la DEPP pour les informations relatives aux UAI</li>
              </ul>

              <h5>Modifications unitaires :</h5>
              <p>
                Un champs de la base révèle une erreur et vous souhaitez la corriger : utiliser l’interface de
                modification en vous connectant avec votre identifiant et mot de passe.
              </p>
              <h5>Modifications en masse :</h5>
              <p>
                Vous remarquez la même erreur sur plusieurs champs, merci de le signaler à la mission apprentissage en
                envoyant un mail au contact mentionné en support. Ce mail doit contenir des informations suivantes : UAI
                établissement, numéro de siret, numéro de dossier Démarches Simplifiées s’il existe, une description de
                l’erreur rencontrée et une copie écran.
              </p>
              <h5>Modifications en cascade et impacts de vos modifications :</h5>
              <p>
                Une modification d’un champ dans l’onglet établissement (Numéro UAI par exemple) pourra entraîner un
                changement de statut des formations qui s’y rattachent, et ainsi les rendre éligibles.
              </p>
              <h5 className="underline">Liste des champs modifiables et des champs en cascade</h5>

              <strong>Sur l’onglet formation :</strong>
              <ul>
                <li>Numéro d’académie,</li>
                <li>SIRET CFA-OFA,</li>
                <li>SIRET Formateur,</li>
                <li>Code diplôme (si le champs est vide ou qu’il contient des informations incorrectes),</li>
                <li>Période, </li>
                <li>Capacité,</li>
                <li>UAI formation, </li>
                <li>Code postal.</li>
              </ul>
              <strong>Sur l’onglet établissements :</strong>
              <ul>
                <li>UAI, </li>
                <li>Nom commercial.</li>
              </ul>

              <p>
                Du <strong>SIREN</strong> on déduit : SIRET Siège Social, Raison Sociale, Code Entreprise, Date de
                création, Code NAF, Libellé code NAF, Adresse, Numéro de voie, Type de Voie, Nom de la voie, Complément
                d’adresse, Code postal, Localité, Code commune INSEE
                <br />
                <br />
                Du <strong>code diplôme</strong> on déduit : Intitulé du diplôme, Intitulé de la formation, niveau.
                <br />
                <br />
                Du <strong>code MEF</strong> on déduit : Durée de la formation et année de la formation, si la formation
                est déjà présente dans Parcoursup ou Affelnet.
                <br />
                <br />
                Du <strong>code RNCP</strong> on déduit : Code diplôme, Code ROME, Eligible apprentissage
                <br />
                <br />
                Du <strong>code commune insee</strong> on déduit numéro d’académie <br />
                <br />
                Du <strong>numéro d’académie</strong> on déduit le nom d’académie
              </p>
            </Box>
          </Box>
          <Box>
            <Box my={5}>
              <h5>Video de présentation</h5>
              <video controls width={800}>
                <source src="https://mna-bucket.s3.eu-west-3.amazonaws.com/pam-23042020.mp4" type="video/mp4" />
              </video>
            </Box>
          </Box>
        </Container>
      </Flex>
    </Layout>
  );
};

export default HowToModif;
