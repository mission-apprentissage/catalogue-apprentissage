import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Link, Box, Flex, Text, Container, Menu, MenuList, MenuButton, MenuItem } from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faBars } from "@fortawesome/free-solid-svg-icons";

const NavigationMenu = (props) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);

  return (
    <NavBarContainer {...props}>
      <NavToggle toggle={toggle} isOpen={isOpen} />
      <NavLinks isOpen={isOpen} />
    </NavBarContainer>
  );
};

const NavToggle = ({ toggle, isOpen }) => {
  return (
    <Box display={{ base: "block", md: "none" }} onClick={toggle} py={4}>
      <FontAwesomeIcon icon={isOpen ? faTimes : faBars} size="2x" />
    </Box>
  );
};

const NavItem = ({ children, to = "/", ...rest }) => {
  const { pathname } = useLocation();
  const isActive = pathname === to;

  return (
    <Link
      mx={[0, 4]}
      _first={{ ml: 0 }}
      py={4}
      as={NavLink}
      to={to}
      color={isActive ? "bluefrance" : "grey.800"}
      borderBottom="3px solid"
      borderColor={isActive ? "bluefrance" : "transparent"}
      _hover={{ textDecoration: "none", color: "grey.800", bg: "grey.200" }}
    >
      <Text display="block" {...rest}>
        {children}
      </Text>
    </Link>
  );
};

const NavLinks = ({ isOpen }) => {
  const { pathname } = useLocation();
  const menuIsActive = ["/guide-reglementaire"].includes(pathname);

  return (
    <Box display={{ base: isOpen ? "block" : "none", md: "block" }} flexBasis={{ base: "100%", md: "auto" }}>
      <Flex
        align="center"
        justify={["center", "space-between", "flex-end", "flex-end"]}
        direction={["column", "row", "row", "row"]}
        pb={[8, 0]}
        textStyle="sm"
      >
        <NavItem to="/">Accueil</NavItem>
        {/*<NavItem to="/recherche/formations-2021">Mes actions expertes</NavItem>*/}
        <NavItem to="/recherche/formations-2021">Catalogue des formations en apprentissage 2021</NavItem>
        <NavItem to="/recherche/etablissements">Liste des établissements</NavItem>
        <NavItem to="/changelog">Journal des modifications</NavItem>
        <Menu placement="bottom">
          <MenuButton
            as={Link}
            mx={[0, 4]}
            fontWeight="400"
            display={{ base: "none", md: "block" }}
            py={4}
            color={menuIsActive ? "bluefrance" : "grey.800"}
            borderBottom="3px solid"
            borderColor={menuIsActive ? "bluefrance" : "transparent"}
            _hover={{ textDecoration: "none", color: "grey.800", bg: "grey.200" }}
          >
            Guides
          </MenuButton>
          <MenuList>
            <MenuItem as={NavLink} to="/guide-reglementaire">
              Guide réglementaire
            </MenuItem>
          </MenuList>
        </Menu>
        <NavItem display={{ base: "block", md: "none" }} to="/guide-reglementaire">
          Guide réglementaire
        </NavItem>
      </Flex>
    </Box>
  );
};

const NavBarContainer = ({ children, ...props }) => {
  return (
    <Box w="full" boxShadow="md">
      <Container maxW="xl">
        <Flex as="nav" align="center" justify="space-between" wrap="wrap" px={4} w="100%" {...props}>
          {children}
        </Flex>
      </Container>
    </Box>
  );
};

export default NavigationMenu;
