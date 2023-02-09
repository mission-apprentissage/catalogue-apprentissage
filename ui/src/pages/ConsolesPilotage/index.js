import React from "react";
import { Box, Container, Flex, Grid, GridItem, Heading } from "@chakra-ui/react";
import { Breadcrumb } from "../../common/components/Breadcrumb";
import Layout from "../layout/Layout";
import { setTitle } from "../../common/utils/pageUtils";
import { hasAccessTo, isUserAdmin } from "../../common/utils/rolesUtils";
import useAuth from "../../common/hooks/useAuth";
import { Card } from "../../common/components/Card";

export default () => {
  const title = "Consoles de pilotage";
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

          <Flex my={4} mb={8} alignItems="flex-start" data-testid="grid">
            {(isUserAdmin(auth) || hasAccessTo(auth, "page_console/parcoursup")) && (
              <Box border="2px" p="24px" borderColor="gray.200" mr={4}>
                <Heading textStyle="h4" color="grey.800" mt={2} mb={5}>
                  Parcoursup
                </Heading>

                <Grid gap={4}>
                  <GridItem colSpan={[3, 3, 1]}>
                    <Card
                      linkTo="/consoles-pilotage/parcoursup"
                      title="Ma console de pilotage Parcoursup"
                      body="Suivre différents indicateurs pour analyse de l'état de la publication de l'offre de formation vers la plateforme Parcoursup"
                      isDisabled={!hasAccessTo(auth, "page_console/parcoursup")}
                    />
                  </GridItem>
                </Grid>
              </Box>
            )}

            {(isUserAdmin(auth) || hasAccessTo(auth, "page_console/affelnet")) && (
              <Box style={{ border: "2px solid #E2E8F0", padding: "24px" }} ml={4}>
                <Heading textStyle="h4" color="grey.800" mt={2} mb={5}>
                  Affelnet
                </Heading>
                <Grid gap={4}>
                  <GridItem colSpan={[3, 3, 1]}>
                    <Card
                      linkTo="/consoles-pilotage/affelnet"
                      title="Ma console de pilotage Affelnet"
                      body="Suivre différents indicateurs pour analyse de l'état de la publication de l'offre de formation vers la plateforme Affelnet"
                      isDisabled={!hasAccessTo(auth, "page_console/affelnet")}
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
