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
} from "@chakra-ui/react";
import { Layout, Accordion as Item, Loading } from "./components";

import { _get } from "../../common/httpClient";

import { useQuery } from "react-query";
import AppLayout from "../layout/Layout";

const StyledButton = ({ type, matching, size, toggleMatching, ...rest }) => {
  return (
    <Button
      color="white"
      variant="solid"
      colorScheme="purple"
      size={size ? size : "sm"}
      onClick={() => toggleMatching({ type })}
      isActive={type === matching ? true : false}
      {...rest}
    >
      {type}
    </Button>
  );
};

export default () => {
  const [matching, setMatching] = React.useState({
    type: 3,
    page: 1,
  });

  const { data, isLoading, isError } = useQuery(
    ["coverage", { type: matching.type, page: matching.page }],
    ({ queryKey }) => {
      return _get(`/api/psformation?type=${queryKey[1].type}&page=${queryKey[1].page}`);
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  const toggleMatching = (values) =>
    setMatching({ type: values.type ? values.type : matching.type, page: values.page ? values.page : matching.page });

  return (
    <AppLayout>
      <Layout>
        <Box p={5} bg="#0c5076">
          <Heading color="white">Page de réconciliation</Heading>
          <Text color="white" fontSize="sm">
            Interface de rapprochement des formations Parcoursup avec les établissements du catalogue
          </Text>
        </Box>
        <Container maxW="full" bg="lightgrey">
          <Box m={5}>
            <SimpleGrid columns={1}>
              <Flex align="center" justify="center">
                <Heading size="md" mr="3">
                  Filtre matching :
                </Heading>
                <SimpleGrid columns={6} spacing={4}>
                  <StyledButton type={1} matching={matching.type} toggleMatching={toggleMatching} />
                  <StyledButton type={2} matching={matching.type} toggleMatching={toggleMatching} />
                  <StyledButton type={3} matching={matching.type} toggleMatching={toggleMatching} />
                  <StyledButton type={4} matching={matching.type} toggleMatching={toggleMatching} />
                  <StyledButton type={5} matching={matching.type} toggleMatching={toggleMatching} />
                  <StyledButton type={6} matching={matching.type} toggleMatching={toggleMatching} />
                </SimpleGrid>
              </Flex>
            </SimpleGrid>
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
                    Formation parcoursup : matching <Tag colorScheme="purple">{matching.type}</Tag> — {data.total}{" "}
                    formations disponibles
                  </Heading>
                  <Spacer />
                  {[...Array(data.pages).keys()].length === 1 ? (
                    ""
                  ) : (
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
