import { useState, useEffect, useRef, useCallback, Fragment } from "react";
import { flushSync } from "react-dom";
import {
  Box,
  FormControl,
  FormLabel,
  useToast,
  Switch,
  UnorderedList,
  ListItem,
  Text,
  FormHelperText,
  Container,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import { _get, _put } from "../../common/httpClient";
import useAuth from "../../common/hooks/useAuth";
import { Breadcrumb } from "../../common/components/Breadcrumb";
import { isUserAdmin } from "../../common/utils/rolesUtils";
import Layout from "../layout/Layout";
import { setTitle } from "../../common/utils/pageUtils";

const configMap = new Map([
  [
    "rco_import",
    {
      label: "Activer la synchronisation au flux RCO",
      type: "boolean",
      description: <></>,
    },
  ],

  [
    "affelnet_diffusion",
    {
      label: "Activer la phase de diffusion des candidatures",
      type: "boolean",
      description: (
        <>
          <Text>
            Activer la phase de diffusion des candidatures aura les effets suivants :
            <UnorderedList>
              <ListItem>
                Le message d'alerte indiquant qu'aucune information de diffusion des candidatures n'a été diffusée et
                permettant de modifier l'adresse de contact de l'établissement responsable ne sera plus affichée.
              </ListItem>
            </UnorderedList>
          </Text>
        </>
      ),
    },
  ],

  [
    "parcoursup_export",
    {
      label: "Activer la publication des formations vers Parcoursup",
      type: "boolean",
      description: (
        <>
          <Text>Activer l'envoi des formations prêtes pour intégration vers le webservice Parcoursup.</Text>
        </>
      ),
    },
  ],

  [
    "parcoursup_limit",
    {
      label: "Nombre de formations envoyées quotidiennement à Parcoursup",
      type: "number",
      description: (
        <>
          <Text>
            Le nombre de formations prêtes pour intégration qui seront envoyées à Parcoursup lors des envois nocturnes :
          </Text>
        </>
      ),
    },
  ],
]);

export const Config = () => {
  const [config, setConfig] = useState({});

  const toast = useToast();
  const [auth] = useAuth();
  const mountedRef = useRef(true);

  const getConfig = useCallback(async () => {
    try {
      const data = await _get("/api/entity/config");
      // console.log(data);
      setConfig(data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    const run = async () => {
      if (mountedRef.current) {
        await getConfig();
      }
    };
    run();

    return () => {
      mountedRef.current = false;
    };
  }, [getConfig]);

  const { handleSubmit, setFieldValue } = useFormik({
    initialValues: config,
    allowReinitialize: true,
    onSubmit: (values, { setSubmitting }) => {
      return new Promise(async (resolve, reject) => {
        try {
          setConfig(await _put("/api/entity/config", values));
          // await getConfig();
        } catch (e) {
          console.error(e);
          toast({
            description: "Une erreur est survenue lors de la mise à jour de la configuration.",
            status: "error",
          });
        }

        setSubmitting(false);
        resolve("onSubmitHandler complete");
      });
    },
  });

  const title = "Configuration de l'application";
  setTitle(title);

  if (!isUserAdmin(auth)) {
    return <>Vous n'avez pas les droits suffisants pour accéder à cette page.</>;
  }

  return (
    <Layout data-testid="page-config">
      <Box w="100%" pt={[4, 8]} px={[1, 1, 12, 24]} color="grey.800">
        <Container maxW="7xl">
          <Breadcrumb pages={[{ title: "Accueil", to: "/" }, { title }]} />
        </Container>
      </Box>
      <Box w="100%" minH="100vh" px={[1, 1, 12, 24]}>
        <Container maxW="7xl">
          <Text textStyle="h2" color="grey.800" mt={5} mb={16}>
            {title}
          </Text>

          {!!configMap.size && (
            <>
              <Box>
                {[...configMap.entries()].map(([key, option]) => (
                  <Fragment key={key}>
                    <FormControl key={key} name={key} alignItems="center" mb={8}>
                      <Box display="flex" justifyContent="space-between" w="100%">
                        <FormLabel>{option.label}</FormLabel>

                        {option.type === "boolean" && (
                          <Switch
                            size="md"
                            isChecked={config[key]}
                            onChange={() => {
                              flushSync(() => {
                                setFieldValue(key, !config[key]);
                              });
                              void handleSubmit();
                            }}
                            aria-label={option.enabled ? "Désactiver" : "Activer"}
                          />
                        )}

                        {option.type === "number" && (
                          <NumberInput
                            step={10}
                            value={config[key]}
                            min={0}
                            max={10000}
                            onChange={(value) => {
                              if (value !== config[key]) {
                                flushSync(() => {
                                  setFieldValue(key, value);
                                });
                                void handleSubmit();
                              }
                            }}
                          >
                            <NumberInputField />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        )}
                      </Box>

                      <FormHelperText fontSize={"zeta"} color={"gray.500"}>
                        {option.description}
                      </FormHelperText>
                    </FormControl>
                  </Fragment>
                ))}
              </Box>
            </>
          )}
        </Container>

        {/* <button
          onClick={() => {
            throw new Error("This is your first error!");
          }}
        >
          Test Sentry
        </button> */}
      </Box>
    </Layout>
  );
};
