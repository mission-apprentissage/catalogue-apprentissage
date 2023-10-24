import React from "react";
import { Box, Center, Container, Heading, Spinner, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import Layout from "../layout/Layout";
import { useSearch } from "../../common/hooks/useSearch";
import { HowToReglement } from "../../common/components/HowToReglement/HowToReglement";
import { Breadcrumb } from "../../common/components/Breadcrumb";
import { setTitle } from "../../common/utils/pageUtils";

import { CONTEXT } from "../../constants/context";
import SearchEtablissement from "../../common/components/Search/SearchEtablissement";

export default (props) => {
  const searchState = useSearch("organismes");
  const title = "Organismes";
  setTitle(title);

  return (
    <Layout>
      <Box w="100%" pt={[4, 8]} px={[1, 1, 12, 24]}>
        <Container maxW="xl">
          <Breadcrumb pages={[{ title: "Accueil", to: "/" }, { title: title }]} />
          <Heading textStyle="h2" color="grey.800" mt={5}>
            {title}
          </Heading>

          {!searchState.loaded && (
            <Center h="70vh">
              <Spinner />
            </Center>
          )}
          {searchState.loaded && (
            <Tabs variant="search" mt={5} isLazy>
              <TabList bg="white">
                <Tab>Liste</Tab>
                <Tab>Guide réglementaire</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <SearchEtablissement {...props} searchState={searchState} context={CONTEXT.ORGANISMES} />
                </TabPanel>

                <TabPanel>
                  <HowToReglement />
                </TabPanel>
              </TabPanels>
            </Tabs>
          )}
        </Container>
      </Box>
    </Layout>
  );
};
