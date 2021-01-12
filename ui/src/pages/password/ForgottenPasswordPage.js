import React from "react";
import * as Yup from "yup";
import { Container, Box, Text } from "@chakra-ui/react";
import { Form as TablerForm, Card, Page, Button } from "tabler-react";
import { Formik, Field, Form } from "formik";
import { useHistory } from "react-router-dom";
import useAuth from "../../common/hooks/useAuth";
import { _post } from "../../common/httpClient";

export default () => {
  let [, setAuth] = useAuth();
  let history = useHistory();

  let showError = (meta) => {
    return meta.touched && meta.error
      ? {
          feedback: meta.error,
          invalid: true,
        }
      : {};
  };

  let resetPassword = async (values, { setStatus }) => {
    try {
      let { token } = await _post("/api/password/forgotten-password", { ...values });
      setAuth(token);
      setStatus({ message: "Un email vous a été envoyé." });
      setTimeout(() => history.push("/"), 1500);
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
                  <Card.Title>Mot de passe oublié</Card.Title>
                </Card.Header>
                <Card.Body>
                  <Formik
                    initialValues={{
                      username: "",
                    }}
                    validationSchema={Yup.object().shape({
                      username: Yup.string().required("Veuillez saisir un identifiant"),
                    })}
                    onSubmit={resetPassword}
                  >
                    {({ status = {} }) => {
                      return (
                        <Form>
                          <TablerForm.Group label="Identifiant">
                            <Field name="username">
                              {({ field, meta }) => {
                                return (
                                  <TablerForm.Input
                                    type={"text"}
                                    placeholder="Votre identifiant..."
                                    {...field}
                                    {...showError(meta)}
                                  />
                                );
                              }}
                            </Field>
                          </TablerForm.Group>
                          <Button color="primary" className="text-left" type={"submit"}>
                            Demander un nouveau mot de passe
                          </Button>
                          {status.error && (
                            <Text fontSize="sm" color="#cd201f" mt={1}>
                              {status.error}
                            </Text>
                          )}
                          {status.message && (
                            <Text fontSize="sm" color="#316100" mt={1}>
                              {status.message}
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
