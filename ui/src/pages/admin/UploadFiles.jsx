import React, { useCallback, useEffect, useMemo, useState } from "react";
import Layout from "../layout/Layout";
import { Box, Button, Container, Input, ListItem, Select, Text, UnorderedList } from "@chakra-ui/react";
import { useDropzone } from "react-dropzone";
import { _postFile } from "../../common/httpClient";
import { Breadcrumb } from "../../common/components/Breadcrumb";
import useAuth from "../../common/hooks/useAuth";
import { setTitle } from "../../common/utils/pageUtils";
import { hasAccessTo } from "../../common/utils/rolesUtils";

const CATALOGUE_API = `${process.env.REACT_APP_BASE_URL}/api`;

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
  {
    filename: "CodeDiplome_RNCP_latest_kit.csv",
    label: "Kit code diplome - rncp",
    acl: "page_upload/kit-apprentissage",
  },
  {
    filename: "affelnet-import.xlsx",
    label: "Import Affelnet",
    acl: "page_upload/affelnet-formations",
  },
  {
    filename: "mefs-parcoursup.csv",
    label: "Liste de MEFs fiabilisés sur Parcoursup",
    acl: "page_upload/parcoursup-mefs",
  },
];

export default () => {
  const [auth] = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filename, setFilename] = useState(null);
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
      await _postFile(`${CATALOGUE_API}//upload`, data);
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

  useEffect(() => {
    setFilename([...DOCUMENTS.filter((doc) => auth && hasAccessTo(auth, doc.acl))][0]?.filename);
  }, [auth]);

  const title = "Formulaire d'upload de fichiers";
  setTitle(title);

  return (
    <Layout>
      <Box w="100%" pt={[4, 8]} px={[1, 1, 12, 24]} color="grey.800">
        <Container maxW="7xl">
          <Breadcrumb pages={[{ title: "Accueil", to: "/" }, { title: title }]} />
        </Container>
      </Box>
      <Box w="100%" minH="100vh" px={[1, 1, 12, 24]}>
        <Container maxW="7xl">
          <Text textStyle="h2" color="grey.800" mt={5} mb={5}>
            {title}
          </Text>

          <form onSubmit={onSubmit}>
            <Select
              value={filename}
              w="40%"
              mb={8}
              onChange={(e) => {
                setFilename(e.target.value);
              }}
            >
              {[...DOCUMENTS.filter((doc) => auth && hasAccessTo(auth, doc.acl))].map(({ filename, label }) => (
                <option value={filename} key={filename}>
                  {label}
                </option>
              ))}
            </Select>

            <Box {...getRootProps({ style })} mb={8}>
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
              <Box mb={8}>
                <Text as="h4" fontSize="delta">
                  Fichier
                </Text>
                <UnorderedList>
                  {acceptedFiles.map((file) => (
                    <ListItem key={file.path}>
                      {file.path} - {file.size} bytes
                    </ListItem>
                  ))}
                </UnorderedList>
              </Box>
            )}

            {filename === "CodeDiplome_RNCP_latest_kit.csv" && (
              <Box>
                Mode d’emploi :
                <br />
                <ul style={{ marginLeft: "24px" }}>
                  <li>
                    Le fichier Excel VF_Kit apprentissage et RNCP v.x.x est communiqué périodiquement par email par Inès
                    Jacqot (France Compétences)
                  </li>
                  <li>
                    Onglet CodeDiplome_RNCPvx.x : renommer les colonnes Code diplôme =&gt; Code_Diplome ; RNCP =&gt;
                    Code_RNCP
                  </li>
                  <li>Exporter cet onglet en csv via LibreOffice (séparateur point-virgule)</li>
                  <li>Upload à faire sur les catalogues (public, ME, recette + prod)</li>
                  <li>
                    Sur les tables de correspondances, faire une PR pour remplacer le fichier
                    server/src/jobs/rncpImporter/assets/CodeDiplome_RNCP_latest_kit.csv
                  </li>
                </ul>
                <br />
              </Box>
            )}

            {filename === "mefs-parcoursup.csv" && (
              <Box>
                Mode d’emploi :
                <br />
                <ul style={{ marginLeft: "24px" }}>
                  <li>
                    Extraction de la table bcn_n_mef réalisée par la Moss, pour identifier les MEF enregistrés dans
                    Parcoursup.
                  </li>
                  <li>
                    Permet au catalogue de contrôler que le MEF transmis par RCO existe dans le référentiel Parcoursup,
                    ou, lorsqu’il y a plusieurs MEF, de sélectionner le MEF correspondant au périmètre Parcoursup.
                  </li>
                  <li>
                    Format de fichier à déposer : fichier .csv, exporté de préférence via Open Office, paramètres UTF-8,
                    séparateur point-virgule, toutes autres options décochées.
                  </li>
                </ul>
                <br />
              </Box>
            )}

            <Button
              type="submit"
              variant="primary"
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
