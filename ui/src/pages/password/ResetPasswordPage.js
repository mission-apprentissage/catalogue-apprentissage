import React, { useState } from "react";
import queryString from "query-string";
import * as Yup from "yup";
import { Container, Box, Text } from "@chakra-ui/react";
import { Form as TablerForm, Card, Page, Button } from "tabler-react";
import { useFormik } from "formik";
import { useHistory, useLocation } from "react-router-dom";
import useAuth from "../../common/hooks/useAuth";
import { _post } from "../../common/httpClient";
import decodeJWT from "../../common/utils/decodeJWT";

import "./password.css";

const validationSchema = Yup.object().shape({
  newPassword: Yup.string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .matches(/[a-z]/, "Le mot de passe doit contenir au moins une lettre minuscule")
    .matches(/[A-Z]/, "Le mot de passe doit contenir au moins une lettre majuscule")
    .matches(/[0-9]/, "Le mot de passe doit contenir au moins un nombre")
    .matches(/[!@#$%^&*(),.?":{}|<>]/, "Le mot de passe doit contenir au moins un caractère spécial")
    .required("Veuillez saisir un mot de passe"),
});

export default () => {
  let [, setAuth] = useAuth();
  let history = useHistory();
  let location = useLocation();
  let { passwordToken } = queryString.parse(location.search);
  let uai = decodeJWT(passwordToken).sub;

  const [conditions, setConditions] = useState({
    min: false,
    lowerCase: false,
    upperCase: false,
    number: false,
    special: false,
  });
  const [status, setStatus] = useState({ error: null });

  let showError = (meta) => {
    return meta.touched && meta.error
      ? {
          feedback: meta.error,
          invalid: true,
        }
      : {};
  };

  const { values, handleSubmit, handleChange, getFieldMeta } = useFormik({
    initialValues: {
      newPassword: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        let { token } = await _post("/api/password/reset-password", { ...values, passwordToken });
        setAuth(token);
        history.push("/");
      } catch (e) {
        console.error(e);
        setStatus({
          error: (
            <span>
              Le lien est expiré ou invalide, merci de prendre contact avec un administrateur en précisant votre adresse
              mail :
              <br />
              <a href="mailto:catalogue@apprentissage.beta.gouv.fr">catalogue@apprentissage.beta.gouv.fr</a>
            </span>
          ),
        });
      }
    },
  });

  const onChange = async (e) => {
    handleChange(e);
    const val = e.target.value;
    const min = Yup.string().min(8, "Le mot de passe doit contenir au moins 8 caractères");
    const lowerCase = Yup.string().matches(/[a-z]/, "Le mot de passe doit contenir au moins une lettre minuscule");
    const upperCase = Yup.string().matches(/[A-Z]/, "Le mot de passe doit contenir au moins une lettre majuscule");
    const number = Yup.string().matches(/[0-9]/, "Le mot de passe doit contenir au moins un nombre");
    const special = Yup.string().matches(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Le mot de passe doit contenir au moins un caractère spécial"
    );
    setConditions({
      min: await min.isValid(val),
      lowerCase: await lowerCase.isValid(val),
      upperCase: await upperCase.isValid(val),
      number: await number.isValid(val),
      special: await special.isValid(val),
    });
  };

  return (
    <Page>
      <Page.Main>
        <Page.Content>
          <Container maxW="32rem">
            <Box>
              <Card>
                <Card.Header>
                  <Card.Title>Changement du mot de passe pour l'utilisateur {uai}</Card.Title>
                </Card.Header>
                <Card.Body>
                  <form onSubmit={handleSubmit}>
                    <TablerForm.Group label="Nouveau mot de passe">
                      <TablerForm.Input
                        type="password"
                        name="newPassword"
                        id="newPassword"
                        value={values.newPassword}
                        placeholder="Votre mot de passe..."
                        {...showError(getFieldMeta("newPassword"))}
                        onChange={onChange}
                      />
                      <p className="mdp-rules">
                        <li className={!conditions.lowerCase ? "error" : "success"}>
                          {!conditions.lowerCase ? "✗" : "✓"}&nbsp;Le mot de passe doit contenir au moins une lettre
                          minuscule
                        </li>
                        <li className={!conditions.upperCase ? "error" : "success"}>
                          {!conditions.upperCase ? "✗" : "✓"}&nbsp;Le mot de passe doit contenir au moins une lettre
                          majuscule
                        </li>
                        <li className={!conditions.special ? "error" : "success"}>
                          {!conditions.special ? "✗" : "✓"}&nbsp;Le mot de passe doit contenir au moins un caractère
                          spécial
                        </li>
                        <li className={!conditions.number ? "error" : "success"}>
                          {!conditions.number ? "✗" : "✓"}&nbsp;Le mot de passe doit contenir au moins un nombre
                        </li>
                        <li className={!conditions.min ? "error" : "success"}>
                          {!conditions.min ? "✗" : "✓"}&nbsp;Le mot de passe doit contenir au moins 8 caractères
                        </li>
                      </p>
                    </TablerForm.Group>
                    <Button color="primary" className="text-left" type={"submit"}>
                      Réinitialiser le mot de passe
                    </Button>
                    {status.error && (
                      <Text fontSize="sm" color="#cd201f" mt={1}>
                        {status.error}
                      </Text>
                    )}
                  </form>
                </Card.Body>
              </Card>
            </Box>
          </Container>
        </Page.Content>
      </Page.Main>
    </Page>
  );
};
