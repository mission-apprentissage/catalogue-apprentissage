import React, { useState, useEffect } from "react";
import { Page, Grid, Header } from "tabler-react";
import Layout from "./layout/Layout";
import { Box, Button } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";

import Changelog from "../common/components/Changelog/Changelog";
import changelog from "../CHANGELOG";

import { _get } from "../common/httpClient";

import "./homePage.css";

const endpointNewFront = process.env.REACT_APP_ENDPOINT_NEW_FRONT || "https://catalogue.apprentissage.beta.gouv.fr/api";
const endpointOldFront =
  process.env.REACT_APP_ENDPOINT_OLD_FRONT || "https://c7a5ujgw35.execute-api.eu-west-3.amazonaws.com/prod";

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
                  <span>La mise à jour du 06/01/2021 :</span>
                  <ol>
                    <li>
                      permet l'accès en modification du catalogue par les instructeurs (un flux des formations modifiées
                      est transmis au réseau des Carif-Oref afin que les modifications soient également reportées dans
                      les bases régionales).
                    </li>
                    <li>permet d'exporter les données en mode connecté</li>
                    <li>
                      met à jour les scripts d'éligibilité des établissements et des formations (info datadock à jour)
                    </li>
                    <li>affiche des tag 2020 ou 2021 sur les établissements</li>
                    <li>met en visibilité le guide réglementaire 2021 (hors connexion)</li>
                    <li>corrige les doublons envoyés par le réseau des Carif-Oref.</li>
                    <li>Le 31/01/2021 le catalogue des formations 2020 ne sera plus affiché dans cette interface.</li>
                    <li className="hightlight mt-3">
                      Si vous êtes un CFA et que vous ne retrouvez pas votre offre de formation en apprentissage dans ce
                      catalogue, merci de vous adresser au Carif-Oref de votre région pour déclarer vos formations en
                      apprentissage:{" "}
                      <a href="https://reseau.intercariforef.org/referencer-son-offre-de-formation">
                        https://reseau.intercariforef.org/referencer-son-offre-de-formation
                      </a>
                    </li>
                  </ol>
                  <br />
                  Les référencements et mises à jour effectuées dans les bases Offre des Carif-Oref sont répercutées
                  quotidiennement dans le catalogue Apprentissage (délai 72h entre modifications demandées et
                  publication). Si vous souhaitez modifier les caractéristiques de votre établissement : raison sociale,
                  SIRET, adresse postale, .. vous pouvez vous rapprocher de l’INSEE afin de réaliser les modifications à
                  la source. Pour toute autre incohérence (UAI, Code diplôme, Code RNCP) vous pouvez vous rapprocher de
                  votre Carif-Oref afin qu'il vous aide à identifier l'origine du problème et vous accompagne dans sa
                  résolution auprès des instances (DEPP, BCN, France Compétences).
                  <br />
                  <br />
                  La prochaine livraison concernera le module de validation des données.
                  <br />
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
