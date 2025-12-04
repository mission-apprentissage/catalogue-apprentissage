import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import { useFormik } from "formik";
import generator from "generate-password-browser";
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
  Flex,
  useToast,
  Tag,
  WrapItem,
  Wrap,
  Center,
  Spinner,
  TabPanels,
  Tab,
  TabList,
  Tabs,
  TabPanel,
  Select,
  FormErrorMessage,
} from "@chakra-ui/react";
import { Breadcrumb } from "../../common/components/Breadcrumb";
import { setTitle } from "../../common/utils/pageUtils";
import { _delete, _get, _patch, _post, _put } from "../../common/httpClient";
import { PasswordInput } from "../../common/components/PasswordInput";
import { useUserSearch } from "../../common/hooks/useUserSearch";
import SearchUser from "../../common/components/Search/SearchUser";
import { ACADEMIES } from "../../constants/academies";
import ACL from "./acl";

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

export const CardListUser = ({ user, roles, refreshSearch }) => {
  if (!user) {
    return;
  }
  return (
    <Accordion bg="white" allowToggle>
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
                {user.tag_1 && (
                  <Tag borderRadius="full" variant="subtle" colorScheme="yellow" ml="2">
                    {user.tag_1}
                  </Tag>
                )}
                {user.tag_2 && (
                  <Tag borderRadius="full" variant="subtle" colorScheme="yellow" ml="2">
                    {user.tag_2}
                  </Tag>
                )}
                {user.isAdmin && (
                  <Tag borderRadius="full" variant="subtle" colorScheme="red" ml="2">
                    admin
                  </Tag>
                )}
                {user.roles?.map((role, index) => (
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
                  {user.created_at && (
                    <>
                      créé le {new Date(user.created_at).toLocaleDateString()}
                      {user.created_by && <> par {user.created_by}</>}
                    </>
                  )}
                  {user.created_at && user.last_connection && ", "}
                  {user.last_connection && (
                    <>dernière connexion le {new Date(user.last_connection).toLocaleDateString()}</>
                  )}
                </Text>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4} border={"1px solid"} borderTop={0} borderColor={"bluefrance"}>
              {isExpanded && <UserLine user={user} roles={roles} refreshSearch={refreshSearch} />}
            </AccordionPanel>
          </>
        )}
      </AccordionItem>
    </Accordion>
  );
};

export const UserLine = ({ user, roles, refreshSearch }) => {
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

  const { values, touched, errors, isValid, handleSubmit, handleBlur, handleChange, setFieldValue } = useFormik({
    initialValues: {
      accessAllCheckbox: user?.isAdmin ? ["on"] : [],
      roles: user?.roles || [],
      acl: user?.acl || [],
      accessAcademieList: user ? user?.academie.split(",") : ["-1"],
      newUsername: user?.username || "",
      newEmail: user?.email || "",
      newTag1: user?.tag_1 || "",
      newTag2: user?.tag_2 || "",
      newFonction: user?.fonction || "",
      newTmpPassword,
    },
    validateOnMount: true,
    validateOnBlur: true,
    validateOnChange: true,
    validate: (values) => {
      const errors = {};

      if (!values.newUsername?.trim()?.length) {
        errors.newUsername = "Le nom d'utilisateur est obligatoire.";
      }

      if (
        !values.newEmail?.match(
          /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        )
      ) {
        errors.newEmail = "L'adresse email n'est pas valide.";
      }

      if (!values.newEmail?.trim()?.length) {
        errors.newEmail = "L'adresse email est obligatoire.";
      }

      if (!user && !values.newTmpPassword?.trim()?.length) {
        errors.newTmpPassword = "Le mot de passe temporaire est obligatoire.";
      }

      if (
        values.newTag1 !== "Autre" &&
        ![
          "SAIO / SRFD : adjoint chef de service",
          "SAIO / SRFD : chef de service",
          "SAIO / SRFD : chargé de mission ou assimilé",
        ].includes(values.newFonction?.trim())
      ) {
        errors.newFonction =
          'Pour le tag 1 sélectionné, la fonction est obligatoirement "SAIO / SRFD : adjoint chef de service", "SAIO / SRFD : chef de service" ou "SAIO / SRFD : chargé de mission ou assimilé".';
      }

      return errors;
    },

    onSubmit: (
      {
        // apiKey,
        accessAllCheckbox,
        accessAcademieList,
        newUsername,
        newEmail,
        newTmpPassword,
        newTag1,
        newTag2,
        newFonction,
        roles,
        acl,
      },
      { setSubmitting, resetForm }
    ) => {
      return new Promise(async (resolve) => {
        const accessAcademie = accessAcademieList.join(",");
        const accessAll = accessAllCheckbox.includes("on");
        try {
          if (user) {
            const body = {
              username: newUsername.trim(),
              options: {
                academie: accessAcademie,
                email: newEmail.trim(),
                tag_1: newTag1.trim(),
                tag_2: newTag2.trim(),
                fonction: newFonction.trim(),
                roles,
                acl,
                permissions: {
                  isAdmin: accessAll,
                },
              },
            };
            await _put(`/api/admin/user/${user?.username}`, body);
            toast({
              title: "Succès",
              description: "L'utilisateur a été mis à jour.",
              status: "success",
              duration: 9000,
              isClosable: true,
            });
            refreshSearch();
          } else {
            const body = {
              username: newUsername,
              password: newTmpPassword,
              options: {
                academie: accessAcademie,
                email: newEmail,
                tag_1: newTag1,
                tag_2: newTag2,
                fonction: newFonction,
                roles,
                acl,
                permissions: {
                  isAdmin: accessAll,
                },
              },
            };
            await _post(`/api/admin/user/`, body);
            toast({
              title: "Succès",
              description: "L'utilisateur a été créé.",
              status: "success",
              duration: 9000,
              isClosable: true,
            });
            resetForm();
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

  const onDeleteClicked = useCallback(
    async (e) => {
      e.preventDefault();
      // eslint-disable-next-line no-restricted-globals
      if (confirm("Supprimer l'utilisateur ?")) {
        try {
          await _delete(`/api/admin/user/${user?.username}`);
          toast({
            title: "Succès",
            description: "L'utilisateur a été supprimé.",
            status: "success",
            duration: 9000,
            isClosable: true,
          });
          refreshSearch();
        } catch (e) {
          toast({
            title: "Erreur",
            description: e.message,
            status: "error",
            duration: 9000,
            isClosable: true,
          });
          return;
        }
      }
    },
    [refreshSearch, toast, user?.username]
  );

  const onGenerateNewPasswordClicked = useCallback(
    async (e) => {
      e.preventDefault();
      if (
        // eslint-disable-next-line no-restricted-globals
        confirm(
          "Générer un nouveau mot de passe temporaire ? Un nouveau mot de passe provisoire sera envoyé par courriel à l’utilisateur, l’invitant à se connecter une première fois pour personnaliser son mot de passe."
        )
      ) {
        try {
          await _patch(`/api/admin/user/${user?.username}/regenerate-password`);
          toast({
            title: "Succès",
            description: "Un nouveau mot de passe temporaire a été envoyé par courriel à l’utilisateur.",
            status: "success",
            duration: 9000,
            isClosable: true,
          });
          refreshSearch();
        } catch (e) {
          toast({
            title: "Erreur",
            description: e.message,
            status: "error",
            duration: 9000,
            isClosable: true,
          });
          return;
        }
      }
    },
    [refreshSearch, toast, user?.username]
  );

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
    <form>
      <FormControl py={2} isInvalid={touched.newUsername && errors.newUsername}>
        <FormLabel>Username</FormLabel>
        <Input
          type="text"
          id="newUsername"
          name="newUsername"
          value={values.newUsername}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        <FormErrorMessage>{errors.newUsername}</FormErrorMessage>
      </FormControl>

      <FormControl py={2} isInvalid={touched.newEmail && errors.newEmail}>
        <FormLabel>Email</FormLabel>
        <Input
          type="email"
          id="newEmail"
          name="newEmail"
          value={values.newEmail}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        <FormErrorMessage>{errors.newEmail}</FormErrorMessage>
      </FormControl>

      {!user && (
        <FormControl py={2} isInvalid={touched.newTmpPassword && errors.newTmpPassword}>
          <FormLabel>Mot de passe temporaire</FormLabel>
          <PasswordInput
            id="newTmpPassword"
            name="newTmpPassword"
            value={values.newTmpPassword}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          <FormErrorMessage>{errors.newTmpPassword}</FormErrorMessage>
        </FormControl>
      )}

      <FormControl py={2} isInvalid={touched.newTag1 && errors.newTag1}>
        <FormLabel>Tag 1</FormLabel>
        <Select
          type="text"
          id="newTag1"
          name="newTag1"
          value={values.newTag1}
          onChange={handleChange}
          onBlur={handleBlur}
        >
          <option value={null} disabled>
            Veuillez sélectionner une option...
          </option>
          <option value={"Sports"}>Sports</option>
          <option value={"SAIO Education"}>SAIO Education</option>
          <option value={"SRFD Agriculture"}>SRFD Agriculture</option>
          <option value={"Autre"}>Autre</option>
        </Select>
        <FormErrorMessage>{errors.newTag1}</FormErrorMessage>
      </FormControl>

      {values.newTag1 === "Autre" && (
        <FormControl py={2} isInvalid={touched.newTag2 && errors.newTag2}>
          <FormLabel>Tag 2</FormLabel>
          <Input
            type="text"
            id="newTag2"
            name="newTag2"
            value={values.newTag2}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          <FormErrorMessage>{errors.newTag2}</FormErrorMessage>
        </FormControl>
      )}

      <FormControl py={2} isInvalid={touched.newFonction && errors.newFonction}>
        <FormLabel>Fonction</FormLabel>
        {values.newTag1 === "Autre" ? (
          <Input
            type="text"
            id="newFonction"
            name="newFonction"
            value={values.newFonction}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        ) : (
          <Select
            type="text"
            id="newFonction"
            name="newFonction"
            value={values.newFonction}
            onChange={handleChange}
            onBlur={handleBlur}
          >
            <option value={""}>Veuillez sélectionner une option...</option>
            <option value={"SAIO / SRFD : adjoint chef de service"}>SAIO / SRFD : adjoint chef de service</option>
            <option value={"SAIO / SRFD : chef de service"}>SAIO / SRFD : chef de service</option>
            <option value={"SAIO / SRFD : chargé de mission ou assimilé"}>
              SAIO / SRFD : chargé de mission ou assimilé
            </option>
          </Select>
        )}

        <FormErrorMessage>{errors.newFonction}</FormErrorMessage>
      </FormControl>

      <FormControl py={2} mt={3} isInvalid={touched.accessAllCheckbox && errors.accessAllCheckbox}>
        <Checkbox
          name="accessAllCheckbox"
          id="accessAllCheckbox"
          isChecked={values.accessAllCheckbox.length > 0}
          onChange={handleChange}
          onBlur={handleBlur}
          value="on"
          fontWeight={values.accessAllCheckbox.length > 0 ? "bold" : "normal"}
          color={"bluefrance"}
        >
          Admin
        </Checkbox>
        <FormErrorMessage>{errors.accessAllCheckbox}</FormErrorMessage>
      </FormControl>

      <FormControl py={2} isInvalid={touched.roles && errors.roles}>
        <FormLabel>Rôles</FormLabel>
        <HStack wrap="wrap" spacing={"4%"}>
          {roles.map((role, i) => {
            return (
              <Checkbox
                name="roles"
                key={i}
                onChange={() => handleRoleChange(role.name)}
                onBlur={handleBlur}
                value={role.name}
                isChecked={values.roles.includes(role.name)}
              >
                {role.name}
              </Checkbox>
            );
          })}
        </HStack>
        <FormErrorMessage>{errors.roles}</FormErrorMessage>
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
                        onBlur={handleBlur}
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
                              onBlur={handleBlur}
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

      <FormControl py={2} isInvalid={touched.accessAcademieList && errors.accessAcademieList}>
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
                  onBlur={handleBlur}
                  value={key}
                  isChecked={values.accessAcademieList.includes(key)}
                  mb={3}
                >
                  {ACADEMIES[key].nom_academie} ({key})
                </Checkbox>
              );
            })}
        </HStack>
        <FormErrorMessage>{errors.accessAcademieList}</FormErrorMessage>
      </FormControl>

      {user && (
        <Box>
          <Button type="submit" variant="primary" mr={5} isDisabled={!isValid} onClick={handleSubmit}>
            Enregistrer
          </Button>

          <Button
            variant="outline"
            colorScheme="bluefrance"
            borderRadius="none"
            onClick={onGenerateNewPasswordClicked}
            mr={5}
          >
            Générer un nouveau mot de passe
          </Button>

          <Button variant="outline" colorScheme="red" borderRadius="none" onClick={onDeleteClicked}>
            Supprimer l'utilisateur
          </Button>
        </Box>
      )}
      {!user && (
        <Button type="submit" variant="primary" isDisabled={!isValid} onClick={handleSubmit}>
          Créer l'utilisateur
        </Button>
      )}
    </form>
  );
};

export default (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [tabIndex, setTabIndex] = useState(0);

  const { data: roles } = useQuery("roles", () => _get(`/api/admin/roles/`), {
    refetchOnWindowFocus: false,
  });

  // const { data: users } = useQuery("users", () => _get(`/api/admin/users/`), {
  //   refetchOnWindowFocus: false,
  // });

  const [searchState, refreshSearchCount] = useUserSearch();

  const title = "Gestion des utilisateurs";
  setTitle(title);

  const tabs = [
    {
      title: "Liste",
      anchor: null,
      component: (
        <SearchUser {...props} searchState={searchState} roles={roles} refreshSearchCount={refreshSearchCount} />
      ),
    },
    { title: "Créer un utilisateur", anchor: "create", component: <UserLine user={null} roles={roles} /> },
  ];

  useEffect(() => {
    if (location.hash === "#create") {
      setTabIndex(1);
    }
  }, [location.hash]);

  const handleTabsChange = (index) => {
    navigate(tabs[index].anchor ? `#${tabs[index].anchor}` : "");
    setTabIndex(index);
  };

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

          {!searchState.loaded && (
            <Center h="70vh">
              <Spinner />
            </Center>
          )}
          {searchState.loaded && (
            <Tabs variant="search" mt={5} isLazy tabIndex={tabIndex} onChange={handleTabsChange}>
              <TabList bg="white">
                {tabs.map((tab, index) => (
                  <Tab key={index}>{tab.title}</Tab>
                ))}
              </TabList>
              <TabPanels>
                {tabs.map((tab, index) => (
                  <TabPanel key={index}>{tab.component}</TabPanel>
                ))}
              </TabPanels>
            </Tabs>
          )}
          {/*
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
          </Stack> */}
        </Container>
      </Box>
    </Layout>
  );
};
