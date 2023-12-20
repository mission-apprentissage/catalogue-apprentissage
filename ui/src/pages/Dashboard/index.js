import React from "react";
import { Box, Container, Text, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";

import Layout from "../layout/Layout";
import { setTitle } from "../../common/utils/pageUtils";
import { Breadcrumb } from "../../common/components/Breadcrumb";
import { getIframeUrl } from "../../common/utils/metabaseUtils";

export default () => {
  const dashboards = [
    {
      title: "Collecte",
      iframeURL: getIframeUrl({ id: 2 }),
      height: "200vh",
    },
    {
      title: "Consommation",
      iframeURL: getIframeUrl({ id: 3 }),
      height: "220vh",
    },
    {
      title: "Acquisition",
      iframeURL: getIframeUrl({ id: 34 }),
      height: "100vh",
    },
    {
      title: "Qualité de la donnée",
      iframeURL: getIframeUrl({ id: 35 }),
      height: "410vh",
    },
  ];

  const title = "Statistiques du catalogue";
  setTitle(title);

  return (
    <Layout>
      <Box w="100%" pt={[4, 8]} px={[1, 1, 12, 24]}>
        <Container maxW="7xl">
          <Breadcrumb pages={[{ title: "Accueil", to: "/" }, { title: title }]} />
          <Text textStyle="h2" color="grey.800" mt={5}>
            {title}
          </Text>

          <Tabs variant={"search"} mt={5} isLazy>
            <TabList bg="white">
              {dashboards.map(({ title }) => {
                return <Tab key={title}>{title}</Tab>;
              })}
            </TabList>
            <TabPanels>
              {dashboards.map(({ iframeURL, title, height }) => {
                return (
                  <TabPanel key={title}>
                    <iframe
                      src={iframeURL}
                      frameBorder="0"
                      style={{ height: height, width: "100%" }}
                      title={`Statistiques Metabase - ${title}`}
                      allowtransparency={"true"}
                    />
                  </TabPanel>
                );
              })}
            </TabPanels>
          </Tabs>
        </Container>
      </Box>
    </Layout>
  );
};
