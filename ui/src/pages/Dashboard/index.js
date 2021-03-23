import React from "react";
import { useFetch } from "../../common/hooks/useFetch";
import { Box, Container, Heading } from "@chakra-ui/react";
import Layout from "../layout/Layout";
import StatGrid from "../../common/components/StatGrid";

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
              <StatGrid data={data.catalogue} />
              <Heading as="h2" fontSize="gamma" mb={4}>
                Parcoursup
              </Heading>
              <StatGrid data={data.parcoursup} />
              <Heading as="h2" fontSize="gamma" mb={4}>
                Affelnet
              </Heading>
              <StatGrid data={data.affelnet} />
              <Heading as="h2" fontSize="gamma" mb={4}>
                Diplômes
              </Heading>
              <StatGrid data={data.diplomes} />
            </>
          )}
        </Container>
      </Box>
    </Layout>
  );
};
