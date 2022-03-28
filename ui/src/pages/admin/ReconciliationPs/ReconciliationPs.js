import React, { useCallback } from "react";
import {
  Box,
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
  Text,
  // Button,
} from "@chakra-ui/react";
import Layout from "../../layout/Layout";
import {
  EmojiSmile,
  EmojiFlat,
  Question,
  Tick,
  Reject,
  // SentPaperPlane
} from "../../../theme/components/icons";
import Search from "../../../common/components/Search/Search";
import { useSearch } from "../../../common/hooks/useSearch";
import { ReconciliationModal } from "./components/ReconciliationModal";
import { Breadcrumb } from "../../../common/components/Breadcrumb";
import { setTitle } from "../../../common/utils/pageUtils";
// import { _post } from "../../../common/httpClient";

// import useAuth from "../../../common/hooks/useAuth";
// import { hasAccessTo } from "../../../common/utils/rolesUtils";

export default (props) => {
  let searchState = useSearch("reconciliation_ps");
  // let [auth] = useAuth();
  const [psFormation, setPsFormation] = React.useState();
  const {
    isOpen: isOpenReconciliationPsModal,
    onOpen: onOpenReconciliationPsModal,
    onClose: onCloseModal,
  } = useDisclosure();

  const title = "Rapprochement des bases Parcoursup et Carif-Oref";
  setTitle(title);

  let onCloseReconciliationPsModal = useCallback(() => {
    onCloseModal();
  }, [onCloseModal]);

  // const sendReport = async () => {
  //   await _post("/api/parcoursup/reconciliation/sendreport");
  // };

  return (
    <Layout>
      <Box w="100%" pt={[4, 8]} px={[1, 1, 12, 24]}>
        <Container maxW="xl">
          <Breadcrumb
            pages={[
              { title: "Accueil", to: "/" },
              { title: "Mes actions expertes", to: "/mes-actions" },
              { title: title },
            ]}
          />
          <Heading textStyle="h2" color="grey.800" mt={5}>
            {title}
          </Heading>
          <Text fontWeight="bold" mt={5}>
            Pour réaliser le rapprochement des bases, les{" "}
            {searchState.loaded && `${searchState.countReconciliationPs.countTotal}`} formations paramétrées sur
            Parcoursup sont comparées aux formations de la base Carif-Oref.
          </Text>
          <Text fontSize="sm" mt={5}>
            Les informations comparées pour réaliser le rapprochement sont les suivantes : Codes formation diplôme BCN,
            Codes MEF, Codes UAI, Codes postaux, Académie et SIRET. Les rapprochements sont forts lorsque les
            informations sont similaires à la fois sur les données concernant la formation et le(s) organisme(s)
            associé(s) ; les rapprochements sont faibles lorsque les informations sont similaires sur les données
            concernant la formation.
          </Text>
          {!searchState.loaded && (
            <Center h="70vh">
              <Spinner />
            </Center>
          )}
          {searchState.loaded && (
            <>
              <Tabs variant="search" mt={5} isLazy>
                <TabList bg="white" justifyContent="space-between">
                  <Flex>
                    <Tab>
                      <EmojiSmile color="grey.700" mr="1" />
                      {searchState.countReconciliationPs.countAutomatique.toLocaleString("fr-FR")} rapprochements forts
                    </Tab>
                    <Tab mx={2}>
                      <EmojiFlat color="grey.700" mr="1" />
                      {searchState.countReconciliationPs.countAVerifier.toLocaleString("fr-FR")} rapprochements faibles
                    </Tab>
                    <Tab mx={2}>
                      <Reject color="grey.700" mr="1" />
                      {searchState.countReconciliationPs.countRejete.toLocaleString("fr-FR")} rejeté(s)
                    </Tab>
                    <Tab mx={2}>
                      <Question color="grey.700" mr="1" />
                      {searchState.countReconciliationPs.countInconnu.toLocaleString("fr-FR")} inconnu(s)
                    </Tab>
                    <Tab mx={2}>
                      <Tick color="grey.700" mr="1" />
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
                      context="reconciliation_ps_rejetes"
                      onReconciliationCardClicked={(data) => {
                        setPsFormation(data);
                        onOpenReconciliationPsModal();
                      }}
                      // extraButtons={
                      //   auth && hasAccessTo(auth, "page_reconciliation_ps/send_rapport_anomalies") ? (
                      //     <Button variant="pill" py={2} onClick={sendReport}>
                      //       <SentPaperPlane mx="0.5rem" w="0.75rem" h="0.75rem" />
                      //       Envoyer un rapport au Carif-Oref
                      //     </Button>
                      //   ) : (
                      //     <></>
                      //   )
                      // }
                      extraButtons={<></>}
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
        <ReconciliationModal
          isOpen={isOpenReconciliationPsModal}
          onClose={onCloseReconciliationPsModal}
          data={psFormation}
        />
      )}
    </Layout>
  );
};
