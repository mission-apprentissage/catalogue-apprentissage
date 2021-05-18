import React from "react";
import {
  Container,
  Box,
  Heading,
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
          <Heading textStyle="h2" color="grey.800" mt={5}>
            Catalogue des formations en apprentissage 2021
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
                  Catalogue général ({searchState.countCatalogueGeneral.toLocaleString("fr-FR")})
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
                  Catalogue non-éligible ({searchState.countCatalogueNonEligible.toLocaleString("fr-FR")})
                </Tab>
                <Tab
                  mx={2}
                  bg="#EEF1F8"
                  textStyle="sm"
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
