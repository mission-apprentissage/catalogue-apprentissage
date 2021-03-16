import React from "react";
import { useFetch } from "../../common/hooks/useFetch";
import { Box, Container, Heading, Grid, GridItem } from "@chakra-ui/react";
import Layout from "../layout/Layout";
import StatCard from "./components/StatCard";

export default () => {
  const [data, loading] = useFetch("api/stats");

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
              <Grid templateColumns="repeat(12, 1fr)" gap={2} pb={4}>
                {data.catalogue.map((item, i) => {
                  return (
                    <GridItem key={i} colSpan={[6, 3]}>
                      <StatCard label={item.title} stat={item.value} />
                    </GridItem>
                  );
                })}
              </Grid>
              <Heading as="h2" fontSize="gamma" mb={4}>
                Parcoursup
              </Heading>
              <Grid templateColumns="repeat(12, 1fr)" gap={2} pb={4}>
                {data.parcoursup.map((item, i) => {
                  return (
                    <GridItem key={i} colSpan={[6, 3]}>
                      <StatCard label={item.title} stat={item.value} />
                    </GridItem>
                  );
                })}
              </Grid>
              <Heading as="h2" fontSize="gamma" mb={4}>
                Affelnet
              </Heading>
              <Grid templateColumns="repeat(12, 1fr)" gap={2} pb={4}>
                {data.affelnet.map((item, i) => {
                  return (
                    <GridItem key={i} colSpan={[6, 3]}>
                      <StatCard label={item.title} stat={item.value} />
                    </GridItem>
                  );
                })}
              </Grid>
            </>
          )}
        </Container>
      </Box>
    </Layout>
  );
};
