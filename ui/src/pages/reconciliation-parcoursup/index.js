import React from "react";
import {
  Box,
  Container,
  Accordion,
  SimpleGrid,
  Button,
  Heading,
  Text,
  Flex,
  Spacer,
  Select,
  Tag,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  HStack,
  StatArrow,
} from "@chakra-ui/react";
import { Layout, Accordion as Item, Loading } from "./components";

import { _get } from "../../common/httpClient";

import { useQuery } from "react-query";
import AppLayout from "../layout/Layout";
import { NavLink } from "react-router-dom";

const matchingType = [1, 2, 3, 4, 5, 6, 7];

const StyledButton = ({ type, matching, size, toggleMatching, ...rest }) => {
  return (
    <Button
      colorScheme="teal"
      variant="outline"
      size="sm"
      onClick={() => toggleMatching({ type })}
      isActive={type === matching ? true : false}
      {...rest}
    >
      {type}
    </Button>
  );
};

export default (props) => {
  const [matching, setMatching] = React.useState({
    type: 3,
    page: 1,
  });

  const { data, isLoading, isError } = useQuery(
    ["coverage", { type: matching.type, page: matching.page }],
    ({ queryKey }) => {
      return _get(`/api/parcoursup?type=${queryKey[1].type}&page=${queryKey[1].page}`);
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  const stat = useQuery("statistique", () => _get("/api/parcoursup/statistique"), {
    refetchOnWindowFocus: false,
  });

  const toggleMatching = (values) =>
    setMatching({ type: values.type ? values.type : matching.type, page: values.page ? values.page : matching.page });

  return (
    <AppLayout>
      <Box bg="secondaryBackground" w="100%" pt={[4, 8]} px={[1, 24]}>
        <Container maxW="xl">
          <Breadcrumb>
            <BreadcrumbItem>
              <BreadcrumbLink as={NavLink} to="/">
                Accueil
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>Réconciliation Parcoursup 2021</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
        </Container>
      </Box>
      <Layout>
        <Box p={5} bg="#e5edef">
          <Flex>
            <Box>
              <Heading>Page de réconciliation Parcoursup 2021</Heading>
              <Text fontSize="sm">
                Interface de rapprochement des formations Parcoursup avec les établissements du catalogue
              </Text>
            </Box>
            <Spacer />
            {!stat.isLoading && !stat.isError && (
              <Box>
                <Text align="right">
                  <Tag colorScheme="teal">{stat.data.total}</Tag> formations
                </Text>
                <Text align="right">
                  <Tag colorScheme="teal">
                    {stat.data.reconciled[0]} - {stat.data.reconciled[1]}%
                  </Tag>{" "}
                  formations réconciliées
                </Text>
                <Text align="right">
                  <Tag colorScheme="teal">
                    {stat.data.covered[0]} - {stat.data.covered[1]}%
                  </Tag>{" "}
                  formations rapprochées avec le catalogue
                </Text>
              </Box>
            )}
          </Flex>
        </Box>
        <Container maxW="full" bg="#e5edef">
          <Box m={5}>
            <Flex align="center" justify="center">
              <Heading size="md" mr="3">
                Filtre matching :
              </Heading>
              <HStack clo spacing={4}>
                {matchingType.map((match, index) => (
                  <StyledButton key={index} type={match} matching={matching.type} toggleMatching={toggleMatching} />
                ))}
              </HStack>
            </Flex>
          </Box>
          {isError && (
            <Flex justify="center">
              <Text>Aucune donnée disponible</Text>
            </Flex>
          )}
          {isLoading && (
            <Layout>
              <Loading />
            </Layout>
          )}
          {data?.docs?.length > 0 && (
            <>
              <Container maxW="full">
                <Flex align="center">
                  <Heading size="md">
                    Formation parcoursup : matching <Tag colorScheme="teal">{matching.type}</Tag> — {data.total}{" "}
                    formations disponibles
                  </Heading>
                  <Spacer />
                  {[...Array(data.pages).keys()].length > 1 && (
                    <Flex align="center">
                      <Text mr="6">Page:</Text>
                      <Select
                        variant="filled"
                        value={data.page}
                        onChange={(e) => toggleMatching({ page: e.target.value })}
                      >
                        {[...Array(data.pages).keys()].map((key, index) => {
                          const currentPage = key + 1;
                          return (
                            <option key={index} value={currentPage}>
                              {currentPage}
                            </option>
                          );
                        })}
                      </Select>
                      <Text ml="3">sur</Text>
                      <Heading size="sm" ml="2">
                        {data.pages}
                      </Heading>
                    </Flex>
                  )}
                </Flex>
              </Container>
              <Accordion allowToggle>
                {data.docs.map((item, index) => {
                  return <Item data={item} key={index} />;
                })}
              </Accordion>
            </>
          )}
        </Container>
      </Layout>
    </AppLayout>
  );
};
