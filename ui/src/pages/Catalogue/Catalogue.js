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
} from "@chakra-ui/react";
import Layout from "../layout/Layout";
import { NavLink } from "react-router-dom";
import { ArrowDropRightLine } from "../../theme/components/icons";
import Search from "../../common/components/Search/Search";

export default ({ match, location }) => {
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

          <Tabs>
            <TabList>
              <Tab>Catalogue général (20 242)</Tab>
              <Tab>Catalogue non-éligible (2 437)</Tab>
              <Tab>Guide reglementaire</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <Search context="catalogue_general" match={match} location={location} />
              </TabPanel>
              <TabPanel>
                <Search context="catalogue_non_eligible" match={match} location={location} />
              </TabPanel>
              <TabPanel>Guide reglementaire</TabPanel>
            </TabPanels>
          </Tabs>
        </Container>
      </Box>
    </Layout>
  );
};
