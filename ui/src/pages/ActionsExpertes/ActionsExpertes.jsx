import React from "react";
import { Box, Container, Flex, Grid, GridItem, Heading } from "@chakra-ui/react";
import { Breadcrumb } from "../../common/components/Breadcrumb";
import Layout from "../layout/Layout";
import { setTitle } from "../../common/utils/pageUtils";
import { useSearch } from "../../common/hooks/useSearch";
import { hasAccessTo, isUserAdmin } from "../../common/utils/rolesUtils";
import useAuth from "../../common/hooks/useAuth";
import { Card } from "../../common/components/Card";

export default () => {
  let searchState = useSearch("reconciliation_ps");
  const title = "Mes actions expertes";
  setTitle(title);
  let [auth] = useAuth();

  return (
    <Layout>
      <Box w="100%" pt={[4, 8]} px={[1, 1, 12, 24]}>
        <Container maxW="xl">
          <Breadcrumb pages={[{ title: "Accueil", to: "/" }, { title: title }]} />
          <Heading textStyle="h2" color="grey.800" mt={5} mb={5}>
            {title}
          </Heading>

          <Flex my={4} mb={8} alignItems="flex-start" data-testId="grid">
            <Box border="2px" p="24px" borderColor="gray.200" mr={4}>
              <Heading textStyle="h4" color="grey.800" mt={2} mb={5}>
                Parcoursup
              </Heading>

              <Grid gap={4}>
                <GridItem colSpan={[3, 3, 1]}>
                  <Card
                    linkTo="/console-pilotage/parcoursup"
                    title="Ma console de pilotage Parcoursup"
                    isDisabled={!hasAccessTo(auth, "page_perimetre_af")}
                  />
                </GridItem>
                {(isUserAdmin(auth) || hasAccessTo(auth, "page_reconciliation_ps")) && searchState.loaded && (
                  <GridItem colSpan={[3, 3, 1]}>
                    <Card
                      info={`${(
                        (searchState.countReconciliationPs.countValide * 100) /
                        (searchState.countReconciliationPs.countTotal || 1)
                      ).toFixed(2)}% de validées`}
                      linkTo="/couverture-ps"
                      title="Rapprochement des bases Carif-Oref et Parcoursup"
                      body="Valider la correspondance des données entre la base Parcoursup et le Catalogue des offres de formations en apprentissage (base Carif-Oref)"
                      isDisabled={!hasAccessTo(auth, "page_reconciliation_ps")}
                    />
                  </GridItem>
                )}
                {(isUserAdmin(auth) || hasAccessTo(auth, "page_perimetre_ps")) && (
                  <GridItem colSpan={[3, 3, 1]}>
                    <Card
                      linkTo="/perimetre-parcoursup"
                      title="Règles d'intégration des formations à la plateforme Parcoursup"
                      body="Déterminer les conditions d'intégrations des formations en apprentissage du Catalogue (Carif-Oref) sur la plateforme Parcoursup"
                      isDisabled={!hasAccessTo(auth, "page_perimetre_ps")}
                    />
                  </GridItem>
                )}
              </Grid>
            </Box>

            <Box style={{ border: "2px solid #E2E8F0", padding: "24px" }} ml={4}>
              <Heading textStyle="h4" color="grey.800" mt={2} mb={5}>
                Affelnet
              </Heading>
              <Grid gap={4}>
                <GridItem colSpan={[3, 3, 1]}>
                  <Card
                    linkTo="/console-pilotage/affelnet"
                    title="Ma console de pilotage Affelnet"
                    isDisabled={!hasAccessTo(auth, "page_perimetre_af")}
                  />
                </GridItem>
                {(isUserAdmin(auth) || hasAccessTo(auth, "page_perimetre_af")) && (
                  <GridItem colSpan={[3, 3, 1]}>
                    <Card
                      linkTo="/perimetre-affelnet"
                      title="Règles d'intégration des formations à la plateforme Affelnet"
                      body="Déterminer les conditions d'intégrations des formations en apprentissage du Catalogue (Carif-Oref) sur la plateforme Affelnet"
                      isDisabled={!hasAccessTo(auth, "page_perimetre_af")}
                    />
                  </GridItem>
                )}
              </Grid>
            </Box>
          </Flex>
        </Container>
      </Box>
    </Layout>
  );
};
