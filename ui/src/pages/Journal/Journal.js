import React from "react";
import { Heading, Center, Container } from "@chakra-ui/react";

import Changelog from "../../common/components/Changelog/Changelog";
import content from "../../CHANGELOG";
import Layout from "../layout/Layout";

const Journal = () => {
  return (
    <Layout>
      <Center flexDir="column" className="journal" bg="secondaryBackground">
        <Heading as="h1" my={5}>
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
