import React from "react";
import { Box, Container, Flex, Link, List, ListItem, Text } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import { Logo } from "./Logo";

const Footer = () => {
  return (
    <Box borderTop="1px solid" borderColor="#CECECE" color="#1E1E1E" fontSize="zeta" w="full" mt={4}>
      <Container maxW="7xl">
        <Flex flexDirection={["column", "column", "row"]}>
          <Link as={NavLink} to="/" py={4} w={["100%", "100%", "50%"]}>
            <Logo size={"xl"} />
          </Link>
          <Box alignSelf="center" flex="1">
            <Text>
              Mandatée par les ministres en charge de l’éducation nationale, de l’enseignement supérieur, du travail et
              de la transformation publique, la{" "}
              <Link
                href={"https://beta.gouv.fr/startups/?incubateur=mission-apprentissage"}
                textDecoration={"underline"}
                isExternal
              >
                Mission interministérielle pour l'apprentissage
              </Link>{" "}
              développe plusieurs services destinés à faciliter les entrées en apprentissage.
            </Text>
            <br />
            <List textStyle="sm" fontWeight="700" flexDirection={"row"} flexWrap={"wrap"} mb={[3, 3, 0]} display="flex">
              <ListItem>
                <Link href="https://www.legifrance.gouv.fr/" mr={4} isExternal>
                  legifrance.gouv.fr
                </Link>
              </ListItem>
              <ListItem>
                <Link href="https://www.gouvernement.fr/" mr={4} isExternal>
                  gouvernement.fr
                </Link>
              </ListItem>
              <ListItem>
                <Link href="https://www.service-public.fr/" mr={4} isExternal>
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
        <Container maxW="7xl" py={[3, 3, 5]}>
          <Flex flexDirection={["column", "column", "row"]}>
            <List
              textStyle="xs"
              flexDirection={"row"}
              flexWrap={"wrap"}
              display="flex"
              flex="1"
              css={{ "li:not(:last-child):after": { content: "'|'", marginLeft: "0.5rem", marginRight: "0.5rem" } }}
            >
              <ListItem>
                <Link href={`${process.env.PUBLIC_URL}/sitemap.xml`}>Plan du site</Link>
              </ListItem>
              <ListItem>
                <Link as={NavLink} to={"/accessibilite"}>
                  Accessibilité : Non conforme
                </Link>
              </ListItem>
              <ListItem>
                <Link as={NavLink} to={"/mentions-legales"}>
                  Mentions légales
                </Link>
              </ListItem>
              {/*<ListItem>*/}
              {/*  <Link as={NavLink} to={"/donnees-personnelles"}>*/}
              {/*    Données personnelles*/}
              {/*  </Link>*/}
              {/*</ListItem>*/}
              <ListItem>
                <Link as={NavLink} to={"/cookies"}>
                  Gestion des cookies
                </Link>
              </ListItem>
              {/* <ListItem>
                <Link as={NavLink} to={"/stats"}>
                  Statistiques
                </Link>
              </ListItem> */}
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
                <Link as={NavLink} to={"/contact"}>
                  Contact
                </Link>
              </ListItem>
            </List>
            <Text textStyle="xs" mt={[2, 2, 0]}>
              © République française 2021
            </Text>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
};

export default Footer;
