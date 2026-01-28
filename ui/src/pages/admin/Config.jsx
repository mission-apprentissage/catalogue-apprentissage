import { useState, useEffect, useRef, useCallback, Fragment } from "react";
import { flushSync } from "react-dom";
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  useToast,
  Switch,
  UnorderedList,
  ListItem,
  Text,
  FormHelperText,
  Container,
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
    "diffusion",
    {
      label: "Activer la phase de diffusion des candidatures",
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
]);

export const Config = () => {
  const [options, setOptions] = useState({});

  const toast = useToast();
  const [auth] = useAuth();
  const mountedRef = useRef(true);

  const getOptions = useCallback(async () => {
    try {
      const data = await _get("/api/config");
      // console.log(data);
      setOptions(data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    const run = async () => {
      if (mountedRef.current) {
        await getOptions();
      }
    };
    run();

    return () => {
      mountedRef.current = false;
    };
  }, [getOptions]);

  const { handleSubmit, setFieldValue } = useFormik({
    initialValues: options,
    allowReinitialize: true,
    onSubmit: (values, { setSubmitting }) => {
      return new Promise(async (resolve, reject) => {
        try {
          const result = await _put("/api/admin/config", values);
          if (result) {
            toast({ description: "La configuration a été mise à jour." });
          }
          await getOptions();
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
          <Text textStyle="h2" color="grey.800" mt={5} mb={5}>
            {title}
          </Text>

          {!!configMap.size && (
            <>
              <Heading as="h3" size="md" mb={4}>
                Liste des options :
              </Heading>

              <Box>
                {[...configMap.entries()].map(([key, option]) => (
                  <Fragment key={key}>
                    <FormControl key={key} name={key} alignItems="center">
                      <Box display="flex" justifyContent="space-between">
                        <FormLabel>{option.label}</FormLabel>
                        <Switch
                          size="md"
                          m="auto"
                          isChecked={options[key]}
                          onChange={() => {
                            flushSync(() => {
                              setFieldValue(key, !options[key]);
                            });
                            void handleSubmit();
                          }}
                          aria-label={option.enabled ? "Désactiver" : "Activer"}
                        />
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
      </Box>
    </Layout>
  );
};
