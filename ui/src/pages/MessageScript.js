import React, { useHistory } from "react";
import {
  Box,
  Center,
  Heading,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  HStack,
  Button,
} from "@chakra-ui/react";
import { Field, Form, Formik } from "formik";
import { _post } from "../common/httpClient";
import * as Yup from "yup";

const Message = () => {
  const message = async (values, { setStatus }) => {
    try {
      await _post("/api/v1/entity/messageScript", values);
    } catch (e) {
      console.error(e);
      setStatus({ error: e.prettyMessage });
    }
  };
  return (
    <Center height="100vh" verticalAlign="center">
      <Box width={["auto", "28rem"]}>
        <Heading textStyle="h2" marginBottom="2w">
          MessageScript
        </Heading>
        <Box>
          <Formik
            initialValues={{ msg: "", name: "" }}
            validationSchema={Yup.object().shape({
              message: Yup.string().required("Requis"),
              username: Yup.string().required("Requis"),
            })}
            onSubmit={message}
          >
            <Form>
              <Box marginBottom="2w">
                <Field name="message">
                  {({ field, meta }) => (
                    <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                      <FormLabel>Message</FormLabel>
                      <Input {...field} id={field.name} placeholder="Votre message..." />
                      <FormErrorMessage>{meta.error}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
                <Field name="username">
                  {({ field, meta }) => {
                    return (
                      <FormControl isRequired isInvalid={meta.error && meta.touched} marginBottom="2w">
                        <FormLabel>Name</FormLabel>
                        <Input {...field} id={field.name} type="password" placeholder="Votre nom..." />
                        <FormErrorMessage>{meta.error}</FormErrorMessage>
                      </FormControl>
                    );
                  }}
                </Field>
                <HStack spacing="4w">
                  <Button variant="primary" type="submit">
                    Submit
                  </Button>
                </HStack>
              </Box>
            </Form>
          </Formik>
        </Box>
      </Box>
    </Center>
  );
};

export default Message;
