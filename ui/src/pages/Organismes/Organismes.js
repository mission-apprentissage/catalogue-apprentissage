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
} from "@chakra-ui/react";
import Layout from "../layout/Layout";
import { NavLink } from "react-router-dom";
import { ArrowDropRightLine } from "../../theme/components/icons";
import Search from "../../common/components/Search/Search";
import { useSearch } from "../../common/hooks/useSearch";

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
          <Heading as="h1" fontSize="beta" className="title">
            Liste des organismes
          </Heading>
          {!searchState.loaded && <Spinner />}
          {searchState.loaded && (
            <Tabs variant="formationStyle" mt={5}>
              <TabList bg="white">
                <Tab
                  bg="#EEF1F8"
                  color="#383838"
                  fontWeight="700"
                  textStyle="sm"
                  _selected={{
                    bg: "white",
                    color: "bluefrance",
                    borderTop: "2px solid #000091",
                    borderLeft: "1px solid #CECECE",
                    borderRight: "1px solid #CECECE",
                    outline: "1px solid white",
                    zIndex: "1",
                  }}
                >
                  Liste
                </Tab>
                <Tab
                  mx={2}
                  textStyle="sm"
                  bg="#EEF1F8"
                  color="#383838"
                  fontWeight="700"
                  _selected={{
                    bg: "white",
                    color: "bluefrance",
                    borderTop: "2px solid #000091",
                    borderLeft: "1px solid #CECECE",
                    borderRight: "1px solid #CECECE",
                    outline: "1px solid white",
                    zIndex: "1",
                  }}
                >
                  Guide reglementaire
                </Tab>
              </TabList>
              <TabPanels>
                <TabPanel h="100%">
                  <Search {...props} searchState={searchState} context="organismes" />
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
