import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Link, Box, Flex, Text, Container, Menu, MenuList, MenuButton, MenuItem } from "@chakra-ui/react";
import useAuth from "../../../common/hooks/useAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faBars, faHome, faCube } from "@fortawesome/free-solid-svg-icons";

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
      color={isActive ? "blue.500" : "grey.500"}
      borderBottom="1px solid"
      borderColor={isActive ? "blue.500" : "transparent"}
      _hover={{ textDecoration: "none", color: "grey.600", borderColor: "grey.600" }}
    >
      <Text display="block" {...rest}>
        {children}
      </Text>
    </Link>
  );
};

const NavLinks = ({ isOpen }) => {
  const [auth] = useAuth();
  const { pathname } = useLocation();
  const menuIsActive = ["/guide-reglementaire", "/guide-signalements", "/guide-modification"].includes(pathname);

  return (
    <Box display={{ base: isOpen ? "block" : "none", md: "block" }} flexBasis={{ base: "100%", md: "auto" }}>
      <Flex
        align="center"
        justify={["center", "space-between", "flex-end", "flex-end"]}
        direction={["column", "row", "row", "row"]}
        pb={[8, 0]}
      >
        <NavItem to="/">
          <FontAwesomeIcon icon={faHome} /> Accueil
        </NavItem>
        <NavItem to="/recherche/formations-2021">
          <FontAwesomeIcon icon={faCube} /> Formations 2021
        </NavItem>
        {/*<MenuItem to="/recherche/formations-2020">Formations 2020</MenuItem>*/}
        <NavItem to="/recherche/etablissements">
          <FontAwesomeIcon icon={faCube} /> Établissements
        </NavItem>
        <Menu placement="bottom">
          <MenuButton
            as={Link}
            mx={[0, 4]}
            fontWeight="400"
            display={{ base: "none", md: "block" }}
            py={4}
            color={menuIsActive ? "blue.500" : "grey.500"}
            borderBottom="1px solid"
            borderColor={menuIsActive ? "blue.500" : "transparent"}
            _hover={{ textDecoration: "none", color: "grey.600", borderColor: "grey.600" }}
          >
            Guides
          </MenuButton>
          <MenuList>
            <MenuItem as={NavLink} to="/guide-reglementaire">
              Guide réglementaire
            </MenuItem>
            <MenuItem as={NavLink} to="/guide-signalements">
              Guide de signalements
            </MenuItem>
            {auth?.sub !== "anonymous" && (
              <MenuItem as={NavLink} to="/guide-modification">
                Guide d'utilisation
              </MenuItem>
            )}
          </MenuList>
        </Menu>
        <NavItem display={{ base: "block", md: "none" }} to="/guide-reglementaire">
          Guide réglementaire
        </NavItem>
        <NavItem display={{ base: "block", md: "none" }} to="/guide-signalements">
          Guide de signalements
        </NavItem>
        {auth?.sub !== "anonymous" && (
          <NavItem display={{ base: "block", md: "none" }} to="/guide-modification">
            Guide d'utilisation
          </NavItem>
        )}
      </Flex>
    </Box>
  );
};

const NavBarContainer = ({ children, ...props }) => {
  return (
    <Container maxW="xl">
      <Flex as="nav" align="center" justify="space-between" wrap="wrap" px={4} w="100%" {...props}>
        {children}
      </Flex>
    </Container>
  );
};

export default NavigationMenu;
