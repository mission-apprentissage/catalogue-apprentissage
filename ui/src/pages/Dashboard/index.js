import React from "react";
import { useFetch } from "../../common/hooks/useFetch";
import {
  Box,
  Container,
  Heading,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatArrow,
  StatHelpText,
} from "@chakra-ui/react";
import Layout from "../layout/Layout";
import StatCard from "./components/StatCard";

export default () => {
  // const [data, loading] = useFetch("api/stats");
  let data = true;
  let loading = false;

  return (
    <Layout>
      <Box bg="secondaryBackground" w="100%" py={[1, 8]} px={[1, 24]}>
        <Container maxW="xl">
          <Heading as="h1" mb={8} mt={2}>
            Tableau de bord
          </Heading>
          {loading && "Chargement des données..."}
          {data && (
            <>
              <Heading as="h2" fontSize="gamma" mb={4}>
                Catalogue
              </Heading>
              <Grid templateColumns="repeat(12, 1fr)" gap={2} pb={2}>
                <GridItem colSpan={[6, 3]}>
                  <StatCard label="Nombre de formation publiées" stat={data.nbCataloguePublished} />
                </GridItem>
                <GridItem>
                  <StatCard label="Nombre de formation RCO publiées" stat={data.nbRcoPublished} />
                </GridItem>
                <GridItem>
                  <StatCard label="Nombre de formation RCO en erreur" stat={data.nbRcoConversionError} />
                </GridItem>
              </Grid>
              <Heading as="h2" fontSize="gamma" mb={4}>
                Parcoursup
              </Heading>
              <Grid templateColumns="repeat(12, 1fr)" gap={2} pb={2}>
                <GridItem colSpan={[6, 3]}>
                  <StatCard label="Nombre de formation" stat={data.nbAllPsup} />
                </GridItem>
                <GridItem colSpan={[6, 3]}>
                  <StatCard label="Nombre de formation réconcilées" stat={data.nbAllPsupReconcilied} />
                </GridItem>
                <GridItem colSpan={[6, 3]}>
                  <StatCard label="Nombre de formation réconcilées" stat={data.nbPsupErrors} />
                </GridItem>
                <GridItem colSpan={[6, 3]}>
                  <StatCard label="Nombre de formation réconcilées" stat={data.nbPsupNotRelevant} />
                </GridItem>
                <GridItem colSpan={[6, 3]}>
                  <StatCard label="Nombre de formation réconcilées" stat={data.nbPsupToCheck} />
                </GridItem>
                <GridItem colSpan={[6, 3]}>
                  <StatCard label="Nombre de formation réconcilées" stat={data.nbPsupPending} />
                </GridItem>
                <GridItem colSpan={[6, 3]}>
                  <StatCard label="Nombre de formation réconcilées" stat={data.nbPsupPublished} />
                </GridItem>
              </Grid>
            </>
          )}
        </Container>
      </Box>
    </Layout>
  );
};

// nbCataloguePublished,
// nbRcoPublished,
// nbRcoConversionError,
// nbAllPsup,
// nbAllPsupReconcilied,
// nbPsupErrors,
// nbPsupNotRelevant,
// nbPsupToCheck,
// nbPsupPending,
// nbPsupPublished,
// nbPsupNotPublished,
// nbAllAffelnet,
// nbAllAffelnetReconcilied,
// nbAffelnetErrors,
// nbAffelnetNotRelevant,
// nbAffelnetToCheck,
// nbAffelnetPending,
// nbAffelnetPublished,
// nbAffelnetNotPublished,
