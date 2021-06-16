import React, { useEffect, useState } from "react";
import { _delete, _get, _post, _put } from "../../common/httpClient";
import { useFormik } from "formik";
import Layout from "../layout/Layout";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Checkbox,
  Container,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Stack,
  Flex,
} from "@chakra-ui/react";
import { Breadcrumb } from "../../common/components/Breadcrumb";
import { setTitle } from "../../common/utils/pageUtils";
import ACL from "./acl";

const ACADEMIES = [
  "01",
  "02",
  "03",
  "04",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "22",
  "23",
  "24",
  "25",
  "27",
  "28",
  "31",
  "32",
  "33",
  "43",
  "70",
];

const buildRolesAcl = (newRoles, roles) => {
  let acl = [];
  for (let i = 0; i < newRoles.length; i++) {
    const selectedRole = newRoles[i];
    const selectedRoleAcl = roles.reduce((acc, curr) => {
      if (selectedRole === curr.name) return [...acc, ...curr.acl];
      return acc;
    }, []);
    acl = [...acl, ...selectedRoleAcl];
  }
  return acl;
};

const UserLine = ({ user }) => {
  const [rolesAcl, setRolesAcl] = useState([]);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    async function run() {
      const rolesList = await _get(`/api/admin/roles/`);
      setRoles(rolesList);

      setRolesAcl(buildRolesAcl(user?.roles || [], rolesList));
    }
    run();
  }, [user?.roles]);

  const { values, handleSubmit, handleChange, setFieldValue } = useFormik({
    initialValues: {
      accessAllCheckbox: user?.isAdmin ? ["on"] : [],
      roles: user?.roles || [],
      acl: user?.acl || [],
      accessAcademieList: user ? user.academie.split(",") : ["-1"],
      newUsername: user?.username || "",
      newEmail: user?.email || "",
      newTmpPassword: "1MotDePassTemporaire!",
    },
    onSubmit: (
      { apiKey, accessAllCheckbox, accessAcademieList, newUsername, newEmail, newTmpPassword, roles, acl },
      { setSubmitting }
    ) => {
      return new Promise(async (resolve, reject) => {
        const accessAcademie = accessAcademieList.join(",");
        const accessAll = accessAllCheckbox.includes("on");
        try {
          if (user) {
            const body = {
              username: newUsername,
              options: {
                academie: accessAcademie,
                email: newEmail,
                roles,
                acl,
                permissions: {
                  isAdmin: accessAll,
                },
              },
            };
            await _put(`/api/admin/user/${user.username}`, body);
            document.location.reload(true);
          } else {
            const body = {
              username: newUsername,
              password: newTmpPassword,
              options: {
                academie: accessAcademie,
                email: newEmail,
                roles,
                acl,
                permissions: {
                  isAdmin: accessAll,
                },
              },
            };
            await _post(`/api/admin/user/`, body);
            document.location.reload(true);
          }
        } catch (e) {
          console.log(e);
        }

        setSubmitting(false);
        resolve("onSubmitHandler complete");
      });
    },
  });

  const onDeleteClicked = async (e) => {
    e.preventDefault();
    // eslint-disable-next-line no-restricted-globals
    if (confirm("Delete user !?")) {
      await _delete(`/api/admin/user/${user.username}`);
      document.location.reload(true);
    }
  };

  const handleRoleChange = (roleName) => {
    let oldRolesAcl = [];
    oldRolesAcl = buildRolesAcl(values.roles, roles);

    let customAcl = [];
    for (let i = 0; i < values.acl.length; i++) {
      const currentAcl = values.acl[i];
      if (!oldRolesAcl.includes(currentAcl)) {
        customAcl.push(currentAcl);
      }
    }

    let newRolesAcl = [];
    let newRoles = [];
    if (values.roles.includes(roleName)) {
      newRoles = values.roles.filter((r) => r !== roleName);
      newRolesAcl = buildRolesAcl(newRoles, roles);
    } else {
      newRoles = [...values.roles, roleName];
      newRolesAcl = buildRolesAcl(newRoles, roles);
    }

    setFieldValue("acl", customAcl);
    setFieldValue("roles", newRoles);

    setRolesAcl(newRolesAcl);
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormControl py={2}>
        <FormLabel>Username</FormLabel>
        <Input type="text" id="newUsername" name="newUsername" value={values.newUsername} onChange={handleChange} />
      </FormControl>

      <FormControl py={2}>
        <FormLabel>Email</FormLabel>
        <Input type="email" id="newEmail" name="newEmail" value={values.newEmail} onChange={handleChange} />
      </FormControl>

      {!user && (
        <FormControl py={2}>
          <FormLabel>Mot de passe temporaire</FormLabel>
          <Input
            type="text"
            id="newTmpPassword"
            name="newTmpPassword"
            value={values.newTmpPassword}
            onChange={handleChange}
          />
        </FormControl>
      )}

      <FormControl py={2} mt={3}>
        <Checkbox
          name="accessAllCheckbox"
          id="accessAllCheckbox"
          isChecked={values.accessAllCheckbox.length > 0}
          onChange={handleChange}
          value="on"
          fontWeight={values.accessAllCheckbox.length > 0 ? "bold" : "normal"}
          color={"bluefrance"}
        >
          Admin
        </Checkbox>
      </FormControl>

      <FormControl py={2}>
        <FormLabel>Rôles</FormLabel>
        <HStack spacing={5}>
          {/* <Checkbox name="roles" onChange={handleRoleChange} value={"user"} isDisabled isChecked>
            user
          </Checkbox> */}

          {roles.map((role, i) => {
            return (
              <Checkbox
                name="roles"
                key={i}
                onChange={() => handleRoleChange(role.name)}
                value={role.name}
                isChecked={values.roles.includes(role.name)}
              >
                {role.name}
              </Checkbox>
            );
          })}
        </HStack>
      </FormControl>

      <Accordion bg="white" mt={3} allowToggle>
        <AccordionItem>
          <AccordionButton _expanded={{ bg: "grey.200" }} border={"none"}>
            <Box flex="1" textAlign="left" fontSize="sm">
              Droits d'accès Supplémentaire
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4} border={"none"} bg="grey.100">
            <Box mt={5} ml={5}>
              {ACL.map((item, i) => {
                return (
                  <Flex flexDirection="column" mb={5} key={i}>
                    <Box mb={2}>
                      <Checkbox
                        name="acl"
                        onChange={handleChange}
                        value={item.ref}
                        isChecked={values.acl.includes(item.ref) || rolesAcl.includes(item.ref)}
                        isDisabled={rolesAcl.includes(item.ref)}
                        fontWeight="bold"
                      >
                        {item.feature}
                      </Checkbox>
                    </Box>
                    <Flex ml={5} pr={14}>
                      {item.subFeatures?.map((subitem, j) => {
                        return (
                          <HStack spacing={5} ml={5} key={`${i}_${j}`}>
                            <Checkbox
                              name="acl"
                              onChange={handleChange}
                              value={subitem.ref}
                              isChecked={values.acl.includes(subitem.ref) || rolesAcl.includes(subitem.ref)}
                              isDisabled={rolesAcl.includes(subitem.ref)}
                            >
                              {subitem.feature}
                            </Checkbox>
                          </HStack>
                        );
                      })}
                    </Flex>
                  </Flex>
                );
              })}
            </Box>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>

      <FormControl py={2}>
        <FormLabel>Académies</FormLabel>
        <HStack wrap="wrap" spacing={5}>
          <Checkbox
            name="accessAcademieList"
            onChange={handleChange}
            value={"-1"}
            isChecked={values.accessAcademieList.includes("-1")}
            mb={3}
          >
            Toutes
          </Checkbox>

          {ACADEMIES.map((num, i) => {
            return (
              <Checkbox
                key={i}
                name="accessAcademieList"
                onChange={handleChange}
                value={num}
                isChecked={values.accessAcademieList.includes(num)}
                mb={3}
              >
                {num}
              </Checkbox>
            );
          })}
        </HStack>
      </FormControl>

      {user && (
        <Box>
          <Button type="submit" variant="primary" mr={5}>
            Enregistrer
          </Button>
          <Button variant="outline" colorScheme="red" borderRadius="none" onClick={onDeleteClicked}>
            Supprimer l'utilisateur
          </Button>
        </Box>
      )}
      {!user && (
        <Button type="submit" variant="primary">
          Créer l'utilisateur
        </Button>
      )}
    </form>
  );
};

export default () => {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    async function run() {
      const usersList = await _get(`/api/admin/users/`);
      setUsers(usersList);
    }
    run();
  }, []);

  const title = "Gestion des utilisateurs";
  setTitle(title);

  return (
    <Layout>
      <Box w="100%" pt={[4, 8]} px={[1, 1, 12, 24]} color="grey.800">
        <Container maxW="xl">
          <Breadcrumb pages={[{ title: "Accueil", to: "/" }, { title: title }]} />
        </Container>
      </Box>
      <Box w="100%" minH="100vh" px={[1, 1, 12, 24]}>
        <Container maxW="xl">
          <Heading as="h1" mb={8} mt={6}>
            {title}
          </Heading>
          <Stack spacing={2}>
            <Accordion bg="white" mb={12} allowToggle>
              <AccordionItem>
                <AccordionButton bg="bluefrance" color="white" _hover={{ bg: "blue.700" }}>
                  <Box flex="1" textAlign="left" fontSize="gamma">
                    Créer un utilisateur
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4} border={"1px solid"} borderTop={0} borderColor={"bluefrance"}>
                  <UserLine user={null} />
                </AccordionPanel>
              </AccordionItem>
            </Accordion>

            {users.map((userAttr, i) => {
              return (
                <Accordion bg="white" key={i} allowToggle>
                  <AccordionItem>
                    <AccordionButton _expanded={{ bg: "grey.200" }} border={"1px solid"} borderColor={"bluefrance"}>
                      <Box flex="1" textAlign="left" fontSize="gamma">
                        {userAttr.username}
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4} border={"1px solid"} borderTop={0} borderColor={"bluefrance"}>
                      <UserLine user={userAttr} />
                    </AccordionPanel>
                  </AccordionItem>
                </Accordion>
              );
            })}
          </Stack>
        </Container>
      </Box>
    </Layout>
  );
};
