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
  Text,
  HStack,
  Input,
  Stack,
  Flex,
  useToast,
  Tag,
  WrapItem,
  Wrap,
} from "@chakra-ui/react";
import { Breadcrumb } from "../../common/components/Breadcrumb";
import { setTitle } from "../../common/utils/pageUtils";
import ACL from "./acl";
import generator from "generate-password-browser";
import { useQuery } from "react-query";
import { ACADEMIES } from "../../constants/academies";
import { PasswordInput } from "../../common/components/PasswordInput";

const academies = new Map(Object.entries(ACADEMIES));

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

const UserLine = ({ user, roles }) => {
  const toast = useToast();
  const [rolesAcl, setRolesAcl] = useState(buildRolesAcl(user?.roles || [], roles));

  useEffect(() => {
    async function run() {
      setRolesAcl(buildRolesAcl(user?.roles || [], roles));
    }
    run();
  }, [roles, user?.roles]);

  const newTmpPassword = generator.generate({
    length: 10,
    numbers: true,
    lowercase: true,
    uppercase: true,
    strict: true,
  });

  const { values, handleSubmit, handleChange, setFieldValue } = useFormik({
    initialValues: {
      accessAllCheckbox: user?.isAdmin ? ["on"] : [],
      roles: user?.roles || [],
      acl: user?.acl || [],
      accessAcademieList: user ? user.academie.split(",") : ["-1"],
      newUsername: user?.username || "",
      newEmail: user?.email || "",
      newTag: user?.tag || "",
      newFonction: user?.fonction || "",
      newTmpPassword,
    },
    onSubmit: (
      {
        apiKey,
        accessAllCheckbox,
        accessAcademieList,
        newUsername,
        newEmail,
        newTmpPassword,
        newTag,
        newFonction,
        roles,
        acl,
      },
      { setSubmitting }
    ) => {
      return new Promise(async (resolve) => {
        const accessAcademie = accessAcademieList.join(",");
        const accessAll = accessAllCheckbox.includes("on");
        try {
          if (user) {
            const body = {
              username: newUsername,
              options: {
                academie: accessAcademie,
                email: newEmail,
                tag: newTag,
                fonction: newFonction,
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
                tag: newTag,
                fonction: newFonction,
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
          console.error(e);
          const response = await (e?.json ?? {});
          const message = response?.message ?? e?.message;

          toast({
            title: "Erreur",
            description: message,
            status: "error",
            duration: 10000,
            isClosable: true,
          });
        }

        setSubmitting(false);
        resolve("onSubmitHandler complete");
      });
    },
  });

  const onDeleteClicked = async (e) => {
    e.preventDefault();
    // eslint-disable-next-line no-restricted-globals
    if (confirm("Supprimer l'utilisateur !?")) {
      await _delete(`/api/admin/user/${user.username}`);
      document.location.reload(true);
    }
  };

  const handleAcademieChange = (academie) => {
    let newAcademieList = [];
    if (academie !== "-1") {
      if (values.accessAcademieList.includes(academie)) {
        newAcademieList = values.accessAcademieList.filter((a) => a !== academie);
      } else {
        newAcademieList = [...values.accessAcademieList.filter((academie) => academie !== "-1"), academie];
      }

      setFieldValue("accessAcademieList", newAcademieList);
    } else {
      if (values.accessAcademieList.includes(academie)) {
        newAcademieList = [];
      } else {
        newAcademieList = ["-1"];
      }
    }

    setFieldValue("accessAcademieList", newAcademieList);
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
          <PasswordInput
            id="newTmpPassword"
            name="newTmpPassword"
            value={values.newTmpPassword}
            onChange={handleChange}
          />
        </FormControl>
      )}

      <FormControl py={2}>
        <FormLabel>Tag</FormLabel>
        <Input type="text" id="newTag" name="newTag" value={values.newTag} onChange={handleChange} />
      </FormControl>

      <FormControl py={2}>
        <FormLabel>Fonction</FormLabel>
        <Input type="text" id="newFonction" name="newFonction" value={values.newFonction} onChange={handleChange} />
      </FormControl>

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
        <HStack wrap="wrap" spacing={"4%"}>
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
                        isChecked={
                          values.acl.includes(item.ref) ||
                          rolesAcl.includes(item.ref) ||
                          values?.accessAllCheckbox?.includes("on")
                        }
                        isDisabled={rolesAcl.includes(item.ref) || values?.accessAllCheckbox?.includes("on")}
                        fontWeight="bold"
                      >
                        {item.feature}
                      </Checkbox>
                    </Box>
                    <Wrap ml={5} pr={14} spacing={"4%"}>
                      {item.subFeatures?.map((subitem, j) => {
                        return (
                          <WrapItem key={`${i}_${j}`} w={"22%"} my={2}>
                            <Checkbox
                              name="acl"
                              onChange={handleChange}
                              value={subitem.ref}
                              isChecked={
                                values.acl.includes(subitem.ref) ||
                                rolesAcl.includes(subitem.ref) ||
                                values?.accessAllCheckbox?.includes("on")
                              }
                              isDisabled={rolesAcl.includes(subitem.ref) || values?.accessAllCheckbox?.includes("on")}
                            >
                              {subitem.feature}
                            </Checkbox>
                          </WrapItem>
                        );
                      })}
                    </Wrap>
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
            onChange={(event) => handleAcademieChange(event.target.value)}
            value={"-1"}
            isChecked={values.accessAcademieList.includes("-1")}
            mb={3}
          >
            Toutes
          </Checkbox>

          {[...academies.entries()]
            .sort(([, aValue], [, bValue]) => aValue.nom_academie.localeCompare(bValue.nom_academie))
            .map(([key]) => {
              return (
                <Checkbox
                  key={key}
                  name="accessAcademieList"
                  onChange={(event) => handleAcademieChange(event.target.value)}
                  value={key}
                  isChecked={values.accessAcademieList.includes(key)}
                  mb={3}
                >
                  {ACADEMIES[key].nom_academie} ({key})
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
  const { data: roles } = useQuery("roles", () => _get(`/api/admin/roles/`), {
    refetchOnWindowFocus: false,
  });

  const { data: users } = useQuery("users", () => _get(`/api/admin/users/`), {
    refetchOnWindowFocus: false,
  });

  const title = "Gestion des utilisateurs";
  setTitle(title);

  return (
    <Layout>
      <Box w="100%" pt={[4, 8]} px={[1, 1, 12, 24]} color="grey.800">
        <Container maxW="7xl">
          <Breadcrumb pages={[{ title: "Accueil", to: "/" }, { title: title }]} />
        </Container>
      </Box>
      <Box w="100%" minH="100vh" px={[1, 1, 12, 24]}>
        <Container maxW="7xl">
          <Text textStyle="h2" color="grey.800" mt={5} mb={5}>
            {title}
          </Text>

          <Stack spacing={2}>
            <Accordion bg="white" allowToggle>
              {roles && (
                <AccordionItem mb={12}>
                  <AccordionButton bg="bluefrance" color="white" _hover={{ bg: "blue.700" }}>
                    <Box flex="1" textAlign="left" fontSize="gamma">
                      Créer un utilisateur
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={4} border={"1px solid"} borderTop={0} borderColor={"bluefrance"}>
                    <UserLine user={null} roles={roles} />
                  </AccordionPanel>
                </AccordionItem>
              )}

              {roles &&
                users
                  ?.sort((a, b) => a.email.localeCompare(b.email))
                  ?.map((user) => {
                    return (
                      <AccordionItem key={user.email}>
                        {({ isExpanded }) => (
                          <>
                            <AccordionButton
                              _expanded={{ bg: "grey.200" }}
                              border={"1px solid"}
                              borderColor={"bluefrance"}
                              height="auto"
                            >
                              <Box flex="1" textAlign="left" fontSize={"delta"}>
                                {user.email}{" "}
                                {user.tag && (
                                  <Tag borderRadius="full" variant="subtle" colorScheme="orange" ml="2">
                                    {user.tag}
                                  </Tag>
                                )}
                                {user.isAdmin && (
                                  <Tag borderRadius="full" variant="subtle" colorScheme="red" ml="2">
                                    admin
                                  </Tag>
                                )}
                                {user.roles.map((role, index) => (
                                  <Tag key={index} borderRadius="full" variant="subtle" colorScheme="green" ml="2">
                                    {role}
                                  </Tag>
                                ))}
                                {!!user.acl?.length && (
                                  <Tag borderRadius="full" variant="subtle" colorScheme="blue" ml="2">
                                    Critères additionnels
                                  </Tag>
                                )}
                                <Text fontSize={"zeta"} color="lightgray">
                                  {user.fonction && <>{user.fonction}, </>}
                                  {user.created_at && <>créé le {new Date(user.created_at).toLocaleDateString()}</>}
                                  {user.created_at && user.last_connection && ", "}
                                  {user.last_connection && (
                                    <>dernière connexion le {new Date(user.last_connection).toLocaleDateString()}</>
                                  )}
                                </Text>
                              </Box>
                              <AccordionIcon />
                            </AccordionButton>
                            <AccordionPanel pb={4} border={"1px solid"} borderTop={0} borderColor={"bluefrance"}>
                              {isExpanded && <UserLine user={user} roles={roles} />}
                            </AccordionPanel>
                          </>
                        )}
                      </AccordionItem>
                    );
                  })}
            </Accordion>
          </Stack>
        </Container>
      </Box>
    </Layout>
  );
};
