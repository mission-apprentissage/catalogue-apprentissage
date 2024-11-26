import React from "react";
import {
  Box,
  Button,
  Center,
  Container,
  Flex,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import Layout from "../layout/Layout";
import { ArrowRightLine } from "../../theme/components/icons";
import { useSearch } from "../../common/hooks/useSearch";
import { HowToAddModal } from "../../common/components/formation/HowToAddModal";
import { Breadcrumb } from "../../common/components/Breadcrumb";
import { setTitle } from "../../common/utils/pageUtils";

import { CATALOGUE_GENERAL_LABEL, CATALOGUE_NON_ELIGIBLE_LABEL } from "../../constants/catalogueLabels";
import { CONTEXT } from "../../constants/context";
import SearchFormation from "../../common/components/Search/SearchFormation";

export default (props) => {
  const searchState = useSearch("catalogue");
  const { isOpen, onOpen, onClose } = useDisclosure();

  const title = "Catalogue";
  setTitle(title);

  return (
    <Layout data-testid="page-catalogue">
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
            <>
              <Tabs variant="search" mt={5} isLazy defaultIndex={props.guide ? 2 : 0}>
                <TabList bg="white" justifyContent="space-between">
                  <Flex>
                    <Tab data-testid="tab-general">
                      {CATALOGUE_GENERAL_LABEL} (
                      {searchState.countCatalogueGeneral.filtered === null
                        ? searchState.countCatalogueGeneral.total.toLocaleString("fr-FR")
                        : searchState.countCatalogueGeneral.filtered.toLocaleString("fr-FR")}
                      )
                    </Tab>
                    <Tab data-testid="tab-non-eligible">
                      {CATALOGUE_NON_ELIGIBLE_LABEL} (
                      {searchState.countCatalogueNonEligible.filtered === null
                        ? searchState.countCatalogueNonEligible.total.toLocaleString("fr-FR")
                        : searchState.countCatalogueNonEligible.filtered.toLocaleString("fr-FR")}
                      )
                    </Tab>
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
                    <SearchFormation {...props} searchState={searchState} context={CONTEXT.CATALOGUE_GENERAL} />
                  </TabPanel>
                  <TabPanel>
                    <SearchFormation {...props} searchState={searchState} context={CONTEXT.CATALOGUE_NON_ELIGIBLE} />
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
