import React, { useState, useEffect } from "react";
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
import { _post, _get, _put } from "../../common/httpClient";
import Layout from "../layout/Layout";
import { NavLink } from "react-router-dom";
import { ArrowDropRightLine } from "../../theme/components/icons";

const Message = () => {
  const [inputManuel, setInputManuel] = useState({
    type: "",
    msg: "",
    name: "",
  });
  const [inputAutomatique, setInputAutomatique] = useState({
    type: "",
    msg: "",
    name: "",
  });

  const [messageAutomatique, setMessageAutomatique] = useState([]);
  useEffect(() => {
    const run = async () => {
      const data = await _get("/api/v1/entity/messageScript");

      const a = data.filter((d) => d.type === "automatique");
      setMessageAutomatique(a);
      setInputAutomatique({
        type: a.type,
        msg: a.msg,
        name: a.name,
      });
    };
    run();
  }, []);

  const handleChangeManuel = (e) => {
    const { name, value } = e.target;
    setInputManuel((prevInput) => {
      return {
        ...prevInput,
        [name]: value,
      };
    });
  };

  const handleChangeAutomatique = (e) => {
    const { name, value } = e.target;
    setInputAutomatique((prevInput) => {
      return {
        ...prevInput,
        [name]: value,
      };
    });
  };

  const handleClickManuel = async (e) => {
    e.preventDefault();
    const newMessageScript = {
      type: "manuel",
      msg: inputManuel.msg,
      name: inputManuel.name,
    };
    const messagePosted = await _post("/api/v1/entity/messageScript", newMessageScript);
    if (messagePosted) {
      alert("Le message a bien été envoyé.");
    }
    window.location.reload();
  };

  const handleClickAutomatique = async (e) => {
    e.preventDefault();
    const newMessageScript = {
      type: "automatique",
      msg: inputAutomatique.msg,
      name: inputAutomatique.name,
    };
    const messagePosted = await _put(`/api/v1/entity/messageScript/${messageAutomatique._id}`, newMessageScript);
    if (messagePosted) {
      alert("Le message a bien été envoyé.");
    }
    window.location.reload();
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
              <BreadcrumbLink>Message de maintenance</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
        </Container>
      </Box>
      <Center mt={5} verticalAlign="center">
        <Box width={["auto", "28rem"]}>
          <Heading textStyle="h2" marginBottom="2w">
            Message de maintenance
          </Heading>
          <Box>
            <FormControl as="fieldset">
              <FormLabel as="legend">Message manuel: </FormLabel>
              <Input
                onChange={handleChangeManuel}
                name="msg"
                value={inputManuel.msg}
                placeholder="Message"
                required
              ></Input>
              <Box mt="2rem">
                <FormLabel>Text : </FormLabel>
                <Input
                  onChange={handleChangeManuel}
                  name="name"
                  value={inputManuel.name}
                  placeholder="Nom"
                  required
                ></Input>
              </Box>
              <Box mt="2rem">
                <Button textStyle="sm" variant="primary" onClick={handleClickManuel}>
                  Enregistrer
                </Button>
              </Box>
            </FormControl>
          </Box>
          <Box>
            <FormControl as="fieldset" mt={5}>
              <FormLabel as="legend">Message Automatique : </FormLabel>
              <Input
                onChange={handleChangeAutomatique}
                name="msg"
                value={inputAutomatique.msg}
                placeholder="Message Automatique"
                required
              ></Input>
              <Box mt="2rem">
                <FormLabel>Text : </FormLabel>
                <Input
                  onChange={handleChangeAutomatique}
                  name="name"
                  value={inputAutomatique.name}
                  placeholder="Text"
                  required
                ></Input>
              </Box>
              <Box mt="2rem">
                <Button textStyle="sm" variant="primary" onClick={handleClickAutomatique}>
                  Mettre à jour le message automatique
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
