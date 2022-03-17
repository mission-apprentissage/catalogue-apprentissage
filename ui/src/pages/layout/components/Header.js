import React from "react";
import { NavLink, useHistory } from "react-router-dom";
import {
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
import useAuth from "../../../common/hooks/useAuth";
import { isUserAdmin, hasAccessTo } from "../../../common/utils/rolesUtils";
import { _get } from "../../../common/httpClient";
import { LockFill } from "../../../theme/components/icons/LockFill";
import { Logo } from "./Logo";
import AlertMessage from "./AlertMessage";
import { AccountFill, DoubleArrows, DownloadLine, InfoCircle } from "../../../theme/components/icons";

const Header = () => {
  const [auth, setAuth] = useAuth();
  const history = useHistory();

  let logout = async () => {
    const anonymous = await _get("/api/auth/logout");
    if (anonymous) {
      setAuth(anonymous);
      history.push("/");
    }
  };

  return (
    <>
      <AlertMessage />
      <Container maxW={"full"} borderBottom={"1px solid"} borderColor={"grey.400"} px={[0, 0, 4]}>
        <Container maxW="xl" py={[0, 0, 2]} px={[0, 0, 4]}>
          <Flex alignItems="center" color="grey.800">
            {/* Logo */}
            <Link as={NavLink} to="/" p={[4, 4, 0]}>
              <Logo />
            </Link>

            <Box p={[1, 1, 6]} flex="1">
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
                <MenuButton as={Button} variant="pill" aria-label={`compte de ${auth.sub}`}>
                  <Flex>
                    <AccountFill color={"bluefrance"} mt="0.3rem" boxSize={4} />
                    <Box display={["none", "none", "block"]} ml={2}>
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
                  <MenuGroup title="Administration">
                    {hasAccessTo(auth, "page_gestion_utilisateurs") && (
                      <MenuItem as={NavLink} to="/admin/users" icon={<AccountFill boxSize={4} />}>
                        Gestion des utilisateurs
                      </MenuItem>
                    )}
                    {hasAccessTo(auth, "page_gestion_roles") && (
                      <MenuItem as={NavLink} to="/admin/roles" icon={<AccountFill boxSize={4} />}>
                        Gestion des rôles
                      </MenuItem>
                    )}
                    {hasAccessTo(auth, "page_upload") && (
                      <MenuItem as={NavLink} to="/admin/upload" icon={<DownloadLine boxSize={4} />}>
                        Upload de fichiers
                      </MenuItem>
                    )}
                    {hasAccessTo(auth, "page_message_maintenance") && (
                      <MenuItem as={NavLink} to="/admin/alert" icon={<InfoCircle boxSize={4} />}>
                        Message de maintenance
                      </MenuItem>
                    )}
                  </MenuGroup>
                  <MenuDivider />
                  <MenuGroup title="Réconciliation">
                    {hasAccessTo(auth, "page_reconciliation_ps") && (
                      <MenuItem as={NavLink} to="/couverture-ps" icon={<DoubleArrows boxSize={4} />}>
                        Réconciliation Parcoursup
                      </MenuItem>
                    )}
                  </MenuGroup>

                  <MenuDivider />
                  <MenuItem onClick={logout}>Déconnexion</MenuItem>
                </MenuList>
              </Menu>
            )}
          </Flex>
        </Container>
      </Container>
    </>
  );
};

export default Header;
