import { Box, Button, Center, FormControl, FormErrorMessage, FormLabel, Input, Text } from "@chakra-ui/react";
import { Field, Form, Formik } from "formik";
import React from "react";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { _post } from "../../common/httpClient";
import { setTitle } from "../../common/utils/pageUtils";

const ForgottenPasswordPage = () => {
  const navigate = useNavigate();

  const resetPassword = async (values, { setStatus }) => {
    try {
      await _post("/api/password/forgotten-password", { ...values });
      setStatus({ message: "Un email vous a été envoyé." });
      setTimeout(() => navigate("/"), 1500);
    } catch (e) {
      console.error(e);
      setStatus({ error: e.prettyMessage });
    }
  };

  const title = "Mot de passe oublié";
  setTitle(title);

  return (
    <Center height="100vh" verticalAlign="center">
      <Box width={["auto", "28rem"]}>
        <Text fontFamily="Marianne" fontWeight="700" marginBottom="2w">
          {title}
        </Text>
        <Formik
          initialValues={{
            username: "",
          }}
          validationSchema={Yup.object().shape({
            username: Yup.string().required("Veuillez saisir une adresse courriel."),
          })}
          onSubmit={resetPassword}
        >
          {({ status = {} }) => {
            return (
              <Form>
                <Field name="username">
                  {({ field, meta }) => {
                    return (
                      <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                        <FormLabel>Identifiant (adresse courriel)</FormLabel>
                        <Input {...field} id={field.name} placeholder="Votre adresse courriel..." />
                        <FormErrorMessage>{meta.error}</FormErrorMessage>
                      </FormControl>
                    );
                  }}
                </Field>
                <Button variant="primary" type={"submit"}>
                  Demander un nouveau mot de passe
                </Button>
                {status.error && (
                  <Text color="error" mt={2}>
                    {status.error}
                  </Text>
                )}
                {status.message && (
                  <Text color="info" mt={2}>
                    {status.message}
                  </Text>
                )}
              </Form>
            );
          }}
        </Formik>
      </Box>
    </Center>
  );
};

export default ForgottenPasswordPage;
