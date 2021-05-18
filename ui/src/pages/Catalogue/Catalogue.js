import React from "react";
import {
  Container,
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Tabs,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
  Spinner,
} from "@chakra-ui/react";
import Layout from "../layout/Layout";
import { NavLink } from "react-router-dom";
import { ArrowDropRightLine } from "../../theme/components/icons";
import Search from "../../common/components/Search/Search";
import { useSearch } from "../../common/hooks/useSearch";

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
          {!searchState.loaded && <Spinner />}
          {searchState.loaded && (
            <Tabs>
              <TabList>
                <Tab>Catalogue général ({searchState.countCatalogueGeneral.toLocaleString("fr-FR")})</Tab>
                <Tab>Catalogue non-éligible ({searchState.countCatalogueNonEligible.toLocaleString("fr-FR")})</Tab>
                <Tab>Guide reglementaire</Tab>
              </TabList>
              <TabPanels>
                <TabPanel h="100%">
                  <Search {...props} searchState={searchState} context="catalogue_general" />
                </TabPanel>
                <TabPanel h="100%">
                  <Search {...props} searchState={searchState} context="catalogue_non_eligible" />
                </TabPanel>
                <TabPanel h="100%">Guide reglementaire</TabPanel>
              </TabPanels>
            </Tabs>
          )}
        </Container>
      </Box>
    </Layout>
  );
};
