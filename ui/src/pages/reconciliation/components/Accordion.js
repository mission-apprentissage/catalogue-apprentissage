import React from "react";
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  GridItem,
  Grid,
  Box,
  AccordionPanel,
  AccordionIcon,
  SimpleGrid,
  VStack,
  StackDivider,
  Flex,
  Spacer,
  FormControl,
  Select,
  Tag,
  Text,
  Button,
  Divider,
} from "@chakra-ui/react";

import Datatable from "./Datatable";
import ModalAddEtablissement from "./addEtablissement";

import { _put } from "../../../common/httpClient";
import { Context } from "../context";

export default ({ data }) => {
  const { mapping } = React.useContext(Context);

  const [modalIsOpen, setModalIsOpen] = React.useState(false);
  const [matchingMnaEtablissement, setMatchingMnaEtablissement] = React.useState(data.matching_mna_etablissement);

  const sameUai = new Set([data.uai_affilie, data.uai_composante, data.uai_gestionnaire]).size === 1 ? true : false;
  const sameEtab = new Set([data.libelle_uai_affilie, data.libelle_uai_composante]).size === 1 ? true : false;

  const toggle = () => setModalIsOpen(!modalIsOpen);

  const onSuccessModal = (newEtablissement) => {
    const response = _put("/api/coverage", {
      matching_mna_etablissement: [
        ...matchingMnaEtablissement,
        { ...newEtablissement, dangerously_added_by_user: true },
      ],
    });
    setMatchingMnaEtablissement(response.matching_mna_etablissement);
  };

  const onValidate = () => {};

  return (
    <>
      <Accordion allowToggle>
        <AccordionItem>
          <AccordionButton>
            <EnteteFormation data={data} sameUai={sameUai} />
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <VStack divider={<StackDivider borderColor="gray.200" />} spacing={4} align="stretch">
              <Box>
                <DetailFormation data={data} sameEtab={sameEtab} sameUai={sameUai} />
              </Box>
              <Box>
                {data && matchingMnaEtablissement.length > 0 && (
                  <Etablissement formationId={data._id} data={matchingMnaEtablissement} />
                )}
              </Box>
              <Flex justify="center">
                <Box>Formation à vérifier</Box>
                <Spacer />
                <Box>
                  <Button onClick={toggle}>Ajouter un établissement</Button>
                  <Button>Valider</Button>
                </Box>
              </Flex>
            </VStack>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
      <ModalAddEtablissement isOpen={modalIsOpen} onClose={toggle} onSuccess={onSuccessModal} />
    </>
  );
};

const EnteteFormation = ({ data, sameUai }) => {
  return (
    <Box flex="1" textAlign="left">
      <Grid templateColumns=".5fr 2fr" gap={2}>
        <GridItem>
          <Text>{data.libelle_uai_affilie}</Text>
          {sameUai ? (
            <Text>UAI : {data.uai_affilie}</Text>
          ) : (
            <Text>
              <Text>Affilié : {data.uai_affilie}</Text>
              <Text>Composante : {data.uai_composante}</Text>
              <Text>Gestionnaire : {data.uai_gestionnaire}</Text>
            </Text>
          )}
          <Text>Code formation : {data.code_cfd}</Text>
        </GridItem>
        <GridItem>
          <Text>{data.libelle_formation}</Text>
          <Text>{data.libelle_specialite}</Text>
          <Text>
            {data.libelle_commune} - {data.code_postal}
          </Text>
        </GridItem>
      </Grid>
    </Box>
  );
};

const DetailFormation = ({ data, sameEtab, sameUai }) => {
  const color = "lightgray";
  return (
    <SimpleGrid columns={4} spacing={10}>
      <Box bg={color} p={2} borderRadius={2} shadow="2px 2px 2px 0px rgba(0,0,0,0.1)">
        <Box>
          <Text>Unité administrative immatriculée</Text>
        </Box>
        <Box>
          {sameUai ? (
            <Text>{data.uai_affilie}</Text>
          ) : (
            <>
              <Text>Affilié : {data.uai_affilie}</Text>
              <Text>Composante : {data.uai_composante}</Text>
              <Text>Gestionnaire : {data.uai_gestionnaire}</Text>
            </>
          )}
        </Box>
      </Box>
      <Box bg={color} p={2} borderRadius={2} shadow="2px 2px 2px 0px rgba(0,0,0,0.1)">
        <Box>
          <Text>Code formation diplôme</Text>
        </Box>
        <Box>
          <Text>CFD : {data.code_cfd}</Text>
          <Text>Libellé long BCN</Text>
        </Box>
      </Box>
      <Box bg={color} p={2} borderRadius={2} shadow="2px 2px 2px 0px rgba(0,0,0,0.1)">
        <Box>
          <Text>Etablissements</Text>
        </Box>
        <Box>
          {sameEtab ? (
            <Text>{data.libelle_uai_affilie}</Text>
          ) : (
            <>
              <Text>Affilié : {data.libelle_uai_affilie}</Text>
              <Text>Composante : {data.libelle_uai_composante}</Text>
            </>
          )}
        </Box>
      </Box>
      <Box bg={color} p={2} borderRadius={2} shadow="2px 2px 2px 0px rgba(0,0,0,0.1)">
        <Box>
          <Text>Lieu de formation</Text>
        </Box>
        <Box>
          <Text>{data.libelle_commune}</Text>
          <Text>{data.code_postal}</Text>
        </Box>
      </Box>
    </SimpleGrid>
  );
};

const Option = ({ id, formationId, type }) => {
  const { updateMapping } = React.useContext(Context);
  const handleChange = (e) => updateMapping({ formationId: formationId, type: e.target.value, etablissementId: id });

  return (
    <FormControl>
      <Select variant="outlined" onChange={handleChange} defaultValue={type ? type : ""}>
        <option value="" disabled>
          Options :
        </option>
        <option value="gestionnaire">Gestionnaire</option>
        <option value="formateur">Formateur</option>
        <option value="formateur-gestionnaire">Formateur & Gestionnaire</option>
        <Divider />
        <option value="supprimer">Supprimer</option>
      </Select>
    </FormControl>
  );
};

const Etablissement = ({ data, formationId }) => {
  const columns = [
    {
      Cell: ({ value }) => <Option id={value.id} type={value.type} formationId={formationId} />,
      accessor: ({ _id, type }) => {
        return { id: _id, type: type };
      },
      id: "_id",
      Header: "Action",
      // maxWidth: 100,
    },
    {
      Cell: ({ value }) => {
        switch (value) {
          case "UAI_FORMATION":
            return <Tag colorScheme="teal">{value}</Tag>;

          case "UAI_FORMATEUR":
            return <Tag colorScheme="red">{value}</Tag>;

          case "UAI_GESTIONNAIRE":
            return <Tag colorScheme="yellow">{value}</Tag>;

          default:
            break;
        }
      },
      accessor: "matched_uai",
      Header: "Matching",
      maxWidth: 100,
    },
    {
      accessor: "uai",
      Header: "Uai",
      maxWidth: 40,
    },
    {
      accessor: "siret",
      Header: "Siret",
      maxWidth: 40,
    },
    {
      accessor: "raison_sociale",
      Header: "Raison Social",
      maxWidth: 40,
    },
    {
      accessor: "enseigne",
      Header: "Enseigne",
      maxWidth: 40,
    },
    {
      accessor: "adresse",
      Header: "Adresse",
      maxWidth: 400,
    },
    {
      accessor: "naf_libelle",
      Header: "Nature",
      maxWidth: 40,
    },
    {
      accessor: (value) => (value === true ? "Oui" : "Non"),
      id: "siege_social",
      Header: "Siège social",
      maxWidth: 40,
    },
  ];

  return <Datatable headers={columns} data={data} />;
};
