import React from "react";
import {
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
  Heading,
  useToast,
} from "@chakra-ui/react";

import Datatable from "./Datatable";
import ModalAddEtablissement from "./addEtablissement";

import { _post, _put } from "../../../common/httpClient";

function reducer(state, values) {
  const { type, _id } = values;
  if (type === "supprimer") {
    return [...state];
  }

  const currentState = [...state];
  let index = currentState.findIndex((x) => x._id === _id);

  if (index !== -1) {
    currentState[index].type = type;
    return currentState;
  } else {
    return [...state, values];
  }
}

export default ({ data }) => {
  const [modalIsOpen, setModalIsOpen] = React.useState(false);
  const [mapping, setMapping] = React.useReducer(reducer, data.mapping_liaison_etablissement || []);
  const [matchingMnaEtablissement, setMatchingMnaEtablissement] = React.useState(data.matching_mna_etablissement);
  const [updated, setUpdated] = React.useState(false);
  const toast = useToast();

  const sameUai = new Set([data.uai_affilie, data.uai_composante, data.uai_gestionnaire]).size === 1;
  const sameEtab = new Set([data.libelle_uai_affilie, data.libelle_uai_composante]).size === 1;

  const toggle = () => setModalIsOpen(!modalIsOpen);
  const onSelectChange = async ({ _id, type, etablissement }) => {
    /**
     * FILTER TO BE REMOVE ONCE THE MATCHIN SCRIPT REMOVES DUPLICATE MATCHED ETABLISSEMENT FOR A SINGLE PSFORMATION
     * ADD TAGS (UAI_FORMATION / UAI_FORMATEUR/ UAI_GESTIONNAIRE) UN A SEPARATE OBJECT IF MULTIPLE MATCH ON THE SAME ESTABLISHMENT
     *
     * Upside —> will reduce the data size transfert, to heavy on matching 1 and 2.
     */
    const listEtablissementFiltre = matchingMnaEtablissement.filter((x) => x._id !== etablissement._id);
    const response = await _put("/api/psformation", {
      _id: data._id,
      matching_mna_etablissement: [...listEtablissementFiltre, { ...etablissement, type }],
    });
    setMatchingMnaEtablissement(response.matching_mna_etablissement);
    setMapping({ _id, type });
  };

  const onSuccessModal = async (newEtablissement) => {
    const response = await _put("/api/psformation", {
      _id: data._id,
      matching_mna_etablissement: [
        ...matchingMnaEtablissement,
        { ...newEtablissement, dangerously_added_by_user: true },
      ],
    });
    setMatchingMnaEtablissement(response.matching_mna_etablissement);
    setMapping({ type: newEtablissement.type, _id: newEtablissement._id });
    toggle();
  };

  const validate = async (e) => {
    const payload = {
      id: data._id,
      mapping_liaison_etablissement: mapping,
      mapping_code_cfd_formation: data.code_cfd,
      mapping_code_postal_formation: data.code_postal,
      mapping_id_formation_mna: "ID_MNA_FORMATION",
      mapping_id_formation_ps: data._id,
      mapping_annee_formation: "ANNEE_FORMATION",
      mapping_etat_reconciliation: "OK",
    };
    const response = await _post("/api/psformation", payload);
    if (response) {
      setUpdated(true);
    }
  };

  return (
    <Box bg="white" m={3}>
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
            <Box>{data && mapping.length > 0 && <Liaison data={mapping} />}</Box>
            <Box>
              {data && matchingMnaEtablissement.length > 0 && (
                <Etablissement data={matchingMnaEtablissement} onSelectChange={onSelectChange} />
              )}
            </Box>
            <Flex justify="center">
              <Box>Formation à vérifier</Box>
              <Spacer />
              <Box>
                <Button colorScheme="teal" variant="outline" pl={4} marginRight={4} onClick={toggle}>
                  Ajouter un établissement
                </Button>
                <Button colorScheme="teal" variant="solid" onClick={validate}>
                  Valider
                </Button>
              </Box>
            </Flex>
          </VStack>
        </AccordionPanel>
      </AccordionItem>
      <ModalAddEtablissement isOpen={modalIsOpen} onClose={toggle} onSuccess={onSuccessModal} />
      {updated && (
        <Box
          toast={toast({
            description: "Enregistré avec succès !",
            status: "success",
            duration: 2000,
            isClosable: true,
          })}
        />
      )}
    </Box>
  );
};

const Liaison = ({ data }) => {
  return (
    <Box p={4} bg="aliceblue">
      <Box>
        <Heading>Etablissements liés au catalogue :</Heading>
        <Divider mb={4} />
      </Box>
      <SimpleGrid columns={4} spacing={10}>
        {data.map((item, index) => {
          return (
            <Box key={index}>
              <Heading size="md"> Type: {item.type}</Heading>
              <Text fontSize="sm">
                Identifiant catalogue : <Text as="i">{item._id}</Text>
              </Text>
            </Box>
          );
        })}
      </SimpleGrid>
    </Box>
  );
};

const EnteteFormation = ({ data, sameUai }) => {
  return (
    <Box flex="1" textAlign="left">
      <Grid templateColumns=".5fr 2fr .5fr" gap={2}>
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
        {data.mapping_liaison_etablissement.length > 0 && (
          <GridItem>
            <Tag variant="solid" colorScheme="teal">
              FORMATION RAPPROCHÉE
            </Tag>
          </GridItem>
        )}
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
          <Text>Libellé BCN : {data.infobcn}</Text>
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

const Option = ({ _id, type, onSelectChange, etablissement }) => {
  const handleChange = (e) => onSelectChange({ type: e.target.value, _id: _id, etablissement: etablissement });

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

const Etablissement = ({ data, onSelectChange }) => {
  const columns = [
    {
      Cell: ({ value }) => {
        return <Option _id={value._id} type={value.type} onSelectChange={onSelectChange} etablissement={value} />;
      },
      accessor: ({ ...props }) => {
        return { ...props };
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
            return "";
        }
      },
      accessor: ({ matched_uai }) => (matched_uai ? matched_uai : ""),
      id: "matched_uai",
      Header: "Matching",
      maxWidth: 100,
    },
    {
      accessor: ({ uai }) => (uai ? uai : ""),
      id: "uai",
      Header: "Uai",
      maxWidth: 40,
    },
    {
      accessor: "siret",
      Header: "Siret",
      maxWidth: 40,
    },
    {
      accessor: ({ raison_sociale }) => (raison_sociale ? raison_sociale : ""),
      id: "raison_sociale",
      Header: "Raison Social",
      maxWidth: 40,
    },
    {
      accessor: ({ enseigne }) => (enseigne ? enseigne : ""),
      id: "enseigne",
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

  return (
    <>
      <Box>
        <Heading>Liste des établissement matché automatiquement ({data.length}) : </Heading>
        <Divider mb={4} />
      </Box>
      <Datatable headers={columns} data={data} />
    </>
  );
};
