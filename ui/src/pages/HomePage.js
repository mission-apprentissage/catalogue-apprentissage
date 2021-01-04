import React, { useState, useEffect } from "react";
import { Page, Grid, Alert, Header } from "tabler-react";
import Layout from "./layout/Layout";
import { Box, Button } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";

import Changelog from "../common/components/Changelog/Changelog";
import changelog from "../CHANGELOG";

import { _get } from "../common/httpClient";

import "./homePage.css";

const ENV_NAME = "dev";
const endpointNewFront =
  ENV_NAME === "local" || ENV_NAME === "dev"
    ? "https://catalogue-recette.apprentissage.beta.gouv.fr/api"
    : "https://catalogue.apprentissage.beta.gouv.fr/api";

const endpointOldFront =
  ENV_NAME === "local" || ENV_NAME === "dev"
    ? "https://r7mayzn08d.execute-api.eu-west-3.amazonaws.com/dev"
    : "https://c7a5ujgw35.execute-api.eu-west-3.amazonaws.com/prod";

export default () => {
  const [loading, setLoading] = useState(true);
  const [countEstablishments, setCountEstablishments] = useState(0);
  const [countFormations, setCountFormations] = useState(0);
  const [countFormations2021, setCountFormations2021] = useState(0);

  useEffect(() => {
    async function run() {
      try {
        const params = new window.URLSearchParams({
          query: JSON.stringify({ published: true }),
        });

        const countEtablissement = await _get(`${endpointOldFront}/etablissements/count?${params}`, false);
        setCountEstablishments(countEtablissement.count);

        const countFormations = await _get(`${endpointNewFront}/entity/formations/count?${params}`, false);
        setCountFormations(countFormations);

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
      <Box bg="#E5EDEF" w="100%" py={[4, 8]} px={[8, 24]} color="#19414C">
        <Page>
          <Page.Main>
            <Page.Content>
              <Grid.Row>
                <Grid.Col width={12}>
                  <Header.H2>Catalogue des offres de formations en apprentissage.</Header.H2>
                  {/* <Alert type="warning">
                    <Header.H2>Accueil</Header.H2>
                    <p>Page d'accueil utilisateur.</p>
                  </Alert> */}
                </Grid.Col>
              </Grid.Row>
              <Grid.Row>
                <Grid.Col width={12} className="intro">
                  Le catalogue des offres de formation en apprentissage recense aujourd’hui près de
                  <br /> &nbsp;
                  {loading && <div>chargement...</div>}
                  {!loading && (
                    <strong>
                      {countFormations} formations 2020, {countFormations2021} formations 2021 et plus de{" "}
                      {countEstablishments} établissements !
                    </strong>
                  )}
                  <br />
                  <br />
                  <ol>
                    <li>
                      La mise à jour du 15/12 peut contenir des doublons au niveau des formations. Des travaux de
                      dédoublonnage sont en cours avec le réseau des Carif-Oref. Un message vous informera de la
                      correction des doublons.{" "}
                    </li>
                    <li>
                      Les établissements affichés sur le catalogue sont soit des établissements répertoriés en 2020 soit
                      des établissements répertoriés en 2021. Certains établissements sont présents sur les 2 années. A
                      titre d'information : - 1943 établissements uniquement 2020 - 1628 établissements 2020 & 2021 -
                      602 établissements uniquement 2021{" "}
                    </li>
                    <li>
                      Courant janvier 2021 le catalogue des formations 2020 ne sera plus affiché dans cette interface.
                    </li>
                    <li>
                      A l’attention des services académiques : L’indication « A charger dans Parcoursup » sera
                      développée de façon plus précise en fonction de chaque type de formation dans la prochaine version
                      du catalogue 2021. Pour analyser les demandes d’intégration, il faut tenir compte de{" "}
                      <a
                        href="https://drive.google.com/file/d/1xL3urYVOJBNkm4HO-iZcTPhieRWpQ7Sk/view?usp=sharing"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        la note de cadrage MESRI des conditions de référencement
                      </a>
                      . L’indication « à charger dans parcoursup » de la version 2020 ne correspond pas à une validation
                      automatique, elle doit être entendue comme « sous réserve des conditions de référencement ».
                    </li>
                    <li className="hightlight mt-3">
                      Si sur votre territoire, des offres de formations sont manquantes, veuillez contacter le
                      Carif-Oref de votre région afin de compléter ce catalogue: <br />
                      <br />
                      <a href="https://reseau.intercariforef.org/referencer-son-offre-de-formation">
                        https://reseau.intercariforef.org/referencer-son-offre-de-formation
                      </a>{" "}
                    </li>
                  </ol>
                  <br />
                  Vos retours utilisateurs sont les bienvenus afin d’améliorer l’usage de ce catalogue, vous pouvez
                  ainsi réaliser des modifications directement sur la base si vous repérez une coquille. Nous avons
                  basculé vers une version accessible en ligne qui vous permet de modifier directement certains champs,
                  d’avoir au fil de l’eau la visibilité sur les améliorations apportées au catalogue et éviter les
                  échanges de fichiers plats.
                  <br />
                </Grid.Col>
              </Grid.Row>
              <Grid.Row className="mt-5">
                <Grid.Col width={4}>
                  <Button bg="#007bff" color="#fff">
                    <NavLink className="nav-link" to="/recherche/formations-2021">
                      Consulter la liste des formations 2021
                    </NavLink>
                  </Button>
                </Grid.Col>
                <Grid.Col width={4}>
                  <Button bg="#007bff" color="#fff">
                    <NavLink className="nav-link" to="/recherche/formations-2020">
                      Consulter la liste des formations 2020
                    </NavLink>
                  </Button>
                </Grid.Col>
                <Grid.Col width={4}>
                  <Button bg="#007bff" color="#fff">
                    <NavLink className="nav-link" to="/recherche/etablissements">
                      Consulter la liste des établissements
                    </NavLink>
                  </Button>
                </Grid.Col>
              </Grid.Row>
              <Grid.Row className="mt-5 mb-3">
                <Grid.Col width={12}>
                  <Header.H3>Dernières modifications</Header.H3>
                </Grid.Col>
              </Grid.Row>
              <Grid.Row>
                <Grid.Col width={12}>
                  <Changelog content={changelog} order="desc" showVersion="last2" hideFilter={true} />
                </Grid.Col>
              </Grid.Row>
              <Grid.Row className="mt-1 mb-4">
                <Grid.Col width={12}>
                  <Button bg="#007bff" color="#fff">
                    <NavLink className="nav-link" to="/changelog">
                      Voir les précédentes versions
                    </NavLink>
                  </Button>
                </Grid.Col>
              </Grid.Row>
            </Page.Content>
          </Page.Main>
        </Page>
      </Box>
    </Layout>
  );
};
