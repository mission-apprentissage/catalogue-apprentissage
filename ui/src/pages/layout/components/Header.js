import React from "react";
import { NavLink, useHistory } from "react-router-dom";
import {
  Avatar,
  Box,
  Container,
  Flex,
  Image,
  Link,
  Menu,
  Heading,
  MenuButton,
  MenuItem,
  MenuList,
  MenuDivider,
  MenuGroup,
  Text,
} from "@chakra-ui/react";
import { List, ListItem, ListIcon, OrderedList, UnorderedList } from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt, faSync, faUsers } from "@fortawesome/free-solid-svg-icons";
import useAuth from "../../../common/hooks/useAuth";
import { isUserAdmin } from "../../../common/utils/rolesUtils";
import { _get } from "../../../common/httpClient";

const Header = () => {
  let [auth, setAuth] = useAuth();
  let history = useHistory();
  let logout = async () => {
    const { loggedOut } = await _get("/api/auth/logout");
    if (loggedOut) {
      setAuth(null);
      history.push("/");
    }
  };

  return (
    <Box>
      <Container maxW="xl">
        <Flex fontFamily="Marianne" alignItems="center" color="#1E1E1E">
          {/* Logo */}
          <Link as={NavLink} to="/" py={4}>
            <Image src="/brand/mariannev2.jpg" height={"15px"} width={"33px"} alt="Logo de la République Française" />
            <Text fontWeight="extrabold" fontSize="12px" fontStyle="normal">
              RÉPUBLIQUE FRANÇAISE{" "}
            </Text>
            <List as="i" fontSize="legal">
              <ListItem>Liberté</ListItem>
              <ListItem>Égalité</ListItem>
              <ListItem>Fraternité</ListItem>
            </List>
          </Link>
          <Box p={6} flex="1">
            <Heading as="h6" textStyle="h6">
              Catalogue des offres de formations en apprentissage
            </Heading>
          </Box>
          {/* User Menu */}
          {auth?.sub === "anonymous" && (
            <Box>
              <Link as={NavLink} to="/login">
                Connexion
              </Link>
            </Box>
          )}
          {auth?.sub !== "anonymous" && (
            <Menu placement="bottom">
              <MenuButton as={Link} _hover={{ textDecoration: "none" }}>
                <Flex>
                  <Avatar bg="blue.400" size="sm" />
                  <Box display={["none", "block"]} ml={2}>
                    <Text color="grey.700" fontSize="epsilon">
                      {auth.sub}
                    </Text>
                    <Text fontSize="omega" color="grey.500">
                      {isUserAdmin(auth) ? "Administrateur" : "Utilisateur"}
                    </Text>
                  </Box>
                </Flex>
              </MenuButton>
              <MenuList>
                {isUserAdmin(auth) && (
                  <>
                    <MenuGroup title="Administration">
                      <MenuItem as={NavLink} to="/admin/users" icon={<FontAwesomeIcon icon={faUsers} />}>
                        Gestion des utilisateurs
                      </MenuItem>
                    </MenuGroup>
                    <MenuDivider />
                    <MenuGroup title="Réconciliation">
                      <MenuItem as={NavLink} to="/couverture-parcoursup" icon={<FontAwesomeIcon icon={faSync} />}>
                        Réconciliation Parcoursup
                      </MenuItem>
                      <MenuItem as={NavLink} to="/couverture-affelnet" icon={<FontAwesomeIcon icon={faSync} />}>
                        Réconciliation Affelnet
                      </MenuItem>
                    </MenuGroup>
                  </>
                )}
                <MenuDivider />
                <MenuItem onClick={logout} icon={<FontAwesomeIcon icon={faSignOutAlt} />}>
                  Déconnexion
                </MenuItem>
              </MenuList>
            </Menu>
          )}
        </Flex>
      </Container>
    </Box>
  );
};

export default Header;
