import React from "react";
import { Box, Container, Heading, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";

import Layout from "../layout/Layout";
import { setTitle } from "../../common/utils/pageUtils";
import { Breadcrumb } from "../../common/components/Breadcrumb";

export default () => {
  const tabs = [
    {
      title: "Suivi des actions",
      component: <></>,
    },
    {
      title: "Statistiques",
      component: (
        <iframe
          src="https://catalogue.apprentissage.beta.gouv.fr/metabase/public/dashboard/4e36e6e9-df1d-4444-bb76-cce85e662f47"
          frameBorder="0"
          style={{ height: "170vh", width: "100%" }}
          title={`Console de pilotage Parcoursup - Statistiques`}
          allowtransparency={"true"}
        />
      ),
    },
  ];

  const title = "Consoles de pilotage Parcoursup";
  setTitle(title);

  return (
    <Layout>
      <Box w="100%" pt={[4, 8]} px={[1, 1, 12, 24]}>
        <Container maxW="xl">
          <Breadcrumb pages={[{ title: "Accueil", to: "/" }, { title: title }]} />
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
