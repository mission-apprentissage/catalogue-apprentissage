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
  MenuButton,
  MenuItem,
  MenuList,
  MenuDivider,
  MenuGroup,
  Text,
} from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faSignOutAlt, faSync, faUsers } from "@fortawesome/free-solid-svg-icons";
import useAuth from "../../../common/hooks/useAuth";
import { isUserAdmin } from "../../../common/utils/rolesUtils";

const Header = () => {
  let [auth, setAuth] = useAuth();
  let history = useHistory();
  let logout = () => {
    setAuth(null);
    history.push("/");
  };

  return (
    <Box borderBottom="1px solid" borderColor="grey.300">
      <Container maxW="xl">
        <Flex justifyContent="space-between">
          {/* Logo */}
          <Link as={NavLink} to="/" py={3}>
            <Image src="/brand/marianne.png" height={"5rem"} alt="Logo de la République Française" />
          </Link>

          {/* User Menu */}
          <Box alignSelf="center">
            {auth?.sub === "anonymous" && (
              <Link as={NavLink} to="/login">
                Connexion
              </Link>
            )}
            {auth?.sub !== "anonymous" && (
              <Menu placement="bottom">
                <MenuButton as={Link}>
                  <Flex alignItems="center">
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
                  <MenuItem as={NavLink} to="/" icon={<FontAwesomeIcon icon={faHome} />}>
                    Accueil
                  </MenuItem>
                  {isUserAdmin(auth) && (
                    <>
                      <MenuDivider />
                      <MenuGroup title="Administration">
                        <MenuItem as={NavLink} to="/admin/users" icon={<FontAwesomeIcon icon={faUsers} />}>
                          Utilisateurs
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
          </Box>
        </Flex>
      </Container>
    </Box>
  );
};

export default Header;
