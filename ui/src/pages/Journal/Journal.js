import React from "react";
import { Box, Center, Container, Heading } from "@chakra-ui/react";
import Changelog from "../../common/components/Changelog/Changelog";
import content from "../../CHANGELOG";
import Layout from "../layout/Layout";
import { Breadcrumb } from "../../common/components/Breadcrumb";

const Journal = () => {
  return (
    <Layout>
      <Box w="100%" pt={[4, 8]} px={[1, 1, 12, 24]} color="grey.800">
        <Container maxW="xl">
          <Breadcrumb pages={[{ title: "Accueil", to: "/" }, { title: "Journal" }]} />
        </Container>
      </Box>
      <Center flexDir="column" py={[1, 8]} px={[1, 1, 12, 24]}>
        <Heading as="h1" color="grey.800" mb={[4, 8]} px={[5, 0]}>
          Journal des modifications
        </Heading>
        <Container maxW="md">
          <Changelog content={content} />
        </Container>
      </Center>
    </Layout>
  );
};

export default Journal;
