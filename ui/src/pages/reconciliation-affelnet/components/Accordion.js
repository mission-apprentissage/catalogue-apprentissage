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

import { useMutation } from "react-query";

function reducer(state, values) {
  const { type, id } = values;

  const currentState = [...state];
  let index = currentState.findIndex((x) => x.id === id);

  if (index !== -1) {
    currentState[index].type = type;
    return currentState;
  } else {
    return [...state, values];
  }
}

export default ({ data }) => {
  const toast = useToast();
  const [modalIsOpen, setModalIsOpen] = React.useState(false);
  const [mapping, setMapping] = React.useReducer(reducer, data.reconciliation || []);
  const [reconciliation, setReconciliation] = React.useState(data.reconciliation || null);
  const [matchingMnaEtablissement, setMatchingMnaEtablissement] = React.useState(data.matching_mna_etablissement || []);

  const toggle = () => setModalIsOpen(!modalIsOpen);

  const onSelectChange = useMutation(
    (payload) =>
      _put("/api/affelnet/etablissement", {
        formation_id: data._id,
        etablissement_id: payload.etablissement._id,
        type: payload.type,
      }),
    {
      onSuccess: (data, payload) => {
        setMatchingMnaEtablissement(data.matching_mna_etablissement);
        setMapping({ id: payload._id, type: payload.type, siret: payload.siret });
      },
      onError: (error) => {
        console.log(error);
      },
    }
  );

  const onValidateAfReconciliation = useMutation(
    () =>
      _post("/api/affelnet/reconciliation", {
        id_formation: data._id,
        uai: data.uai,
        code_cfd: data.code_cfd,
        code_postal: data.code_postal,
        mapping: mapping,
      }),
    {
      onSuccess: (data) => {
        setReconciliation(data);
      },
      onError: (error) => {
        console.log("error", error);
      },
    }
  );

  const onValidateAfFormation = useMutation(() =>
    _post("/api/affelnet", {
      id: data._id,
      etat_reconciliation: true,
    })
  );

  const onSuccessModal = useMutation(
    (payload) =>
      _put("/api/affelnet", {
        formation_id: data._id,
        etablissement: { ...payload, dangerously_added_by_user: true },
      }),
    {
      onSuccess: (data, payload) => {
        setMatchingMnaEtablissement(data.matching_mna_etablissement);
        setMapping({ type: payload.type, _id: payload._id });
        toggle();
      },
    }
  );

  return (
    <Box bg="white" m={3}>
      <AccordionItem>
        <AccordionButton>
          <EnteteFormation data={data} />
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel pb={4}>
          <VStack divider={<StackDivider borderColor="gray.200" />} spacing={4} align="stretch">
            <Box>
              <DetailFormation data={data} />
            </Box>
            <Box>{reconciliation && <Liaison {...reconciliation} />}</Box>
            <Box>
              {data && matchingMnaEtablissement.length > 0 && (
                <Etablissement data={matchingMnaEtablissement} onSelectChange={onSelectChange} />
              )}
            </Box>
            <Flex justify="center">
              {/* <Box>Formation à vérifier</Box> */}
              <Spacer />
              <Box>
                <Button colorScheme="teal" variant="outline" pl={4} marginRight={4} onClick={toggle}>
                  Ajouter un établissement
                </Button>
                <Button
                  colorScheme="teal"
                  variant="solid"
                  onClick={() => {
                    onValidateAfReconciliation.mutate();
                    onValidateAfFormation.mutate();
                    toast({
                      description: "Enregistré avec succès !",
                      status: "success",
                      duration: 1000,
                      isClosable: true,
                    });
                  }}
                >
                  Valider
                </Button>
              </Box>
            </Flex>
          </VStack>
        </AccordionPanel>
      </AccordionItem>
      <ModalAddEtablissement isOpen={modalIsOpen} onClose={toggle} onSuccess={onSuccessModal} />
    </Box>
  );
};

const Liaison = ({ siret_formateur, siret_gestionnaire, uai }) => {
  return (
    <Box p={4} bg="aliceblue">
      <Box>
        <Heading>Etablissement(s) lié(s) :</Heading>
        <Divider mb={4} />
      </Box>
      <SimpleGrid columns={4} spacing={10}>
        <Box>
          <Text fontSize="xs">
            Uai gestionnaire: <Text as="i">{uai}</Text>
          </Text>
          <Text fontSize="xs">
            Siret formateur: <Text as="i">{siret_formateur}</Text>
          </Text>
          <Text fontSize="xs">
            Siret gestionnaire: <Text as="i">{siret_gestionnaire}</Text>
          </Text>
        </Box>
      </SimpleGrid>
    </Box>
  );
};

const EnteteFormation = ({ data }) => {
  return (
    <Box flex="1" textAlign="left">
      <Grid templateColumns=".5fr 2fr .5fr" gap={2}>
        <GridItem>
          <Text>Code UAI : {data.uai}</Text>
          <Text>Code formation : {data.code_cfd}</Text>
        </GridItem>
        <GridItem>
          <Text>{data.libelle_formation}</Text>
          <Text>{data.type_voie}</Text>
          <Text>
            {data.commune} - {data.code_postal}
          </Text>
        </GridItem>
        {data.reconciliation ? (
          data.reconciliation.unpublished_by_user ? (
            <GridItem>
              <Tag variant="solid" colorScheme="purple">
                FORMATION DEPUBLIÉ PAR L'UTILISATEUR
              </Tag>
            </GridItem>
          ) : (
            <GridItem>
              <Tag variant="solid" colorScheme="teal">
                FORMATION RAPPROCHÉE
              </Tag>
            </GridItem>
          )
        ) : null}
      </Grid>
    </Box>
  );
};

const DetailFormation = ({ data }) => {
  const style = {
    color: "rgb(12 80 118 / 0.8)",
    shadow: "2px 2px 2px 0px rgba(0,0,0,0.3)",
    textColor: "white",
  };
  return (
    <SimpleGrid columns={4} spacing={10}>
      <Box bg={style.color} p={2} borderRadius={2} shadow={style.shadow}>
        <Box>
          <Text color={style.textColor}>Unité administrative immatriculée</Text>
        </Box>
        <Box>
          <Text color={style.textColor}>{data.uai}</Text>
        </Box>
      </Box>
      <Box bg={style.color} p={2} borderRadius={2} shadow={style.shadow}>
        <Box>
          <Text color={style.textColor}>Code formation diplôme</Text>
        </Box>
        <Box>
          <Text color={style.textColor}>CFD : {data.code_cfd}</Text>
          <Text color={style.textColor}>Libellé BCN : {data.infobcn}</Text>
        </Box>
      </Box>
      <Box bg={style.color} p={2} borderRadius={2} shadow={style.shadow}>
        <Box>
          <Text color={style.textColor}>Etablissements</Text>
        </Box>
        <Box>
          <Text color={style.textColor}>{data.libelle_etablissement_tsa}</Text>
        </Box>
      </Box>
      <Box bg={style.color} p={2} borderRadius={2} shadow={style.shadow}>
        <Box>
          <Text color={style.textColor}>Lieu de formation</Text>
        </Box>
        <Box>
          <Text color={style.textColor}>{data.commune}</Text>
          <Text color={style.textColor}>{data.code_postal}</Text>
        </Box>
      </Box>
    </SimpleGrid>
  );
};

const Option = ({ _id, type, onSelectChange, etablissement }) => {
  const handleChange = (e) =>
    onSelectChange.mutate({ type: e.target.value, _id: _id, etablissement: etablissement, siret: etablissement.siret });

  return (
    <FormControl>
      <Select variant="outlined" onChange={handleChange} defaultValue={type ? type : ""}>
        <option value="" disabled>
          Options :
        </option>
        <option value="gestionnaire">Gestionnaire</option>
        <Divider />
        <option value="formateur">Formateur</option>
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
    },
    {
      Cell: ({ value }) => {
        return value.map((val, index) => {
          switch (val) {
            case "UAI_FORMATION":
              return (
                <Tag key={index} colorScheme="teal">
                  {val}
                </Tag>
              );

            case "UAI_FORMATEUR":
              return (
                <Tag key={index} colorScheme="yellow">
                  {val}
                </Tag>
              );

            case "UAI_GESTIONNAIRE":
              return (
                <Tag key={index} colorScheme="red">
                  {val}
                </Tag>
              );

            default:
              return <Tag key={index}>{val}</Tag>;
          }
        });
      },
      accessor: "matched_uai",
      Header: "Matching",
    },
    {
      accessor: ({ uai }) => (uai ? uai : ""),
      id: "uai",
      Header: "Uai",
    },
    {
      accessor: "siret",
      Header: "Siret",
    },
    {
      accessor: ({ raison_sociale }) => (raison_sociale ? raison_sociale : ""),
      id: "raison_sociale",
      Header: "Raison Social",
    },
    {
      accessor: ({ enseigne }) => (enseigne ? enseigne : ""),
      id: "enseigne",
      Header: "Enseigne",
    },
    {
      accessor: "adresse",
      Header: "Adresse",
    },
    {
      accessor: "naf_libelle",
      Header: "Nature",
    },
    {
      accessor: (value) => (value === true ? "Oui" : "Non"),
      id: "siege_social",
      Header: "Siège social",
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
