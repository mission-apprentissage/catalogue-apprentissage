import React from "react";
import { Box, Container, Heading, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";

import Layout from "../layout/Layout";
import { setTitle } from "../../common/utils/pageUtils";
import { Breadcrumb } from "../../common/components/Breadcrumb";
import { getIframeUrl } from "../../common/utils/metabaseUtils";

export default () => {
  const dashboards = [
    {
      title: "Console de pilotage DEGESCO",
      iframeURL: getIframeUrl({ id: 201 }),
      height: "220vh",
    },
    {
      title: "Console de pilotage DGESIP",
      iframeURL: getIframeUrl({ id: 200 }),
      height: "220vh",
    },
  ];

  const title = "Consoles de pilotage";
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
