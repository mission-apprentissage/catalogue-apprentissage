import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Heading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Grid,
  GridItem,
  Flex,
} from "@chakra-ui/react";
import IframeResizer from "iframe-resizer-react";

import Layout from "../layout/Layout";
import { setTitle } from "../../common/utils/pageUtils";
import { Breadcrumb } from "../../common/components/Breadcrumb";
import { Card } from "../../common/components/Card";
import { _get } from "../../common/httpClient";
import useAuth from "../../common/hooks/useAuth";
import { PARCOURSUP_STATUS } from "../../constants/status";
import { AcademiesSelect } from "../ReglesPerimetre/components/AcademiesSelect";

const CATALOGUE_API = `${process.env.REACT_APP_BASE_URL}/api`;

const Indicators = () => {
  const [user] = useAuth();
  const [formationCount, setFormationCount] = useState(undefined);
  const [formationAValider, setFormationAValider] = useState(undefined);
  const [formationRejetees, setFormationRejetees] = useState(undefined);
  const [formationTraitees, setFormationTraitees] = useState(undefined);
  const [formationEnAttenteDePublication, setFormationEnAttenteDePublication] = useState(undefined);
  const [formationPubliees, setFormationPubliees] = useState(undefined);
  const [formationNonPubliees, setFormationNonPubliees] = useState(undefined);
  const [currentAcademie, setCurrentAcademie] = useState(undefined);

  const onAcademieChange = useCallback(
    (academie) => (academie !== -1 ? setCurrentAcademie(academie) : setCurrentAcademie(undefined)),
    [setCurrentAcademie]
  );

  useEffect(() => {
    const defaultQuery = { published: true };
    let isCancelled = false;

    (async () => {
      try {
        const formationCount = await _get(
          `${CATALOGUE_API}/entity/formations/count?query=${JSON.stringify({
            ...defaultQuery,
            ...(currentAcademie ? { num_academie: currentAcademie } : {}),
          })}`,
          false
        );

        if (!isCancelled) setFormationCount(formationCount);

        const formationAValiderCount = await _get(
          `${CATALOGUE_API}/entity/formations/count?query=${JSON.stringify({
            ...defaultQuery,
            ...(currentAcademie ? { num_academie: currentAcademie } : {}),
            parcoursup_statut: {
              $in: [
                PARCOURSUP_STATUS.A_PUBLIER,
                PARCOURSUP_STATUS.A_PUBLIER_HABILITATION,
                PARCOURSUP_STATUS.A_PUBLIER_VERIFIER_POSTBAC,
                PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR,
              ],
            },
          })}`,
          false
        );

        if (!isCancelled) setFormationAValider(formationAValiderCount);

        const formationTraitees = await _get(
          `${CATALOGUE_API}/entity/formations/count?query=${JSON.stringify({
            ...defaultQuery,
            ...(currentAcademie ? { num_academie: currentAcademie } : {}),
            parcoursup_statut: {
              $in: [PARCOURSUP_STATUS.EN_ATTENTE, PARCOURSUP_STATUS.PUBLIE, PARCOURSUP_STATUS.NON_PUBLIE],
            },
          })}`,
          false
        );

        if (!isCancelled) setFormationTraitees(formationTraitees);

        const formationRejetees = await _get(
          `${CATALOGUE_API}/entity/formations/count?query=${JSON.stringify({
            ...defaultQuery,
            ...(currentAcademie ? { num_academie: currentAcademie } : {}),
            parcoursup_statut: PARCOURSUP_STATUS.REJETE,
          })}`,
          false
        );

        if (!isCancelled) setFormationRejetees(formationRejetees);

        const formationEnAttenteDePublication = await _get(
          `${CATALOGUE_API}/entity/formations/count?query=${JSON.stringify({
            ...defaultQuery,
            ...(currentAcademie ? { num_academie: currentAcademie } : {}),
            parcoursup_statut: PARCOURSUP_STATUS.EN_ATTENTE,
          })}`,
          false
        );

        if (!isCancelled) setFormationEnAttenteDePublication(formationEnAttenteDePublication);

        const formationPubliees = await _get(
          `${CATALOGUE_API}/entity/formations/count?query=${JSON.stringify({
            ...defaultQuery,
            ...(currentAcademie ? { num_academie: currentAcademie } : {}),
            parcoursup_statut: PARCOURSUP_STATUS.PUBLIE,
          })}`,
          false
        );

        if (!isCancelled) setFormationPubliees(formationPubliees);

        const formationNonPubliees = await _get(
          `${CATALOGUE_API}/entity/formations/count?query=${JSON.stringify({
            ...defaultQuery,
            ...(currentAcademie ? { num_academie: currentAcademie } : {}),
            parcoursup_statut: PARCOURSUP_STATUS.NON_PUBLIE,
          })}`,
          false
        );

        if (!isCancelled) setFormationNonPubliees(formationNonPubliees);
      } catch (e) {
        console.error(e);
        if (!isCancelled) {
          setFormationCount(0);
          setFormationAValider(0);
          setFormationTraitees(0);
          setFormationRejetees(0);
          setFormationEnAttenteDePublication(0);
          setFormationPubliees(0);
          setFormationNonPubliees(0);
        }
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [user, currentAcademie, onAcademieChange]);

  useEffect(() => {
    const [firstAcademy] = user?.academie?.split(",")?.map((academieStr) => Number(academieStr)) ?? [];
    onAcademieChange(firstAcademy);
  }, [user, onAcademieChange]);

  const cards = [
    {
      color: "orange.100",
      title: <>{formationAValider}</>,
      body: <>Formations à valider avant publication</>,
      linkTo: `/recherche/formations?parcoursup_statut=${encodeURIComponent(
        JSON.stringify([
          PARCOURSUP_STATUS.A_PUBLIER,
          PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR,
          PARCOURSUP_STATUS.A_PUBLIER_HABILITATION,
          PARCOURSUP_STATUS.A_PUBLIER_VERIFIER_POSTBAC,
        ])
      )}`,
    },
    {
      color: "red.100",
      title: <>{formationRejetees}</>,
      body: <>Formations en erreur (de type métier)</>,
      linkTo: `/recherche/formations?parcoursup_statut=${encodeURIComponent(
        JSON.stringify([PARCOURSUP_STATUS.REJETE])
      )}`,
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
      linkTo: `/recherche/formations?parcoursup_statut=${encodeURIComponent(
        JSON.stringify([PARCOURSUP_STATUS.EN_ATTENTE, PARCOURSUP_STATUS.PUBLIE, PARCOURSUP_STATUS.NON_PUBLIE])
      )}`,
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
        <>
          <IframeResizer
            src="https://catalogue.apprentissage.education.gouv.fr/metabase/public/dashboard/4e36e6e9-df1d-4444-bb76-cce85e662f47#bordered=false"
            seamless
            style={{ width: "100%", border: 0 }}
            title={`Console de pilotage Parcoursup - Statistiques`}
            allowtransparency={"true"}
          />

          <IframeResizer
            src="https://catalogue.apprentissage.education.gouv.fr/metabase/public/dashboard/2e46824f-18e9-42e3-a906-153f5d152d6e#bordered=false"
            seamless
            style={{ width: "100%", border: 0 }}
            title={`Console de pilotage Parcoursup - Comparaison entre campagnes`}
            allowtransparency={"true"}
          />
        </>
      ),
    },
  ];

  const title = "Console de pilotage Parcoursup";
  setTitle(title);

  return (
    <Layout>
      <Box w="100%" pt={[4, 8]} px={[1, 1, 12, 24]}>
        <Container maxW="xl">
          <Breadcrumb
            pages={[
              { title: "Accueil", to: "/" },
              { title: "Consoles de pilotage", to: "/consoles-pilotage" },
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
