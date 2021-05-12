import React from "react";
// import { useFetch } from "../../common/hooks/useFetch";
import { Box, Container, Heading } from "@chakra-ui/react";
import Layout from "../layout/Layout";
// import StatGrid from "../../common/components/StatGrid";
import jwt from "jsonwebtoken";

export default () => {
  // const [data, loading] = useFetch("api/stats");

  const METABASE_SITE_URL = `${process.env.REACT_APP_BASE_URL}/metabase`;
  const METABASE_SECRET_KEY = process.env.REACT_APP_METABASE_SECRET_KEY;

  const payload = {
    resource: { dashboard: 1 },
    params: {},
    exp: Math.round(Date.now() / 1000) + 10 * 60, // 10 minutes
  };
  const token = jwt.sign(payload, METABASE_SECRET_KEY);

  const iframeUrl = METABASE_SITE_URL + "/embed/dashboard/" + token + "#bordered=true&titled=true";

  return (
    <Layout>
      <Box bg="secondaryBackground" w="100%" py={[1, 8]} px={[1, 24]}>
        <Container maxW="xl">
          <Heading as="h1" mb={8} mt={2}>
            Tableau de bord
          </Heading>
          <iframe src={iframeUrl} frameBorder="0" width="100%" height="100%" allowtransparency="true"></iframe>
          {/* {loading && "Chargement des données..."}
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
          )} */}
        </Container>
      </Box>
    </Layout>
  );
};
