import React from "react";
import {
  Box,
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
import { ArrowRightLine } from "../../theme/components/icons";
import Search from "../../common/components/Search/Search";
import { useSearch } from "../../common/hooks/useSearch";
import { HowToReglement } from "../../common/components/HowToReglement/HowToReglement";
import { HowToAddModal } from "../../common/components/formation/HowToAddModal";
import { Breadcrumb } from "../../common/components/Breadcrumb";
import { setTitle } from "../../common/utils/pageUtils";

import useAuth from "../../common/hooks/useAuth";
import { hasAccessTo } from "../../common/utils/rolesUtils";
import { CATALOGUE_GENERAL_LABEL, CATALOGUE_NON_ELIGIBLE_LABEL } from "../../constants/catalogueLabels";
import { CONTEXT } from "../../constants/context";

export default (props) => {
  let [auth] = useAuth();
  const searchState = useSearch("catalogue");
  const { isOpen, onOpen, onClose } = useDisclosure();

  const title = "Catalogue";
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
            <>
              <Tabs variant="search" mt={5} isLazy defaultIndex={props.guide ? 2 : 0}>
                <TabList bg="white" justifyContent="space-between">
                  <Flex>
                    <Tab>
                      {CATALOGUE_GENERAL_LABEL} (
                      {searchState.countCatalogueGeneral.filtered === null
                        ? searchState.countCatalogueGeneral.total.toLocaleString("fr-FR")
                        : searchState.countCatalogueGeneral.filtered.toLocaleString("fr-FR")}
                      )
                    </Tab>
                    <Tab>
                      {CATALOGUE_NON_ELIGIBLE_LABEL} (
                      {searchState.countCatalogueNonEligible.filtered === null
                        ? searchState.countCatalogueNonEligible.total.toLocaleString("fr-FR")
                        : searchState.countCatalogueNonEligible.filtered.toLocaleString("fr-FR")}
                      )
                    </Tab>
                    <Tab>Guide réglementaire</Tab>
                  </Flex>
                  <Button
                    variant="pill"
                    textStyle="rf-text"
                    onClick={onOpen}
                    px={4}
                    display={["none", "none", "none", "none", "block"]}
                  >
                    <ArrowRightLine w="9px" h="9px" mr={2} /> Demander l'ajout d'une formation
                  </Button>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    <Search {...props} searchState={searchState} context={CONTEXT.CATALOGUE_GENERAL} />
                  </TabPanel>
                  <TabPanel>
                    <Search {...props} searchState={searchState} context={CONTEXT.CATALOGUE_NON_ELIGIBLE} />
                  </TabPanel>
                  <TabPanel>
                    <HowToReglement />
                  </TabPanel>
                </TabPanels>
              </Tabs>

              <Box mb={8} px={8} display={["block", "block", "block", "block", "none"]}>
                <Button variant="pill" onClick={onOpen} textStyle="rf-text" whiteSpace="normal">
                  <ArrowRightLine w="9px" h="9px" mr={2} /> Demander l'ajout d'une formation
                </Button>
              </Box>
              <HowToAddModal isOpen={isOpen} onClose={onClose} />
            </>
          )}
        </Container>
      </Box>
    </Layout>
  );
};
