import React, { useState, useEffect } from "react";
import {
  Box,
  Center,
  Heading,
  Button,
  FormControl,
  FormLabel,
  Container,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import { _post, _get, _patch, _put, _delete } from "../../common/httpClient";
import Layout from "../layout/Layout";
import { NavLink } from "react-router-dom";
import { ArrowDropRightLine } from "../../theme/components/icons";
import useAuth from "../../common/hooks/useAuth";

const Alert = () => {
  const [messageAutomatique, setMessageAutomatique] = useState([]);
  const [messagesManuels, setMessagesManuels] = useState([]);

  const [user] = useAuth();

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        const data = await _get("/api/v1/entity/alert");
        const hasMessages = data.reduce((acc, item) => acc || item.enabled, false);
        if (hasMessages && mounted) {
          setMessagesManuels(data.filter((message) => message.type === "manuel"));
        }
      } catch (e) {
        console.error(e);
      }
    };
    run();

    return () => {
      // cleanup hook
      mounted = false;
    };
  }, []);

  const {
    values: valuesM,
    handleSubmit: handleSubmitM,
    handleChange: handleChangeM,
  } = useFormik({
    initialValues: {
      msg: "",
    },
    onSubmit: ({ msg }, { setSubmitting }) => {
      return new Promise(async (resolve, reject) => {
        try {
          const message = {
            type: "manuel",
            msg,
            name: user.email,
            enabled: true,
          };
          const messagePosted = await _post("/api/v1/entity/alert", message);
          if (messagePosted) {
            alert("Le message a bien été envoyé.");
          }
          window.location.reload();
        } catch (e) {
          console.log(e);
        }

        setSubmitting(false);
        resolve("onSubmitHandler complete");
      });
    },
  });

  const {
    values: valuesA,
    handleSubmit: handleSubmitA,
    handleChange: handleChangeA,
    setFieldValue,
  } = useFormik({
    initialValues: {
      msg: "",
    },
    onSubmit: ({ msg }, { setSubmitting }) => {
      return new Promise(async (resolve, reject) => {
        try {
          const message = {
            type: "automatique",
            msg,
            name: "auto",
            enabled: false,
          };
          const messagePosted = await _put(`/api/v1/entity/alert/${messageAutomatique._id}`, message);
          if (messagePosted) {
            alert("Le message a bien été mise à jour.");
          }
          window.location.reload();
        } catch (e) {
          console.log(e);
        }

        setSubmitting(false);
        resolve("onSubmitHandler complete");
      });
    },
  });

  useEffect(() => {
    const run = async () => {
      try {
        const data = await _get("/api/v1/entity/alert");
        if (data.length === 0) {
          const message = {
            type: "automatique",
            msg: "Une mise à jour des données du catalogue est en cours, le service sera à nouveau opérationnel d'ici le XX/XX/21 à XXh.",
            name: "auto",
            enabled: false,
          };
          await _post("/api/v1/entity/alert", message);
          window.location.reload();
        } else {
          const [a] = data.filter((d) => d.type === "automatique");
          setMessageAutomatique(a);
          setFieldValue(
            "msg",
            a.msg ||
              "Une mise à jour des données du catalogue est en cours, le service sera à nouveau opérationnel d'ici le XX/XX/21 à XXh."
          );
        }
      } catch (e) {
        console.error(e);
      }
    };
    run();
  }, [setFieldValue]);

  const toggleMessage = async (message) => {
    try {
      await _patch(`/api/v1/entity/alert/${message._id}`, {
        enabled: !message.enabled,
      });
      window.location.reload();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteMessage = async (message) => {
    try {
      const messageDeleted = await _delete(`/api/v1/entity/alert/${message._id}`);
      if (messageDeleted) {
        alert("Le message a bien été supprimé.");
      }
      window.location.reload();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Layout>
      <Box w="100%" pt={[4, 8]} px={[1, 1, 12, 24]}>
        <Container maxW="xl">
          <Breadcrumb separator={<ArrowDropRightLine color="grey.600" />} textStyle="xs">
            <BreadcrumbItem>
              <BreadcrumbLink as={NavLink} to="/" color="grey.600" textDecoration="underline">
                Accueil
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>Message de maintenance</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
        </Container>
        <Container maxW="xl">
          <Center verticalAlign="center">
            <Box mt={10} width={["auto", "50rem"]}>
              <Heading textStyle="h2" marginBottom="2w">
                Message de maintenance
              </Heading>
              <Box>
                <Heading textStyle="h4" marginBottom="2w">
                  Message manuel
                </Heading>

                <FormControl as="fieldset">
                  <FormLabel as="legend">Liste des messages manuels: </FormLabel>
                  <Box>
                    <VStack wrap="none">
                      {messagesManuels.map((message) => {
                        return (
                          <Box w="100%" display={"inline-flex"}>
                            <Box w="80%">
                              <Textarea disabled>{message.msg}</Textarea>
                            </Box>
                            <Box w="20%" alignSelf="right" alignItems="right">
                              <Button textStyle="sm" variant="outlined" onClick={() => toggleMessage(message)}>
                                {message.enabled ? "Désactiver" : "Activer"}
                              </Button>
                              <Button textStyle="sm" variant="danger" onClick={() => deleteMessage(message)}>
                                Supprimer
                              </Button>
                            </Box>
                          </Box>
                        );
                      })}
                    </VStack>
                  </Box>
                </FormControl>

                <FormControl as="fieldset" mt={5}>
                  <FormLabel as="legend">Ajouter un message manuel: </FormLabel>
                  <Textarea
                    name="msg"
                    value={valuesM.msg}
                    onChange={handleChangeM}
                    placeholder="Saisissez un message manuel"
                    rows={3}
                    required
                  />
                  <Box mt="1rem" textAlign="right">
                    <Button textStyle="sm" variant="primary" disabled={!valuesM.msg?.length} onClick={handleSubmitM}>
                      Enregistrer et activer
                    </Button>
                  </Box>
                </FormControl>
              </Box>

              <Box mt={10}>
                <Heading textStyle="h4" marginBottom="2w">
                  Message automatique
                </Heading>

                <FormControl as="fieldset" mt={5}>
                  <FormLabel as="legend">Modifier le message automatique : </FormLabel>
                  <Textarea
                    name="msg"
                    value={valuesA.msg}
                    onChange={handleChangeA}
                    placeholder="Saisissez le message automatique"
                    rows={3}
                    required
                  />
                  <Box mt="1rem" textAlign="right">
                    <Button
                      textStyle="sm"
                      variant="primary"
                      disabled={valuesA.msg === messageAutomatique.msg}
                      onClick={handleSubmitA}
                      mb={8}
                    >
                      Mettre à jour le message automatique
                    </Button>
                  </Box>
                </FormControl>
              </Box>
            </Box>
          </Center>
        </Container>
      </Box>
    </Layout>
  );
};

export default Alert;
