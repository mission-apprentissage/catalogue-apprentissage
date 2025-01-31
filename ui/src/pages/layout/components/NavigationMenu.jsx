import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Box, Container, Flex, Link, Text } from "@chakra-ui/react";
import useAuth from "../../../common/hooks/useAuth";
import { hasAccessTo, hasOnlyOneAcademyRight, isUserAdmin } from "../../../common/utils/rolesUtils";
import { MenuFill, Close } from "../../../theme/components/icons";
import { ACADEMIES } from "../../../constants/academies";

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

const NavItem = ({ children, to = "/", exact, ...rest }) => {
  const { pathname } = useLocation();
  const isActive = exact ? pathname === to : pathname.includes(to);

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
  const [auth] = useAuth();

  let suffixCatalogue = "?";
  if (hasAccessTo(auth, "page_catalogue/voir_filtres_ps") && !hasAccessTo(auth, "page_catalogue/voir_filtres_aff")) {
    suffixCatalogue += `parcoursup_perimetre=%5B"Oui"%5D`;
  } else if (
    hasAccessTo(auth, "page_catalogue/voir_filtres_aff") &&
    !hasAccessTo(auth, "page_catalogue/voir_filtres_ps")
  ) {
    suffixCatalogue += `affelnet_perimetre=%5B"Oui"%5D`;
  }

  if (hasOnlyOneAcademyRight(auth)) {
    suffixCatalogue += `&nom_academie=%5B"${ACADEMIES[auth.academie]?.nom_academie}"%5D`;
  }

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
        {/* <NavItem to="/" exact>
          Accueil
        </NavItem> */}
        <NavItem to={`/recherche/formations${suffixCatalogue}`}>Catalogue</NavItem>
        <NavItem to="/recherche/etablissements">Organismes</NavItem>

        {hasAccessTo(auth, "page_console/affelnet") && (
          <NavItem to="/consoles-pilotage/affelnet">Console Affelnet</NavItem>
        )}
        {hasAccessTo(auth, "page_console/parcoursup") && (
          <NavItem to="/consoles-pilotage/parcoursup">Console Parcoursup</NavItem>
        )}

        {(hasAccessTo(auth, "page_perimetre/affelnet") || hasAccessTo(auth, "page_perimetre/affelnet_academie")) && (
          <NavItem to="/regles-perimetre/affelnet">Périmètre Affelnet</NavItem>
        )}
        {(hasAccessTo(auth, "page_perimetre/parcoursup") ||
          hasAccessTo(auth, "page_perimetre/parcoursup_academie")) && (
          <NavItem to="/regles-perimetre/parcoursup">Périmètre Parcoursup</NavItem>
        )}

        {hasAccessTo(auth, "page_mode_emploi/parcoursup") && (
          <NavItem to="/mode-emploi/parcoursup">Mode d'emploi Parcoursup</NavItem>
        )}
        {/* {hasAccessTo(auth, "page_mode_emploi/affelnet") && (
          <NavItem to="/mode-emploi/affelnet">Mode d'emploi Affelnet</NavItem>
        )} */}

        {isUserAdmin(auth) && <NavItem to="/changelog">Journal</NavItem>}
      </Flex>
    </Box>
  );
};

const NavBarContainer = ({ children, ...props }) => {
  return (
    <Box w="full" boxShadow="md">
      <Container maxW="7xl">
        <Flex as="nav" align="center" justify="space-between" wrap="wrap" w="100%" {...props}>
          {children}
        </Flex>
      </Container>
    </Box>
  );
};

export default NavigationMenu;
