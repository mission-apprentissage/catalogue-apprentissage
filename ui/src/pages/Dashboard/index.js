import React from "react";
import { useFetch } from "../../common/hooks/useFetch";
import { Box, Container, Heading, Grid, GridItem } from "@chakra-ui/react";
import Layout from "../layout/Layout";
import StatCard from "../../common/components/StatCard";

const Component = (props) => {
  return (
    <Grid templateColumns="repeat(12, 1fr)" gap={2} pb={4}>
      {props.data?.map((item, i) => {
        return (
          <GridItem key={i} colSpan={[6, 3]}>
            <StatCard
              background={props.background ?? "#ffffff"}
              color={props.color ?? "#1a424c"}
              label={item.title}
              stat={item.value}
            />
          </GridItem>
        );
      })}
    </Grid>
  );
};

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
              <Component data={data.catalogue} />
              <Heading as="h2" fontSize="gamma" mb={4}>
                Parcoursup
              </Heading>
              <Component data={data.parcoursup} />
              <Heading as="h2" fontSize="gamma" mb={4}>
                Affelnet
              </Heading>
              <Component data={data.affelnet} />
              <Heading as="h2" fontSize="gamma" mb={4}>
                Diplômes
              </Heading>
              <Component data={data.diplomes} />
            </>
          )}
        </Container>
      </Box>
    </Layout>
  );
};
