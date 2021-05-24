import React from "react";
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Center,
  Container,
  Flex,
  Heading,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useDisclosure,
} from "@chakra-ui/react";
import Layout from "../layout/Layout";
import { NavLink } from "react-router-dom";
import { ArrowDropRightLine, ArrowRightLine } from "../../theme/components/icons";
import Search from "../../common/components/Search/Search";
import { useSearch } from "../../common/hooks/useSearch";
import { HowToReglement } from "../../common/components/HowToReglement/HowToReglement";
import { HowToAddModal } from "../../common/components/formation/HowToAddModal";

export default (props) => {
  const searchState = useSearch("catalogue");
  const { isOpen, onOpen, onClose } = useDisclosure();

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
        </Container>
      </Box>

      <Box>
        <Container maxW="full" p={0}>
          {!searchState.loaded && (
            <Center h="70vh">
              <Spinner />
            </Center>
          )}
          {searchState.loaded && (
            <>
              <Tabs variant="search" mt={5}>
                <TabList bg="white" justifyContent="space-between" px={[2, 8, 32, 40, 80]}>
                  <Flex>
                    <Tab>Catalogue général ({searchState.countCatalogueGeneral.toLocaleString("fr-FR")})</Tab>
                    <Tab mx={2}>
                      Catalogue non-éligible ({searchState.countCatalogueNonEligible.toLocaleString("fr-FR")})
                    </Tab>
                    <Tab mx={2}>Guide réglementaire</Tab>
                  </Flex>
                  <Button variant="unstyled" textStyle="rf-text" color="bluefrance" onClick={onOpen}>
                    <ArrowRightLine w="9px" h="9px" mr={2} /> Demander l'ajout d'une formation
                  </Button>
                  <HowToAddModal isOpen={isOpen} onClose={onClose} />
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
            </>
          )}
        </Container>
      </Box>
    </Layout>
  );
};
