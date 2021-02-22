import React from "react";
import { Heading, Center, Container, Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@chakra-ui/react";

import Changelog from "../../common/components/Changelog/Changelog";
import content from "../../CHANGELOG";
import Layout from "../layout/Layout";
import { NavLink } from "react-router-dom";

const Journal = () => {
  return (
    <Layout>
      <Box bg="secondaryBackground" w="100%" pt={[4, 8]} px={[1, 24]}>
        <Container maxW="xl">
          <Breadcrumb>
            <BreadcrumbItem>
              <BreadcrumbLink as={NavLink} to="/">
                Accueil
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>Journal</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
        </Container>
      </Box>
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
