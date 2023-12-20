import React from "react";
import { Box, Container, Flex, Grid, GridItem, Text } from "@chakra-ui/react";
import { Breadcrumb } from "../../common/components/Breadcrumb";
import Layout from "../layout/Layout";
import { setTitle } from "../../common/utils/pageUtils";
import { hasAccessTo } from "../../common/utils/rolesUtils";
import useAuth from "../../common/hooks/useAuth";
import { Card } from "../../common/components/Card";

export default () => {
  const title = "Règles de périmètre";
  setTitle(title);
  let [auth] = useAuth();

  return (
    <Layout>
      <Box w="100%" pt={[4, 8]} px={[1, 1, 12, 24]}>
        <Container maxW="7xl">
          <Breadcrumb pages={[{ title: "Accueil", to: "/" }, { title: title }]} />

          <Text textStyle="h2" color="grey.800" mt={5} mb={5}>
            {title}
          </Text>

          <Flex my={4} mb={8} alignItems="flex-start" data-testid="grid">
            {hasAccessTo(auth, "page_perimetre/parcoursup") && (
              <Box border="2px" p="24px" borderColor="gray.200" mr={4}>
                <Text textStyle="h4" color="grey.800" mt={2} mb={5}>
                  Parcoursup
                </Text>

                <Grid gap={4}>
                  <GridItem colSpan={[3, 3, 1]}>
                    <Card
                      linkTo="/regles-perimetre/parcoursup"
                      title="Règles d'intégration des formations à la plateforme Parcoursup"
                      body="Déterminer les conditions d'intégrations des formations en apprentissage du Catalogue (Carif-Oref) sur la plateforme Parcoursup"
                      isDisabled={!hasAccessTo(auth, "page_perimetre/parcoursup")}
                    />
                  </GridItem>
                </Grid>
              </Box>
            )}

            {hasAccessTo(auth, "page_perimetre/affelnet") && (
              <Box style={{ border: "2px solid #E2E8F0", padding: "24px" }} ml={4}>
                <Text textStyle="h4" color="grey.800" mt={2} mb={5}>
                  Affelnet
                </Text>
                <Grid gap={4}>
                  <GridItem colSpan={[3, 3, 1]}>
                    <Card
                      linkTo="/regles-perimetre/affelnet"
                      title="Règles d'intégration des formations à la plateforme Affelnet"
                      body="Déterminer les conditions d'intégrations des formations en apprentissage du Catalogue (Carif-Oref) sur la plateforme Affelnet"
                      isDisabled={!hasAccessTo(auth, "page_perimetre/affelnet")}
                    />
                  </GridItem>
                </Grid>
              </Box>
            )}
          </Flex>
        </Container>
      </Box>
    </Layout>
  );
};
