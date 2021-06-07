import React, { useState } from "react";
import {
  Box,
  Center,
  Heading,
  Button,
  FormControl,
  FormLabel,
  Input,
  Container,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@chakra-ui/react";
import { _post, _delete } from "../../common/httpClient";
import Layout from "../layout/Layout";
import { NavLink } from "react-router-dom";
import { ArrowDropRightLine } from "../../theme/components/icons";

const Message = () => {
  const [input, setInput] = useState({
    msg: "",
    name: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInput((prevInput) => {
      return {
        ...prevInput,
        [name]: value,
      };
    });
  };

  const handleClick = async (e) => {
    e.preventDefault();
    const newMessageScript = {
      msg: input.msg,
      name: input.name,
    };
    const messagePosted = await _post("/api/v1/entity/messageScript", newMessageScript);
    if (messagePosted) {
      alert("Le message a bien été envoyé.");
    }
  };

  const onDeleteClicked = async (e) => {
    e.preventDefault();
    const messageDeleted = await _delete("/api/v1/entity/messageScript");
    if (messageDeleted) {
      alert("Le message a bien été supprimé.");
    } else {
      alert("Il y a eu une erreur !!");
    }
  };
  return (
    <Layout>
      <Box w="100%" pt={[4, 8]} px={[1, 24]} color="grey.800">
        <Container maxW="xl">
          <Breadcrumb separator={<ArrowDropRightLine color="grey.600" />} textStyle="xs">
            <BreadcrumbItem>
              <BreadcrumbLink as={NavLink} to="/" color="grey.600" textDecoration="underline">
                Accueil
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>Message Script</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
        </Container>
      </Box>
      <Center height="100vh" verticalAlign="center">
        <Box width={["auto", "28rem"]}>
          <Heading textStyle="h2" marginBottom="2w">
            MessageScript
          </Heading>
          <Box>
            <FormControl as="fieldset">
              <FormLabel as="legend">Message : </FormLabel>
              <Input onChange={handleChange} name="msg" value={input.msg} placeholder="Message" required></Input>
              <Box mt="2rem">
                <FormLabel>Nom : </FormLabel>
                <Input onChange={handleChange} name="name" value={input.name} placeholder="Nom" required></Input>
              </Box>
              <Box mt="2rem">
                <Button textStyle="sm" variant="primary" onClick={handleClick}>
                  Sumbit
                </Button>
                <Button variant="secondary" onClick={onDeleteClicked} ml="2rem">
                  Delete
                </Button>
              </Box>
            </FormControl>
          </Box>
        </Box>
      </Center>
    </Layout>
  );
};

export default Message;
