import React from "react";
import { Box, Container, Link, Text } from "@chakra-ui/react";
import { Breadcrumb } from "../../common/components/Breadcrumb";
import Layout from "../layout/Layout";
import { setTitle } from "../../common/utils/pageUtils";

export default () => {
  const title = "Contact";
  setTitle(title);

  return (
    <Layout>
      <Box w="100%" pt={[4, 8]} px={[1, 1, 12, 24]}>
        <Container maxW="7xl">
          <Breadcrumb pages={[{ title: "Accueil", to: "/" }, { title: title }]} />
          <Text textStyle="h2" color="grey.800" mt={5}>
            {title}
          </Text>
          <Box mt={4}>
            <Text>
              Une remarque, un avis, une suggestion d’amélioration ?{" "}
              <Link href="mailto:catalogue@apprentissage.beta.gouv.fr" textDecoration={"underline"}>
                Contactez-nous !
              </Link>
            </Text>
          </Box>
        </Container>
      </Box>
    </Layout>
  );
};
