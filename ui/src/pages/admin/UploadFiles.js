import React, { useMemo, useState, useCallback } from "react";
import Layout from "../layout/Layout";
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Container,
  Heading,
  Input,
  ListItem,
  Select,
  Text,
  UnorderedList,
} from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { _postFile } from "../../common/httpClient";

const endpointNewFront = process.env.REACT_APP_ENDPOINT_NEW_FRONT || "https://catalogue.apprentissage.beta.gouv.fr/api";

const baseStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "20px",
  borderWidth: 2,
  borderColor: "#9c9c9c",
  borderStyle: "dashed",
  color: "#9c9c9c",
  transition: "border .24s ease-in-out",
};

const activeStyle = {
  borderColor: "#3a55d1",
};

const DOCUMENTS = [
  // {
  //   filename: "BaseDataDock-latest.xlsx",
  //   label: "datadock",
  // },
  // {
  //   filename: "latest_public_ofs.csv",
  //   label: "Liste des OFs",
  // },
  {
    filename: "CodeDiplome_RNCP_latest_kit.csv",
    label: "Kit code diplome - rncp",
  },
  {
    filename: "affelnet-import.xlsx",
    label: "Import Affelnet",
  },
];

export default () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filename, setFilename] = useState(DOCUMENTS[0].filename);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);

  const maxFiles = 1;

  const onDrop = useCallback(() => {
    setUploadError(null);
    setUploadSuccess(null);
  }, []);

  const onDropRejected = useCallback((rejections) => {
    setUploadError(`Ce fichier ne peut pas être déposé sur le serveur: ${rejections?.[0]?.errors?.[0]?.message}`);
  }, []);

  const { acceptedFiles, getRootProps, getInputProps, isDragActive } = useDropzone({
    maxFiles,
    onDrop,
    onDropRejected,
    accept: ".csv, .xlsx",
  });

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isDragActive ? activeStyle : {}),
    }),
    [isDragActive]
  );

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const renamedAcceptedFiles = acceptedFiles.map((file) => new File([file], filename, { type: file.type }));
      const data = new FormData();
      data.append("file", renamedAcceptedFiles[0]);
      await _postFile(`${endpointNewFront}/v1/upload`, data);
      setUploadSuccess(`Merci, le fichier a bien été déposé sur le serveur :)`);
    } catch (e) {
      const messages = await e?.json;
      setUploadError(`Une erreur est survenue : ${messages?.error ?? e.message}`);
    } finally {
      // reset dropzone files
      acceptedFiles.splice(0, acceptedFiles.length);
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <Box bg="secondaryBackground" w="100%" pt={[4, 8]} px={[1, 24]}>
        <Container maxW="xl">
          <Breadcrumb>
            <BreadcrumbItem>
              <BreadcrumbLink as={NavLink} to="/">
                Accueil
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>Upload de fichiers</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
        </Container>
      </Box>
      <Box bg="secondaryBackground" w="100%" minH="100vh" py={[1, 8]} px={[1, 24]}>
        <Container maxW="xl">
          <Heading as="h1" mb={8} mt={2}>
            Formulaire d'upload de fichiers
          </Heading>

          <form onSubmit={onSubmit}>
            <Select
              value={filename}
              bg="white"
              w="30%"
              mb={8}
              onChange={(e) => {
                setFilename(e.target.value);
              }}
            >
              {DOCUMENTS.map(({ filename, label }) => (
                <option value={filename} key={filename}>
                  {label}
                </option>
              ))}
            </Select>
            <Box {...getRootProps({ style })} mb={5}>
              <Input {...getInputProps()} />
              {isDragActive ? (
                <Text>Glissez et déposez ici ...</Text>
              ) : (
                <>
                  <Text>Glissez et déposez un fichier ici, ou cliquez pour sélectionner un fichier</Text>
                  <Text as="em">
                    ({maxFiles} fichier (s) correspond au nombre maximum de fichiers que vous pouvez déposer ici)
                  </Text>
                </>
              )}
            </Box>
            {acceptedFiles.length > 0 && (
              <Box mb={5}>
                <Heading as="h4" fontSize="delta">
                  Fichier
                </Heading>
                <UnorderedList>
                  {acceptedFiles.map((file) => (
                    <ListItem key={file.path}>
                      {file.path} - {file.size} bytes
                    </ListItem>
                  ))}
                </UnorderedList>
              </Box>
            )}
            <Button
              type="submit"
              colorScheme="blue"
              isLoading={isSubmitting}
              loadingText="Envoi en cours"
              isDisabled={acceptedFiles.length === 0}
            >
              Envoyer le fichier
            </Button>
            {uploadError && (
              <Text color="error" mt={5}>
                {uploadError}
              </Text>
            )}
            {uploadSuccess && (
              <Text color="success" mt={5}>
                {uploadSuccess}
              </Text>
            )}
          </form>
        </Container>
      </Box>
    </Layout>
  );
};
