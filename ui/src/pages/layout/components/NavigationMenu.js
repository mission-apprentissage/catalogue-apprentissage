import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Box, Container, Flex, Link, Text } from "@chakra-ui/react";
import useAuth from "../../../common/hooks/useAuth";
import { hasAccessTo } from "../../../common/utils/rolesUtils";
import { MenuFill, Close } from "../../../theme/components/icons";

const NavigationMenu = (props) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);

  return (
    <NavBarContainer {...props} position={"relative"}>
      <NavToggle toggle={toggle} isOpen={isOpen} />
      <NavLinks isOpen={isOpen} />
    </NavBarContainer>
  );
};

const NavToggle = ({ toggle, isOpen }) => {
  return (
    <Box
      display={{ base: "block", md: "none" }}
      onClick={toggle}
      py={4}
      position={isOpen ? "absolute" : "relative"}
      top={0}
    >
      {isOpen ? <Close boxSize={8} /> : <MenuFill boxSize={8} />}
    </Box>
  );
};

const NavItem = ({ children, to = "/", ...rest }) => {
  const { pathname } = useLocation();
  const isActive = pathname === to;

  return (
    <Link
      p={3}
      as={NavLink}
      to={to}
      color={isActive ? "bluefrance" : "grey.800"}
      _hover={{ textDecoration: "none", color: "grey.800", bg: "grey.200" }}
      borderBottom="3px solid"
      borderColor={isActive ? "bluefrance" : "transparent"}
    >
      <Text display="block" {...rest}>
        {children}
      </Text>
    </Link>
  );
};

const NavLinks = ({ isOpen }) => {
  let [auth] = useAuth();
  return (
    <Box display={{ base: isOpen ? "block" : "none", md: "block" }} flexBasis={{ base: "100%", md: "auto" }}>
      <Flex
        align="center"
        justify={["center", "center", "flex-end", "flex-end"]}
        direction={["column", "column", "row", "row"]}
        py={0}
        px={2}
        textStyle="sm"
      >
        <NavItem to="/">Accueil</NavItem>
        {hasAccessTo(auth, "page_actions_expertes") && <NavItem to="/mes-actions">Mes actions expertes</NavItem>}
        <NavItem to="/recherche/formations">Catalogue des formations en apprentissage</NavItem>
        <NavItem to="/recherche/etablissements">Liste des organismes</NavItem>
        <NavItem to="/changelog">Journal des modifications</NavItem>
      </Flex>
    </Box>
  );
};

const NavBarContainer = ({ children, ...props }) => {
  return (
    <Box w="full" boxShadow="md">
      <Container maxW="xl">
        <Flex as="nav" align="center" justify="space-between" wrap="wrap" w="100%" {...props}>
          {children}
        </Flex>
      </Container>
    </Box>
  );
};

export default NavigationMenu;
