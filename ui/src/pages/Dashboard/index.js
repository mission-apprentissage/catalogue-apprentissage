import React from "react";
import jwt from "jsonwebtoken";
import { Box, Container, Heading } from "@chakra-ui/react";

import Layout from "../layout/Layout";
import { setTitle } from "../../common/utils/pageUtils";
import { Breadcrumb } from "../../common/components/Breadcrumb";

export default () => {
  const METABASE_SITE_URL = `${process.env.REACT_APP_METABASE_URL ?? process.env.REACT_APP_BASE_URL}/metabase`;
  const METABASE_SECRET_KEY = process.env.REACT_APP_METABASE_SECRET_KEY;

  const payload = {
    resource: { dashboard: 1 },
    params: {},
    exp: Math.round(Date.now() / 1000) + 10 * 60, // 10 minutes
  };

  const token = jwt.sign(payload, METABASE_SECRET_KEY);
  const iframeURL = METABASE_SITE_URL + "/embed/dashboard/" + token + "#bordered=false&titled=false";

  const title = "Tableau de bord";
  setTitle(title);

  return (
    <Layout>
      <Box w="100%" pt={[4, 8]} px={[1, 1, 12, 24]}>
        <Container maxW="xl">
          <Breadcrumb pages={[{ title: "Accueil", to: "/" }, { title: title }]} />
          <Heading textStyle="h2" color="grey.800" mt={5}>
            {title}
          </Heading>
          {iframeURL && (
            <iframe
              src={iframeURL}
              frameBorder="0"
              style={{ height: "400vh", width: "100%" }}
              title="Statistiques Metabase"
              allowtransparency
            />
          )}
        </Container>
      </Box>
    </Layout>
  );
};
