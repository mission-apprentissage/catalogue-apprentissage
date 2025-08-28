import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Container,
  Text,
  Textarea,
  VStack,
  useToast,
  IconButton,
  Switch,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import { _post, _get, _patch, _put, _delete } from "../../common/httpClient";
import Layout from "../layout/Layout";
import useAuth from "../../common/hooks/useAuth";
import { useRef } from "react";
import { useCallback } from "react";
import { setAlerts } from "../../common/store/alertStore";
import { CheckIcon, CloseIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { Breadcrumb } from "../../common/components/Breadcrumb";

const Alert = () => {
  const [messageAutomatique, setMessageAutomatique] = useState([]);
  const [messagesManuels, setMessagesManuels] = useState([]);
  const toast = useToast();
  const [user] = useAuth();
  const mountedRef = useRef(false);

  const getMessages = useCallback(async () => {
    try {
      const data = await _get("/api/entity/alert");

      setMessagesManuels(data.filter((message) => message.type === "manuel"));
      setMessageAutomatique(data.filter((message) => message.type === "automatique")[0]);

      setAlerts(data?.filter((item) => item.enabled) ?? []);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    const run = async () => {
      if (!mountedRef.current) {
        mountedRef.current = true;
        await getMessages();
      }
    };
    run();

    return () => {
      mountedRef.current = false;
    };
  }, [getMessages]);

  const {
    values: valuesM,
    handleSubmit: handleSubmitM,
    handleChange: handleChangeM,
  } = useFormik({
    initialValues: {
      msg: "",
    },
    onSubmit: ({ msg }, { setSubmitting }) => {
      return new Promise(async (resolve) => {
        try {
          const message = {
            type: "manuel",
            msg,
            name: user.email,
            enabled: true,
          };
          const messagePosted = await _post("/api/entity/alert", message);
          if (messagePosted) {
            toast({ description: "Le message a été créé." });
            await getMessages();
          } else {
            toast({ description: "Une erreur est survenue lors de la création du message.", status: "error" });
          }
        } catch (e) {
          console.error(e);
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
  } = useFormik({
    enableReinitialize: true,
    initialValues: {
      msg: messageAutomatique.msg,
    },
    onSubmit: ({ msg }, { setSubmitting }) => {
      return new Promise(async (resolve) => {
        try {
          const message = {
            type: "automatique",
            msg,
            name: "auto",
            enabled: false,
          };
          const messagePosted = await _put(`/api/entity/alert/${messageAutomatique._id}`, message);
          if (messagePosted) {
            toast({ description: "Le message a été mise à jour." });
            await getMessages();
          } else {
            toast({ description: "Une erreur est survenue lors de la mise à jour du message.", status: "error" });
          }
        } catch (e) {
          console.error(e);
        }

        setSubmitting(false);
        resolve("onSubmitHandler complete");
      });
    },
  });

  // useEffect(() => {
  //   const run = async () => {
  //     try {
  //       const data = await _get("/api/entity/alert");
  //       if (data.length === 0) {
  //         const message = {
  //           type: "automatique",
  //           msg: "Une mise à jour des données du catalogue est en cours, le service sera à nouveau opérationnel d'ici le XX/XX/21 à XXh.",
  //           name: "auto",
  //           enabled: false,
  //         };
  //         await _post("/api/entity/alert", message);
  //         window.location.reload();
  //       } else {
  //         const [a] = data.filter((d) => d.type === "automatique");
  //         setMessageAutomatique(a);
  //         setFieldValue(
  //           "msg",
  //           a.msg ||
  //             "Une mise à jour des données du catalogue est en cours, le service sera à nouveau opérationnel d'ici le XX/XX/21 à XXh."
  //         );
  //       }
  //     } catch (e) {
  //       console.error(e);
  //     }
  //   };
  //   run();
  // }, [setFieldValue]);

  const toggleMessage = useCallback(
    async (message) => {
      try {
        const messageUpdated = await _patch(`/api/entity/alert/${message._id}`, {
          enabled: !message.enabled,
        });

        if (messageUpdated) {
          toast({ description: `Le message a été ${!message.enabled ? "activé" : "désactivé"}.` });
          await getMessages();
        } else {
          toast({ description: "Une erreur est survenue lors de la mise à jour du message.", status: "error" });
        }
      } catch (e) {
        console.error(e);
      }
    },
    [getMessages, toast]
  );

  const toggleMessageEditing = useCallback(
    (message) => {
      setMessagesManuels([
        ...messagesManuels.map((m) =>
          m._id === message._id ? { ...m, editing: !message.editing, msg: message.initialValue } : m
        ),
      ]);
    },
    [messagesManuels]
  );

  const updateMessage = useCallback(
    (message, value) => {
      setMessagesManuels([...messagesManuels.map((m) => (m._id === message._id ? { ...m, msg: value } : m))]);
    },
    [messagesManuels]
  );

  const editMessage = useCallback(
    async (message, description) => {
      try {
        const messageUpdated = await _patch(`/api/entity/alert/${message._id}`, {
          msg: description,
        });

        if (messageUpdated) {
          toast({ description: "Le message a été modifié." });
        }

        await getMessages();
      } catch (e) {
        console.error(e);
      }
    },
    [getMessages, toast]
  );

  const deleteMessage = useCallback(
    async (message) => {
      try {
        const messageDeleted = await _delete(`/api/entity/alert/${message._id}`);

        if (messageDeleted) {
          toast({ description: "Le message a été supprimé." });
          await getMessages();
        } else {
          toast({ description: "Une erreur est survenue lors de la suppression du message.", status: "error" });
        }
      } catch (e) {
        console.error(e);
      }
    },
    [getMessages, toast]
  );

  const title = "Messages de maintenance";

  return (
    <Layout data-testid="page-alert">
      <Box pt={[4, 8]} px={[1, 1, 12, 24]}>
        <Container maxW="7xl">
          <Breadcrumb pages={[{ title: "Accueil", to: "/" }, { title: title }]} />
          <Text textStyle="h2" color="grey.800" mt={5}>
            {title}
          </Text>

          <Box mt={10}>
            <Text textStyle="h4" marginBottom="2w">
              Messages manuels
            </Text>

            <FormControl as="fieldset" mt={5}>
              {/* <FormLabel as="legend">Ajouter un message manuel: </FormLabel> */}
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

            <FormControl as="fieldset" mt={5}>
              <FormLabel as="legend">Liste des messages manuels: </FormLabel>
              <Box>
                <VStack wrap="none">
                  {messagesManuels.map((message) => {
                    return (
                      <Box w="100%" display={"inline-flex"} key={message._id}>
                        <Box
                          w="10%"
                          alignSelf="right"
                          alignItems="right"
                          display={"inline-flex"}
                          marginLeft="4"
                          marginRight="4"
                        >
                          <Switch
                            size="md"
                            m="auto"
                            isChecked={message.enabled}
                            onChange={() => toggleMessage(message)}
                            aria-label={message.enabled ? "Désactiver" : "Activer"}
                          />
                        </Box>

                        <Box w="80%">
                          <Textarea
                            disabled={!message.editing}
                            onChange={(e) => updateMessage(message, e.target.value)}
                            value={message.msg}
                          />
                        </Box>
                        <Box
                          w="10%"
                          alignSelf="right"
                          alignItems="right"
                          display={"inline-flex"}
                          marginLeft="4"
                          marginRight="4"
                        >
                          <IconButton
                            variant="ghost"
                            colorScheme="blue"
                            aria-label="Editer"
                            fontSize="20px"
                            m="auto"
                            icon={message.editing ? <CheckIcon /> : <EditIcon />}
                            onClick={() =>
                              message.editing ? editMessage(message, message.msg) : toggleMessageEditing(message)
                            }
                          />
                          <IconButton
                            variant="ghost"
                            colorScheme="red"
                            aria-label="Supprimer"
                            fontSize="20px"
                            m="auto"
                            icon={message.editing ? <CloseIcon /> : <DeleteIcon />}
                            onClick={() => (message.editing ? toggleMessageEditing(message) : deleteMessage(message))}
                          />
                        </Box>
                      </Box>
                    );
                  })}
                </VStack>
              </Box>
            </FormControl>
          </Box>

          <Box mt={10}>
            <Text textStyle="h4" marginBottom="2w">
              Message automatique
            </Text>

            <FormControl as="fieldset" mt={5}>
              {/* <FormLabel as="legend">Modifier le message automatique : </FormLabel> */}
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
        </Container>
      </Box>
    </Layout>
  );
};

export default Alert;
