import React from "react";
import * as Yup from "yup";
import { Container, Box, Text } from "@chakra-ui/react";
import { Form as TablerForm, Card, Page, Button } from "tabler-react";
import { Formik, Field, Form } from "formik";
import { NavLink, useHistory } from "react-router-dom";
import useAuth from "../common/hooks/useAuth";
import { _post } from "../common/httpClient";

export default () => {
  let [, setAuth] = useAuth();
  let history = useHistory();

  let feedback = (meta, message) => {
    return meta.touched && meta.error
      ? {
          feedback: message,
          invalid: true,
        }
      : {};
  };

  let login = async (values, { setStatus }) => {
    try {
      let { token } = await _post("/api/login", values);
      setAuth(token);
      history.push("/");
    } catch (e) {
      console.error(e);
      setStatus({ error: e.prettyMessage });
    }
  };

  return (
    <Page>
      <Page.Main>
        <Page.Content>
          <Container maxW="32rem">
            <Box>
              <Card>
                <Card.Header>
                  <Card.Title>Connexion</Card.Title>
                </Card.Header>
                <Card.Body>
                  <Formik
                    initialValues={{
                      username: "",
                      password: "",
                    }}
                    validationSchema={Yup.object().shape({
                      username: Yup.string().required("Requis"),
                      password: Yup.string().required("Requis"),
                    })}
                    onSubmit={login}
                  >
                    {({ status = {} }) => {
                      return (
                        <Form>
                          <TablerForm.Group label="Identifiant">
                            <Field name="username">
                              {({ field, meta }) => {
                                return (
                                  <TablerForm.Input
                                    placeholder="Votre identifiant..."
                                    {...field}
                                    {...feedback(meta, "Identifiant invalide")}
                                  />
                                );
                              }}
                            </Field>
                          </TablerForm.Group>
                          <TablerForm.Group label="Mot de passe">
                            <Field name="password">
                              {({ field, meta }) => {
                                return (
                                  <TablerForm.Input
                                    type={"password"}
                                    placeholder="Votre mot de passe..."
                                    {...field}
                                    {...feedback(meta, "Mot de passe invalide")}
                                  />
                                );
                              }}
                            </Field>
                          </TablerForm.Group>
                          <div className={"d-flex justify-content-between align-items-center"}>
                            <Button color="primary" className="text-left" type={"submit"}>
                              Connexion
                            </Button>
                            <NavLink to="/forgotten-password">Mot de passe oublié</NavLink>
                          </div>
                          {status.error && (
                            <Text fontSize="sm" color="#cd201f" mt={1}>
                              {status.error}
                            </Text>
                          )}
                        </Form>
                      );
                    }}
                  </Formik>
                </Card.Body>
              </Card>
            </Box>
          </Container>
        </Page.Content>
      </Page.Main>
    </Page>
  );
};
