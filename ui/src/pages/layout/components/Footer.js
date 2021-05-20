import React from "react";
import { Container, Link, Box, Flex, Text, List, ListItem, Image, Heading } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";

const Footer = () => {
  return (
    <Box borderTop="1px solid" borderColor="bluefrance" color="#1E1E1E" fontSize="zeta" w="full">
      <Container maxW="xl" py={6}>
        <Flex flexDirection={["column", "column", "row"]}>
          <Box w={["100%", "100%", "40rem"]}>
            <Link as={NavLink} to="/" py={4}>
              <Image
                src="/brand/mariannev2.jpg"
                height={"1.8rem"}
                width={"3.75rem"}
                alt="Logo de la République Française"
                fallback={<Box height={"1.8rem"} width={"3.75rem"} bg="grey.200" />}
              />
              <Heading as="h6" textStyle="h6">
                RÉPUBLIQUE FRANÇAISE
              </Heading>
              <List as="i" fontSize="legal">
                <ListItem>Liberté</ListItem>
                <ListItem>Égalité</ListItem>
                <ListItem>Fraternité</ListItem>
              </List>
            </Link>
          </Box>
          <Box alignSelf="center" flex="1">
            <Text>
              Texte optionnel 3 lignes maximum.
              <br /> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Consectetur et vel quam auctor semper.
              Cras si amet mollis dolor.
            </Text>
            <br />
            <List
              textStyle="sm"
              fontWeight="700"
              flexDirection={["column", "column", "row"]}
              display="flex"
              css={{ "li:not(:last-child):after": { content: "' '", marginLeft: "0.3rem", marginRight: "0.3rem" } }}
            >
              <ListItem>
                <Link href="https://www.legifrance.gouv.fr/" isExternal>
                  legifrance.gouv.fr
                </Link>
              </ListItem>
              <ListItem>
                <Link href="https://www.gouvernement.fr/" isExternal>
                  gouvernement.fr
                </Link>
              </ListItem>
              <ListItem>
                <Link href="https://www.service-public.fr/" isExternal>
                  service-public.fr
                </Link>
              </ListItem>
              <ListItem>
                <Link href="https://www.data.gouv.fr/fr/" isExternal>
                  data.gouv.fr
                </Link>
              </ListItem>
            </List>
          </Box>
        </Flex>
      </Container>
      <Box borderTop="1px solid" borderColor="#CECECE" color="#6A6A6A">
        <Container maxW="xl" py={5}>
          <Flex flexDirection={["column", "column", "row"]}>
            <List
              textStyle="sm"
              flexDirection={["column", "column", "row"]}
              display="flex"
              flex="1"
              css={{ "li:not(:last-child):after": { content: "'|'", marginLeft: "0.3rem", marginRight: "0.3rem" } }}
            >
              <ListItem>
                <Link as={NavLink} to={"/"}>
                  Plan du site
                </Link>
              </ListItem>
              <ListItem>Accessibilité : Non conforme</ListItem>
              <ListItem>
                <Link as={NavLink} to={"/"}>
                  Mentions légales
                </Link>
              </ListItem>
              <ListItem>
                <Link as={NavLink} to={"/"}>
                  Données personnelles
                </Link>
              </ListItem>
              <ListItem>
                <Link as={NavLink} to={"/"}>
                  Gestion des cookies
                </Link>
              </ListItem>
              <ListItem>
                <Link href="https://mission-apprentissage.gitbook.io/" isExternal>
                  Documentation
                </Link>
              </ListItem>
              <ListItem>
                <Link href="https://github.com/mission-apprentissage/catalogue-apprentissage" isExternal>
                  Code source
                </Link>
              </ListItem>
              <ListItem>
                <Link href="https://beta.gouv.fr/startups/apprentissage.html" isExternal>
                  Contact
                </Link>
              </ListItem>
            </List>
            <Flex flexDirection={["column", "column", "row"]}>
              <Text>© République française 2021</Text>
            </Flex>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
};

export default Footer;
