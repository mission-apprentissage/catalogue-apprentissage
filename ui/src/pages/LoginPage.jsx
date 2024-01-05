import {
  Box,
  Button,
  Center,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  Link,
  Text,
} from "@chakra-ui/react";
import { Field, Form, Formik } from "formik";
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import * as Yup from "yup";

import useAuth from "../common/hooks/useAuth";
import { _post } from "../common/httpClient";
import { setTitle } from "../common/utils/pageUtils";
import { PasswordInput } from "../common/components/PasswordInput";

const LoginPage = () => {
  const [, setAuth] = useAuth();
  const navigate = useNavigate();

  const login = async (values, { setStatus }) => {
    try {
      const user = await _post("/api/auth/login", values);
      setAuth(user);
      navigate("/");
    } catch (e) {
      console.error(e);
      e.statusCode === 429
        ? setStatus({ error: "Trop de tentatives infructueuses, veuillez essayer de nouveau dans une minute." })
        : setStatus({ error: e.prettyMessage });
    }
  };

  const title = "Connexion";
  setTitle(title);

  return (
    <Center height="100vh" verticalAlign="center">
      <Box width={["auto", "28rem"]}>
        <Text fontFamily="Marianne" fontWeight="700" marginBottom="2w">
          {title}
        </Text>
        <Box>
          <Formik
            initialValues={{ username: "", password: "" }}
            validationSchema={Yup.object().shape({
              username: Yup.string().required("Requis"),
              password: Yup.string().required("Requis"),
            })}
            onSubmit={login}
          >
            {({ status = {} }) => {
              return (
                <Form>
                  <Box marginBottom="2w">
                    <Field name="username">
                      {({ field, meta }) => (
                        <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                          <FormLabel>Identifiant</FormLabel>
                          <Input {...field} id={field.name} placeholder="Votre identifiant..." />
                          <FormErrorMessage>{meta.error}</FormErrorMessage>
                        </FormControl>
                      )}
                    </Field>
                    <Field name="password">
                      {({ field, meta }) => {
                        return (
                          <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                            <FormLabel>Mot de passe</FormLabel>
                            <PasswordInput
                              {...field}
                              id={field.name}
                              placeholder="Votre mot de passe..."
                              autocomplete="current-password"
                            />
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        );
                      }}
                    </Field>
                  </Box>
                  <HStack spacing="4w">
                    <Button variant="primary" type="submit">
                      Connexion
                    </Button>
                    <Link to="/forgotten-password" as={NavLink} color="grey.500">
                      Mot de passe oublié
                    </Link>
                  </HStack>
                  {status.error && (
                    <Text color="error" mt={2}>
                      {status.error}
                    </Text>
                  )}
                </Form>
              );
            }}
          </Formik>
        </Box>
      </Box>
    </Center>
  );
};

export default LoginPage;
