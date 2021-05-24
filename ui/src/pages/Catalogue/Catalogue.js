import React from "react";
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Container,
  Heading,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import Layout from "../layout/Layout";
import { NavLink } from "react-router-dom";
import { ArrowDropRightLine } from "../../theme/components/icons";
import Search from "../../common/components/Search/Search";
import { useSearch } from "../../common/hooks/useSearch";
import { HowToReglement } from "../../common/components/HowToReglement/HowToReglement";

export default (props) => {
  const searchState = useSearch("catalogue");

  return (
    <Layout>
      <Box w="100%" pt={[4, 8]} px={[1, 24]}>
        <Container maxW="xl">
          <Breadcrumb separator={<ArrowDropRightLine color="grey.600" />} textStyle="xs">
            <BreadcrumbItem>
              <BreadcrumbLink as={NavLink} to="/" color="grey.600" textDecoration="underline">
                Accueil
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>Catalogue des formations en apprentissage 2021</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
          <Heading textStyle="h2" color="grey.800" mt={5}>
            Catalogue des formations en apprentissage 2021
          </Heading>
          {!searchState.loaded && <Spinner />}
          {searchState.loaded && (
            <Tabs variant="search" mt={5}>
              <TabList bg="white">
                <Tab>Catalogue général ({searchState.countCatalogueGeneral.toLocaleString("fr-FR")})</Tab>
                <Tab mx={2}>
                  Catalogue non-éligible ({searchState.countCatalogueNonEligible.toLocaleString("fr-FR")})
                </Tab>
                <Tab mx={2}>Guide réglementaire</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <Search {...props} searchState={searchState} context="catalogue_general" />
                </TabPanel>
                <TabPanel>
                  <Search {...props} searchState={searchState} context="catalogue_non_eligible" />
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
