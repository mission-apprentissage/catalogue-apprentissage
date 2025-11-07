import React from "react";
import { Box, Center, Container, Text, Spinner, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import Layout from "../layout/Layout";
import { useEtablissementSearch } from "../../common/hooks/useEtablissementSearch";
// import { HowToReglement } from "../../common/components/HowToReglement/HowToReglement";
import { Breadcrumb } from "../../common/components/Breadcrumb";
import { setTitle } from "../../common/utils/pageUtils";

import SearchEtablissement from "../../common/components/Search/SearchEtablissement";

export default (props) => {
  const searchState = useEtablissementSearch();
  const title = "Organismes";
  setTitle(title);

  return (
    <Layout>
      <Box w="100%" pt={[4, 8]} px={[1, 1, 12, 24]}>
        <Container maxW="7xl">
          <Breadcrumb pages={[{ title: "Accueil", to: "/" }, { title: title }]} />
          <Text textStyle="h2" color="grey.800" mt={5}>
            {title}
          </Text>

          {!searchState.loaded && (
            <Center h="70vh">
              <Spinner />
            </Center>
          )}
          {searchState.loaded && (
            <Tabs variant="search" mt={5} isLazy>
              <TabList bg="white">
                <Tab>Liste</Tab>
                {/* <Tab>Guide réglementaire</Tab> */}
              </TabList>
              <TabPanels>
                <TabPanel>
                  <SearchEtablissement {...props} searchState={searchState} />
                </TabPanel>

                {/* <TabPanel>
                  <HowToReglement />
                </TabPanel> */}
              </TabPanels>
            </Tabs>
          )}
        </Container>
      </Box>
    </Layout>
  );
};
