import React from "react";
import {
  Container,
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Heading,
  Tabs,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
  Spinner,
  Center,
} from "@chakra-ui/react";
import Layout from "../layout/Layout";
import { NavLink } from "react-router-dom";
import { ArrowDropRightLine } from "../../theme/components/icons";
import Search from "../../common/components/Search/Search";
import { useSearch } from "../../common/hooks/useSearch";
import { HowToReglement } from "../../common/components/HowToReglement/HowToReglement";

export default (props) => {
  const searchState = useSearch("organismes");
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
              <BreadcrumbLink>Liste des établissements</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
          <Heading textStyle="h2" color="grey.800" mt={5}>
            Liste des organismes
          </Heading>
          {!searchState.loaded && (
            <Center h="70vh">
              <Spinner />
            </Center>
          )}
          {searchState.loaded && (
            <Tabs variant="search" mt={5}>
              <TabList bg="white">
                <Tab>Liste</Tab>
                <Tab mx={2}>Guide réglementaire</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <Search {...props} searchState={searchState} context="organismes" />
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
