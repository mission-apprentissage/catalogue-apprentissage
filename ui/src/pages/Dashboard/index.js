import React from "react";
import jwt from "jsonwebtoken";
import { Box, Container, Heading } from "@chakra-ui/react";

import Layout from "../layout/Layout";

export default () => {
  const METABASE_SITE_URL = `${process.env.REACT_APP_BASE_URL}/metabase`;
  const METABASE_SECRET_KEY = process.env.REACT_APP_METABASE_SECRET_KEY;

  const payload = {
    resource: { dashboard: 1 },
    params: {},
    exp: Math.round(Date.now() / 1000) + 10 * 60, // 10 minutes
  };

  const token = jwt.sign(payload, METABASE_SECRET_KEY);
  const iframeURL = METABASE_SITE_URL + "/embed/dashboard/" + token + "#bordered=true&titled=true";

  return (
    <Layout>
      <Box bg="secondaryBackground" w="100%" py={[1, 8]} px={[1, 24]}>
        <Container maxW="xl">
          <Heading as="h1" mb={8} mt={2}>
            Tableau de bord
          </Heading>
          {iframeURL && (
            <iframe
              src={iframeURL}
              frameBorder="0"
              style={{ height: "100vh", width: "100%" }}
              allowtransparency="true"
              title="Statistiques Metabase"
            />
          )}
        </Container>
      </Box>
    </Layout>
  );
};
