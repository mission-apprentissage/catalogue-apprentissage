import React from "react";
import { Container, Box } from "@chakra-ui/react";
import Layout from "../layout/Layout";

import "./howToSignal.css";

const HowToSignal = () => {
  return (
    <Layout>
      <div className="page howToSignal">
        <Container className="mt-5" maxW="xl">
          <Box>
            <Box className="mission-summary">
              <h1 className="mt-3 mb-3">Guide de signalements</h1>
              <br />
              <p>[Contenu]</p>
              <ul>
    <Header.H2>Ma formation et ou mon OFA est absent du catalogue MNA.</Header.H2>
    <span>Soit vous n’avez pas encore déclaré votre formation :</span>
                <ol>
                    <li>
                      “Si vous êtes un CFA et que vous ne retrouvez pas votre offre de formation en apprentissage dans ce catalogue, merci de vous adresser au Carif-Oref de votre région pour déclarer vos formations en apprentissage :
https://reseau.intercariforef.org/referencer-son-offre-de-formation
La prise en compte dans le catalogue des modifications effectuées par le Carif-Oref est réalisée de façon automatique quotidiennement avec un délai de 72 heures.”  
                    </li>
     <span>Soit vous avez bien déclaré votre formation à votre Carif :</span>
                <ol>
                    <li>
                      “Votre établissement ou certaines de vos formations ne figurent pas dans le catalogue des formations en apprentissage”
Merci de nous envoyer un mail avec les informations suivantes  : 
SIRET 
RNCP et/ou le code diplôme si pb uniquement sur une formation
la période d'inscription telle que mentionnée dans le catalogue Carif-Oref (exprimée en AAAA-MM)
le lieu de la formation (code commune INSEE ou à défaut code postal) 
Mail de la personne signalant l’erreur 
Nous vous remercions pour votre signalement. Une investigation va être menée par le Réseau des Carif-Oref et la Mission Apprentissage pour le traitement que nous espérons rapide de cette anomalie.
Nous reviendrons vers vous avec le mail que vous nous avez renseigné dès la résolution de ce dysfonctionnement"  
                    </li>
  <Header.H2>Ma formation et/ou mon établissement est présente dans le catalogue MNA et je souhaite modifier des données.</Header.H2>
  <span>Vous souhaitez modifier des caractéristiques de votre établissement :</span> 
  <ol>
                    <li>
                      “Si vous souhaitez modifier les caractéristiques de votre établissement : raison sociale, SIRET, adresse postale, .. vous pouvez vous rapprocher de l’INSEE afin de réaliser les modifications à la source (Direccte + Infogreffe).”
“Pour tout autre incohérence (UAI, Code diplôme, Code RNCP, code ROME associé,) rapprochez-vous de votre Carif-Oref, pour la modification de ces données dans les bases sources (DEPP, BCN, France Compétences).
Merci de préparer les éléments suivants : 
SIRET
RNCP et/ou le code diplôme si pb uniquement sur une formation
la période d'inscription telle que mentionnée dans le catalogue (exprimée en AAAA-MM)
le lieu de la formation (code commune INSEE ou à défaut code postal) 
Mail de la personne signalant l’erreur “
                  </li>    
  <span>Vous souhaitez modifier les informations figurant dans A propos (au sein de la page établissements) :</span> 
  <ol>
                    <li>
                      Votre CFA est un CFA Conventionné : merci de nous envoyer l'UAI de votre CFA afin que des vérifications complémentaires puissent être réalisées.
 Votre CFA est déclaré en préfecture :  Votre siren est référencé au sein de la liste publique des organismes de formations disponible sous le lien suivant : https://www.data.gouv.fr/fr/datasets/liste-publique-des-organismes-de-formation-l-6351-7-1-du-code-du-travail/ .  Il doit être connu comme un CFA dans cette base de données.  
Petit truc : si vous téléchargez cette base de données la mention se trouve sous la colonne E avec une recherche par SIREN. 
Si le siren de l'établissement n'est pas connu comme un CFA, on considère qu'il n'est pas déclaré en tant que tel en préfecture c'est pour cela que le "NON" apparaît. 
Pour corriger ce problème il faut donc une action de votre part au niveau de la préfecture et ou Direccte afin qu'à ce numéro de SIREN une activité CFA soit cochée "OUI" pour que le souci rencontré soit corrigé à la source. 
                  </li>   
  </ul>
            </Box>
          </Box>
        </Container>
      </div>
    </Layout>
  );
};

export default HowToSignal;
