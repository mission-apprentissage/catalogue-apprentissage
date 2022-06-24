import React, { useState, useEffect } from "react";
import { Box, Container, Heading, Tab, TabList, TabPanel, TabPanels, Tabs, Grid, GridItem } from "@chakra-ui/react";

import Layout from "../layout/Layout";
import { setTitle } from "../../common/utils/pageUtils";
import { Breadcrumb } from "../../common/components/Breadcrumb";
import { Card } from "../../common/components/Card";
import { _get } from "../../common/httpClient";
import { AFFELNET_STATUS } from "../../constants/status";

const CATALOGUE_API = `${process.env.REACT_APP_BASE_URL}/api`;

const Indicators = () => {
  const [formationCount, setFormationCount] = useState(undefined);
  const [formationAutomatiquementRapprochee, setFormationAutomatiquementRapprochee] = useState(undefined);
  const [formationAValider, setFormationAValider] = useState(undefined);
  const [formationTraitees, setFormationTraitees] = useState(undefined);
  const [formationEnAttenteDePublication, setFormationEnAttenteDePublication] = useState(undefined);
  const [formationPubliees, setFormationPubliees] = useState(undefined);
  const [formationNonPubliees, setFormationNonPubliees] = useState(undefined);

  useEffect(() => {
    (async () => {
      try {
        setFormationCount(await _get(`${CATALOGUE_API}/entity/formations/count?query=${JSON.stringify({})}`, false));
        // TODO
        // setFormationAutomatiquementRapprochee(
        //   await _get(`${CATALOGUE_API}/entity/formations/count?query=${JSON.stringify({})}`, false)
        // );
        setFormationAValider(
          await _get(
            `${CATALOGUE_API}/entity/formations/count?query=${JSON.stringify({
              affelnet_statut: AFFELNET_STATUS.A_PUBLIER_VALIDATION,
            })}`,
            false
          )
        );
        setFormationTraitees(
          await _get(
            `${CATALOGUE_API}/entity/formations/count?query=${JSON.stringify({
              affelnet_statut: {
                $in: [AFFELNET_STATUS.EN_ATTENTE, AFFELNET_STATUS.PUBLIE, AFFELNET_STATUS.NON_PUBLIE],
              },
            })}`,
            false
          )
        );
        setFormationEnAttenteDePublication(
          await _get(
            `${CATALOGUE_API}/entity/formations/count?query=${JSON.stringify({
              affelnet_statut: AFFELNET_STATUS.EN_ATTENTE,
            })}`,
            false
          )
        );
        setFormationPubliees(
          await _get(
            `${CATALOGUE_API}/entity/formations/count?query=${JSON.stringify({
              affelnet_statut: AFFELNET_STATUS.PUBLIE,
            })}`,
            false
          )
        );
        setFormationNonPubliees(
          await _get(
            `${CATALOGUE_API}/entity/formations/count?query=${JSON.stringify({
              affelnet_statut: AFFELNET_STATUS.NON_PUBLIE,
            })}`,
            false
          )
        );
      } catch (e) {
        console.error(e);
        setFormationCount(0);
        setFormationAutomatiquementRapprochee(0);
        setFormationAValider(0);
        setFormationTraitees(0);
        setFormationEnAttenteDePublication(0);
        setFormationPubliees(0);
        setFormationNonPubliees(0);
      }
    })();
  }, []);

  const cards = [
    {
      color: "yellow.100",
      title: <>{formationAutomatiquementRapprochee}</>,
      body: <>Formations rapprochées automatiquement</>,
      // TODO
      linkTo: `/recherche/formations?affelnet_statut=${encodeURIComponent(JSON.stringify([]))}`,
      isDisabled: true,
    },
    {
      color: "orange.100",
      title: <>{formationAValider}</>,
      body: <>Formations à valider avant publication</>,
      linkTo: `/recherche/formations?affelnet_statut=${encodeURIComponent(JSON.stringify([AFFELNET_STATUS.REJETE]))}`,
    },
    {
      color: "green.100",
      title: <>{formationTraitees}</>,
      body: (
        <>
          Formations traitées
          <br />
          <br />
          <br />
          <b>{formationEnAttenteDePublication}</b> en attente de publication
          <br />
          <b>{formationPubliees}</b> publiées
          <br />
          <b>{formationNonPubliees}</b> non publiées
        </>
      ),
      linkTo: `/recherche/formations?affelnet_statut=${encodeURIComponent(
        JSON.stringify([AFFELNET_STATUS.EN_ATTENTE, AFFELNET_STATUS.PUBLIE, AFFELNET_STATUS.NON_PUBLIE])
      )}`,
    },
  ];

  return (
    <Box my={4}>
      Sur une base de {formationCount} formations collectées par Carif-Oref :
      <br />
      <br />
      <Grid templateColumns="repeat(3, 1fr)" gap={4}>
        {cards?.map((card, index) => (
          <GridItem colSpan={[3, 3, 1]} key={index}>
            <Card {...card}></Card>
          </GridItem>
        ))}
      </Grid>
    </Box>
  );
};

export default () => {
  const tabs = [
    {
      title: "Suivi des actions",
      component: <Indicators />,
    },
    {
      title: "Statistiques",
      component: (
        <iframe
          src="https://catalogue.apprentissage.beta.gouv.fr/metabase/public/dashboard/50b6d168-d303-4f91-b898-945f6b9f11f4"
          frameBorder="0"
          style={{ height: "170vh", width: "100%" }}
          title={`Console de pilotage Affelnet - Statistiques`}
          allowtransparency={"true"}
        />
      ),
    },
  ];

  const title = "Consoles de pilotage Affelnet";
  setTitle(title);

  return (
    <Layout>
      <Box w="100%" pt={[4, 8]} px={[1, 1, 12, 24]}>
        <Container maxW="xl">
          <Breadcrumb
            pages={[
              { title: "Accueil", to: "/" },
              { title: "Mes actions expertes", to: "/mes-actions" },
              { title: title },
            ]}
          />

          <Heading textStyle="h2" color="grey.800" mt={5}>
            {title}
          </Heading>

          <Tabs variant={"search"} mt={5} isLazy>
            <TabList bg="white">
              {tabs.map(({ title }) => {
                return <Tab key={title}>{title}</Tab>;
              })}
            </TabList>
            <TabPanels>
              {tabs.map(({ component, title }) => {
                return <TabPanel key={title}>{component}</TabPanel>;
              })}
            </TabPanels>
          </Tabs>
        </Container>
      </Box>
    </Layout>
  );
};
