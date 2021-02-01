import React from "react";
import { useFetch } from "../common/hooks/useFetch";
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
import Layout from "./layout/Layout";

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
                Accueil admin
              </Heading>
              <Grid templateColumns="repeat(12, 1fr)" gap={2}>
                <GridItem colSpan={[6, 3]} bg="white" p={4} borderRadius={4}>
                  <Stat textAlign="center">
                    <StatLabel>Items</StatLabel>
                    <StatNumber>{data.stats.nbItems}</StatNumber>
                    <StatHelpText>
                      <StatArrow type="increase" />
                      0%
                    </StatHelpText>
                  </Stat>
                </GridItem>
              </Grid>
            </>
          )}
        </Container>
      </Box>
    </Layout>
  );
};
