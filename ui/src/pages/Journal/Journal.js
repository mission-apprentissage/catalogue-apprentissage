import React from "react";
import { Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Center, Container, Heading } from "@chakra-ui/react";

import Changelog from "../../common/components/Changelog/Changelog";
import content from "../../CHANGELOG";
import Layout from "../layout/Layout";
import { NavLink } from "react-router-dom";

const Journal = () => {
  return (
    <Layout>
      <Box w="100%" pt={[4, 8]} px={[1, 24]} color="grey.800">
        <Container maxW="xl">
          <Breadcrumb>
            <BreadcrumbItem>
              <BreadcrumbLink as={NavLink} to="/" fontSize="omega">
                Accueil
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink fontSize="omega">Journal</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
        </Container>
      </Box>
      <Center flexDir="column" py={[1, 8]} px={[1, 24]}>
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
