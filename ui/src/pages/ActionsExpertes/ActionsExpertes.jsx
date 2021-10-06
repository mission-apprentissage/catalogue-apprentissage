import React from "react";
import { Box, Container, Flex, Grid, GridItem, Heading, Link, Text } from "@chakra-ui/react";
import { Breadcrumb } from "../../common/components/Breadcrumb";
import Layout from "../layout/Layout";
import { setTitle } from "../../common/utils/pageUtils";
import { NavLink } from "react-router-dom";
import { useSearch } from "../../common/hooks/useSearch";
import { hasAccessTo, isUserAdmin } from "../../common/utils/rolesUtils";
import useAuth from "../../common/hooks/useAuth";
import { ArrowRightLine } from "../../theme/components/icons";

export const Card = ({ info, linkTo, title, body, isDisabled }) => {
  const CardContent = () => (
    <Flex flexDirection="column" h="full">
      <Box>
        <Flex display={["none", "flex"]} textStyle="md">
          <Text color={!isDisabled ? "bluefrance" : "grey.600"}>{info}</Text>
        </Flex>
        <Heading textStyle="h6" color={!isDisabled ? "grey.800" : "grey.600"} mt={2} mb={2}>
          {title}
        </Heading>
      </Box>
      <Flex flexDirection="column" flexGrow="1">
        <Text textStyle="md" color="grey.600">
          {body}
        </Text>
      </Flex>
      <Flex justifyContent="flex-end">
        {!isDisabled && <ArrowRightLine alignSelf="center" color="bluefrance" boxSize={4} />}
      </Flex>
    </Flex>
  );
  return (
    <>
      {!isDisabled ? (
        <Link as={NavLink} to={linkTo} variant="card" h="100%" p={6}>
          <CardContent />
        </Link>
      ) : (
        <Text variant="card" as="div" h="100%" p={6}>
          <CardContent />
        </Text>
      )}
    </>
  );
};

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
          {searchState.loaded && (
            <Grid templateColumns="repeat(4, 1fr)" gap={4} minH="350px" my={4} data-testid={"grid"}>
              {(isUserAdmin(auth) || hasAccessTo(auth, "page_reconciliation_ps")) && (
                <GridItem>
                  <Card
                    info={`${(
                      (searchState.countReconciliationPs.countValide * 100) /
                      (searchState.countReconciliationPs.countTotal || 1)
                    ).toFixed(2)}% de validées`}
                    linkTo="/couverture-ps"
                    title="Rapprochement des bases Carif-Oref et Parcoursup"
                    body="Valider la correspondance des données entre la base Parcoursup et le Catalogue des offres de formations en apprentissage 2021 (base Carif-Oref)"
                    isDisabled={!hasAccessTo(auth, "page_reconciliation_ps")}
                  />
                </GridItem>
              )}

              {(isUserAdmin(auth) || hasAccessTo(auth, "page_perimetre_af")) && (
                <GridItem>
                  <Card
                    linkTo="/perimetre-affelnet"
                    title="Règles d'intégration des formations à la plateforme Affelnet"
                    body="Déterminer les conditions d'intégrations des formations en apprentissage du Catalogue (Carif-Oref) sur la plateforme Affelnet"
                    isDisabled={!hasAccessTo(auth, "page_perimetre_af")}
                  />
                </GridItem>
              )}

              {(isUserAdmin(auth) || hasAccessTo(auth, "page_perimetre_ps")) && (
                <GridItem>
                  <Card
                    linkTo="/perimetre-parcoursup"
                    title="Règles d'intégration des formations à la plateforme Parcoursup"
                    body="Déterminer les conditions d'intégrations des formations en apprentissage du Catalogue (Carif-Oref) sur la plateforme Parcoursup"
                    isDisabled={!hasAccessTo(auth, "page_perimetre_ps")}
                  />
                </GridItem>
              )}
            </Grid>
          )}
        </Container>
      </Box>
    </Layout>
  );
};
