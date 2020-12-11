import React from "react";
import { Box, Container, Accordion, SimpleGrid, Button, Heading, Text, Flex } from "@chakra-ui/react";
import { Layout, Accordion as Item, Loading } from "./components";

import { _get } from "../../common/httpClient";

const StyledButton = ({ type, matching, setMatching }) => {
  return (
    <Button
      bg="#0c5076"
      variant={type === matching ? "solid" : "outline"}
      color="white"
      onClick={() => setMatching(type)}
    >
      {type}
    </Button>
  );
};

function PageReconciliation() {
  const [coverage, setCoverage] = React.useState();
  const [matching, setMatching] = React.useState(3);
  const [loading, setLoading] = React.useState(false);

  async function getCoverage(type) {
    setLoading(true);
    const response = await _get(`http://localhost/api/coverage?type=${type}`);
    setCoverage(response);
    setLoading(false);
  }

  const toggleMatching = (value) => setMatching(value);

  React.useEffect(() => {
    getCoverage(matching);
  }, [matching]);

  if (!coverage) {
    return (
      <Layout>
        <Loading />
      </Layout>
    );
  }

  return (
    <Layout>
      <Box p={5} bg="#0c5076">
        <Heading color="white">Page de réconciliation</Heading>
        <Text color="white" fontSize="sm">
          Interface de rapprochement des formations Parcoursup avec les établissements du{" "}
          <a href="https://mna-admin-prod.netlify.app/" target="_blank">
            catalogue
          </a>
        </Text>
      </Box>
      <Container maxW="full" bg="lightgrey">
        <Box m={5}>
          <SimpleGrid columns={1} spacing={15}>
            <Flex justify="center">
              <Button disabled variant="ghost">
                Filtre Matching :
              </Button>
              <SimpleGrid columns={6} spacing={6}>
                <StyledButton type="3" matching={matching} setMatching={toggleMatching} />
                <StyledButton type="4" matching={matching} setMatching={toggleMatching} />
                <StyledButton type="5" matching={matching} setMatching={toggleMatching} />
                <StyledButton type="6" matching={matching} setMatching={toggleMatching} />
              </SimpleGrid>
            </Flex>
          </SimpleGrid>
        </Box>
        {loading && (
          <Layout>
            <Loading />
          </Layout>
        )}
        {coverage && (
          <>
            <Container maxW="full">
              <Text as="u" fontSize="lg">
                Formation parcoursup : matching {matching}* ({coverage.length} formations)
              </Text>
            </Container>

            <Accordion allowToggle>
              {coverage.map((item, index) => (
                <Item data={item} key={index} />
              ))}
            </Accordion>
          </>
        )}
      </Container>
    </Layout>
  );
}

export default PageReconciliation;
