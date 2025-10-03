import React, { useState, useEffect, useCallback } from "react";
import { Box, Container, Text, Tab, TabList, TabPanel, TabPanels, Tabs, Grid, GridItem, Flex } from "@chakra-ui/react";
import IframeResizer from "iframe-resizer-react";

import Layout from "../layout/Layout";
import { setTitle } from "../../common/utils/pageUtils";
import { Breadcrumb } from "../../common/components/Breadcrumb";
import { Card } from "../../common/components/Card";
import { _get } from "../../common/httpClient";
import useAuth from "../../common/hooks/useAuth";
import { AFFELNET_STATUS } from "../../constants/status";
import { AcademiesSelect } from "../ReglesPerimetre/components/AcademiesSelect";

const CATALOGUE_API = `${process.env.REACT_APP_BASE_URL}/api`;

const Indicators = () => {
  const [user] = useAuth();
  const [formationCount, setFormationCount] = useState(undefined);
  const [formationPubliees, setFormationPubliees] = useState(undefined);
  const [formationAValider, setFormationAValider] = useState(undefined);
  const [formationEnAttenteDePublication, setFormationEnAttenteDePublication] = useState(undefined);
  const [formationNonPubliees, setFormationNonPubliees] = useState(undefined);
  const [currentAcademie, setCurrentAcademie] = useState(undefined);

  const onAcademieChange = useCallback(
    (academie) => (academie !== -1 ? setCurrentAcademie(academie) : setCurrentAcademie(undefined)),
    [setCurrentAcademie]
  );

  useEffect(() => {
    const defaultQuery = { published: true };
    const abortController = new AbortController();

    (async () => {
      try {
        const formationCount = await _get(
          `${CATALOGUE_API}/entity/formations/count?query=${JSON.stringify({
            ...defaultQuery,
            ...(currentAcademie ? { num_academie: currentAcademie } : {}),
          })}`,
          { signal: abortController.signal }
        );

        if (!abortController.signal.aborted) setFormationCount(formationCount);

        const formationPubliees = await _get(
          `${CATALOGUE_API}/entity/formations/count?query=${JSON.stringify({
            ...defaultQuery,
            ...(currentAcademie ? { num_academie: currentAcademie } : {}),
            affelnet_statut: AFFELNET_STATUS.PUBLIE,
          })}`,
          { signal: abortController.signal }
        );

        if (!abortController.signal.aborted) setFormationPubliees(formationPubliees);

        const formationAValider = await _get(
          `${CATALOGUE_API}/entity/formations/count?query=${JSON.stringify({
            ...defaultQuery,
            ...(currentAcademie ? { num_academie: currentAcademie } : {}),
            affelnet_statut: {
              $in: [AFFELNET_STATUS.A_PUBLIER_VALIDATION, AFFELNET_STATUS.A_PUBLIER],
            },
          })}`,
          { signal: abortController.signal }
        );

        if (!abortController.signal.aborted) setFormationAValider(formationAValider);

        const formationEnAttenteDePublication = await _get(
          `${CATALOGUE_API}/entity/formations/count?query=${JSON.stringify({
            ...defaultQuery,
            ...(currentAcademie ? { num_academie: currentAcademie } : {}),
            affelnet_statut: AFFELNET_STATUS.PRET_POUR_INTEGRATION,
          })}`,
          { signal: abortController.signal }
        );

        if (!abortController.signal.aborted) setFormationEnAttenteDePublication(formationEnAttenteDePublication);

        const formationNonPubliees = await _get(
          `${CATALOGUE_API}/entity/formations/count?query=${JSON.stringify({
            ...defaultQuery,
            ...(currentAcademie ? { num_academie: currentAcademie } : {}),
            affelnet_statut: AFFELNET_STATUS.NON_PUBLIE,
          })}`,
          { signal: abortController.signal }
        );

        if (!abortController.signal.aborted) setFormationNonPubliees(formationNonPubliees);
      } catch (e) {
        if (!abortController.signal.aborted) {
          console.error(e);
        }

        setFormationCount(0);
        setFormationPubliees(0);
        setFormationAValider(0);
        setFormationEnAttenteDePublication(0);
        setFormationNonPubliees(0);
      }
    })();

    return () => {
      abortController.abort();
    };
  }, [user, currentAcademie]);

  useEffect(() => {
    const [firstAcademy] = user?.academie?.split(",")?.map((academieStr) => Number(academieStr)) ?? [];
    onAcademieChange(firstAcademy);
  }, [user, onAcademieChange]);

  const cards = [
    {
      color: "orange.100",
      title: <>{formationAValider}</>,
      body: <>Formations à valider avant publication</>,
      linkTo: `/recherche/formations?affelnet_statut=${encodeURIComponent(
        JSON.stringify([AFFELNET_STATUS.A_PUBLIER, AFFELNET_STATUS.A_PUBLIER_VALIDATION])
      )}`,
    },
    {
      color: "yellow.100",
      title: <>{formationEnAttenteDePublication}</>,
      body: <>Formations prêt pour intégration</>,
      linkTo: `/recherche/formations?affelnet_statut=${encodeURIComponent(
        JSON.stringify([AFFELNET_STATUS.PRET_POUR_INTEGRATION])
      )}`,
    },

    {
      color: "red.100",
      title: <>{formationNonPubliees}</>,
      body: <>Formations non publiées</>,
      linkTo: `/recherche/formations?affelnet_statut=${encodeURIComponent(
        JSON.stringify([AFFELNET_STATUS.NON_PUBLIE])
      )}`,
    },
    {
      color: "green.100",
      title: <>{formationPubliees}</>,
      body: <>Formations publiées</>,
      linkTo: `/recherche/formations?affelnet_statut=${encodeURIComponent(JSON.stringify([AFFELNET_STATUS.PUBLIE]))}`,
    },
  ];

  return (
    <Box my={4}>
      Sur une base de {formationCount} formations collectées par Carif-Oref{" "}
      <Flex display="inline-flex">
        <AcademiesSelect id={"academie"} name={"academie"} w={"auto"} onChange={onAcademieChange} user={user} />
      </Flex>{" "}
      :
      <br />
      <br />
      <Grid templateColumns="repeat(4, 1fr)" gap={4}>
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
        <>
          <IframeResizer
            src="https://catalogue.apprentissage.education.gouv.fr/metabase/public/dashboard/50b6d168-d303-4f91-b898-945f6b9f11f4#bordered=false&titled=false"
            seamless
            style={{ width: "100%", border: 0 }}
            allowtransparency={"true"}
            autoResize
          />
        </>
      ),
    },
  ];

  const title = "Console de pilotage Affelnet";
  setTitle(title);

  return (
    <Layout>
      <Box w="100%" pt={[4, 8]} px={[1, 1, 12, 24]}>
        <Container maxW="7xl">
          <Breadcrumb
            pages={[
              { title: "Accueil", to: "/" },
              { title: "Consoles de pilotage", to: "/consoles-pilotage" },
              { title: title },
            ]}
          />

          <Text textStyle="h2" color="grey.800" mt={5}>
            {title}
          </Text>

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
