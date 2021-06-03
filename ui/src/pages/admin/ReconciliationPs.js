import React, { useCallback } from "react";
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
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
import { ArrowDropRightLine } from "../../theme/components/icons";
import Search from "../../common/components/Search/Search";
import { useSearch } from "../../common/hooks/useSearch";
import { ReconciliationPsModal } from "../../common/components/reconciliation/ReconciliationPsModal";

export default (props) => {
  let searchState = useSearch("reconciliation_ps");
  const [psFormation, setPsFormation] = React.useState();
  const {
    isOpen: isOpenReconciliationPsModal,
    onOpen: onOpenReconciliationPsModal,
    onClose: onCloseModal,
  } = useDisclosure();

  let onCloseReconciliationPsModal = useCallback(() => {
    onCloseModal();
  }, [onCloseModal]);

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
            <BreadcrumbItem>
              <BreadcrumbLink as={NavLink} to="/" color="grey.600" textDecoration="underline">
                Mes actions expertes
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>Rapprochement des bases Carif-Oref et Parcoursup</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
          <Heading textStyle="h2" color="grey.800" mt={5}>
            Rapprochement des bases Carif-Oref et Parcoursup
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
                    <Tab>
                      {searchState.countReconciliationPs.countAutomatique.toLocaleString("fr-FR")} rapprochements forts
                    </Tab>
                    <Tab mx={2}>
                      {" "}
                      {searchState.countReconciliationPs.countAVerifier.toLocaleString("fr-FR")} rapprochements faibles
                    </Tab>
                    <Tab mx={2}> {searchState.countReconciliationPs.countInconnu.toLocaleString("fr-FR")} inconnus</Tab>
                    <Tab mx={2}>
                      {(
                        (searchState.countReconciliationPs.countValide * 100) /
                        searchState.countReconciliationPs.countTotal
                      ).toFixed(2)}
                      % validés
                    </Tab>
                  </Flex>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    <Search
                      {...props}
                      searchState={searchState}
                      context="reconciliation_ps_forts"
                      onReconciliationCardClicked={(data) => {
                        setPsFormation(data);
                        onOpenReconciliationPsModal();
                      }}
                    />
                  </TabPanel>
                  <TabPanel>
                    <Search
                      {...props}
                      searchState={searchState}
                      context="reconciliation_ps_faibles"
                      onReconciliationCardClicked={(data) => {
                        setPsFormation(data);
                        onOpenReconciliationPsModal();
                      }}
                    />
                  </TabPanel>
                  <TabPanel>
                    <Search
                      {...props}
                      searchState={searchState}
                      context="reconciliation_ps_inconnus"
                      onReconciliationCardClicked={(data) => {
                        alert("Nous ne disposons pas de suffisamment d'éléments pour réaliser un rapprochement.");
                      }}
                    />
                  </TabPanel>
                  <TabPanel>
                    <Search
                      {...props}
                      searchState={searchState}
                      context="reconciliation_ps_valides"
                      onReconciliationCardClicked={(data) => {
                        setPsFormation(data);
                        onOpenReconciliationPsModal();
                      }}
                    />
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </>
          )}
        </Container>
      </Box>
      {psFormation && (
        <ReconciliationPsModal
          isOpen={isOpenReconciliationPsModal}
          onClose={onCloseReconciliationPsModal}
          data={psFormation}
        />
      )}
    </Layout>
  );
};
