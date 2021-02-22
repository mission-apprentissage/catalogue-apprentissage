import React from "react";
import { Container, Link, Box, Flex, Button, Text } from "@chakra-ui/react";
import packageJson from "../../../../package.json";
import { NavLink } from "react-router-dom";

const Footer = () => {
  return (
    <Box borderTop="1px solid" borderColor="grey.300" color="grey.600" fontSize="zeta">
      <Container maxW="xl" py={6}>
        <Flex
          flexDirection={["column", "row-reverse"]}
          justifyContent="space-between"
          alignItems={["center", "flex-start"]}
        >
          <Flex mb={[4, 0]} justifyContent={["center", "flex-start"]} wrap="wrap">
            <Link as={NavLink} to="/changelog" mr={4} mb={[2, 0]}>
              Journal des modifications
            </Link>
            <Link href="https://mission-apprentissage.gitbook.io/" mr={4} isExternal>
              Documentation
            </Link>
            <Button
              p={3}
              as={Link}
              colorScheme={"blue"}
              variant="outline"
              href="https://github.com/mission-apprentissage/catalogue-apprentissage"
              size="xs"
              mr={4}
              isExternal
              _hover={{ textDecoration: "none", bg: "blue.500", color: "white" }}
            >
              Code source
            </Button>
            <Link href="mailto:catalogue@apprentissage.beta.gouv.fr">Contact</Link>
          </Flex>
          <Flex flexDirection={["column", "row"]} alignItems={["center", "flex-start"]}>
            <Link href="https://beta.gouv.fr/startups/apprentissage.html" isExternal>
              Mission Nationale pour l&apos;apprentissage
            </Link>
            <Text as="span" color="grey.500" display={["none", "block"]}>
              &nbsp;-&nbsp;
            </Text>
            <Text as="span" color="grey.500">
              © {`${new Date().getFullYear()}`} - Version {packageJson.version}
            </Text>
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
};

export default Footer;
