import React from "react";
import { Box, Container, Heading, Flex, Link, Text, Grid, GridItem } from "@chakra-ui/react";
import { Breadcrumb } from "../../common/components/Breadcrumb";
import Layout from "../layout/Layout";
import { setTitle } from "../../common/utils/pageUtils";
import { NavLink } from "react-router-dom";
import { useSearch } from "../../common/hooks/useSearch";
// import { hasOneOfRoles } from "../../common/utils/rolesUtils";
// import useAuth from "../../common/hooks/useAuth";
import { ArrowRightLine } from "../../theme/components/icons";

export const Card = ({ info, linkTo, title, body }) => {
  return (
    <Link as={NavLink} to={linkTo} variant="card" mt={4}>
      <Flex display={["none", "flex"]} textStyle="xs">
        <Text color="bluefrance">{info}</Text>
      </Flex>
      <Heading textStyle="h6" color="grey.800" mt={2} mb={2}>
        {title}
      </Heading>
      <Box>
        <Text textStyle="sm" color="grey.600">
          {body}
        </Text>
        <Box>
          <Flex justifyContent="flex-end">
            <ArrowRightLine alignSelf="center" color="bluefrance" boxSize={4} />
          </Flex>
        </Box>
      </Box>
    </Link>
  );
};

export default () => {
  let searchState = useSearch("reconciliation_ps");
  const title = "Mes actions expertes";
  setTitle(title);

  // let [auth] = useAuth();
  //hasOneOfRoles(auth, ["admin", "instructeur"])

  return (
    <Layout>
      <Box w="100%" pt={[4, 8]} px={[1, 1, 12, 24]}>
        <Container maxW="xl">
          <Breadcrumb pages={[{ title: "Accueil", to: "/" }, { title: title }]} />
          <Heading textStyle="h2" color="grey.800" mt={5} mb={5}>
            {title}
          </Heading>
          {searchState.loaded && (
            <Grid templateRows="repeat(2, 1fr)" templateColumns="repeat(2, 1fr)" gap={4}>
              <GridItem>
                <Card
                  info="0% de correspondances validées"
                  linkTo="/couverture-affelnet"
                  title="Rapprochement des bases Carif-Oref et Affelnet"
                  body="Valider la correspondance des données entre la base Affelnet et le Catalogue des offres de formations en apprentissage 2021 (base Carif-Oref)"
                />
              </GridItem>
              <GridItem>
                <Card
                  info="0% de converture"
                  linkTo="#"
                  title="Intégration des formations à la plateforme Affelnet"
                  body="Déterminer les règles d’intégration des formations du Catalogue des offres de formation en apprentissage 2021 (Carif-Oref) sur la plateforme Affelnet"
                />
              </GridItem>
              <GridItem>
                <Card
                  info={`${(
                    (searchState.countReconciliationPs.countValide * 100) /
                    searchState.countReconciliationPs.countTotal
                  ).toFixed(2)}% de correspondances validées`}
                  linkTo="/couverture-ps"
                  title="Rapprochement des bases Carif-Oref et Parcoursup"
                  body="Valider la correspondance des données entre la base Parcoursup et le Catalogue des offres de formations en apprentissage 2021 (base Carif-Oref)"
                />
              </GridItem>
              <GridItem>
                <Card
                  info="0% de converture"
                  linkTo="#"
                  title="Intégration des formations à la plateforme Parcoursup"
                  body="Déterminer les règles d’intégration des formations du Catalogue des offres de formation en apprentissage 2021 (Carif-Oref) sur la plateforme Parcoursup"
                />
              </GridItem>
            </Grid>
          )}
        </Container>
      </Box>
    </Layout>
  );
};
