import React from "react";
import { NavLink, useHistory } from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Link,
  Menu,
  MenuButton,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuList,
  Text,
} from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt, faSync, faUpload, faUsers } from "@fortawesome/free-solid-svg-icons";
import useAuth from "../../../common/hooks/useAuth";
import { isUserAdmin } from "../../../common/utils/rolesUtils";
import { _get } from "../../../common/httpClient";
import { LockFill } from "../../../theme/components/icons/LockFill";
import { Logo } from "./Logo";

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
    <Container maxW={"full"} borderBottom={"1px solid"} borderColor={"grey.400"}>
      <Container maxW="xl" py={2}>
        <Flex alignItems="center" color="grey.800">
          {/* Logo */}
          <Link as={NavLink} to="/">
            <Logo />
          </Link>

          <Box p={6} flex="1">
            <Heading as="h6" textStyle="h6">
              Catalogue des offres de formations en apprentissage
            </Heading>
          </Box>
          {/* User Menu */}
          {auth?.sub === "anonymous" && (
            <Box>
              <Link as={NavLink} to="/login" variant="pill">
                <LockFill boxSize={3} mb={1} mr={2} />
                Connexion
              </Link>
            </Box>
          )}
          {auth?.sub !== "anonymous" && (
            <Menu placement="bottom">
              <MenuButton as={Button} variant="pill">
                <Flex>
                  <Avatar bg="bluefrance" size="sm" w="13px" h="13px" mt="0.4rem" />
                  <Box display={["none", "block"]} ml={2}>
                    <Text color="bluefrance" textStyle="sm">
                      {auth.sub}{" "}
                      <Text color="grey.600" as="span">
                        ({isUserAdmin(auth) ? "admin" : "Utilisateur"})
                      </Text>
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
                      <MenuItem as={NavLink} to="/admin/upload" icon={<FontAwesomeIcon icon={faUpload} />}>
                        Upload de fichiers
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
    </Container>
  );
};

export default Header;
