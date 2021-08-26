import React from "react";
import { NavLink } from "react-router-dom";
import { Text, Flex, Box, Heading, Link } from "@chakra-ui/react";
import { ArrowRightLine } from "../../../../theme/components/icons";

const identicalColor = "greensoft.300";
const neutralColor = "galt";

const CardEtablissements = ({ data, withoutLink }) => {
  return (
    <Box p={8} bg="#F9F8F6">
      <Flex display={["none", "flex"]} textStyle="xs" justifyContent="space-between">
        <Text as="div">
          Siret :{" "}
          <Text
            variant="highlight"
            bg={`${data.siret_match ? identicalColor : neutralColor}`}
            mt="1"
            display="inline-block"
          >
            {data.siret}
          </Text>
        </Text>
        <Text as="div">
          Code UAI:{" "}
          <Text
            variant="highlight"
            bg={`${data.uai_match ? identicalColor : neutralColor}`}
            mt="1"
            display="inline-block"
          >
            {data.uai}
          </Text>
        </Text>
      </Flex>
      <Heading textStyle="h6" fontSize={"0.9rem"} color="grey.800" mt={3}>
        {data.entreprise_raison_sociale}
      </Heading>
      <Box>
        <Text textStyle="sm" mb={3}>
          Adresse : <br /> {data.adresse}
        </Text>
        <Text textStyle="sm" mt={3} as="div">
          Code Commune :{" "}
          <Text
            variant="highlight"
            bg={`${data.code_commune_match ? identicalColor : neutralColor}`}
            mt="1"
            display="inline-block"
          >
            {data.code_commune_insee}
          </Text>
        </Text>
        <Text textStyle="sm" mt={3} as="div">
          Académie :{" "}
          <Text
            variant="highlight"
            bg={`${data.academie_match ? identicalColor : neutralColor}`}
            mt="1"
            display="inline-block"
          >
            {data.nom_academie}
          </Text>
        </Text>
        <Box>
          <Flex justifyContent="flex-end">
            {!withoutLink && (
              <Link
                as={NavLink}
                to={`/etablissement/${data._id}`}
                variant="link"
                isExternal
                fontSize={"0.8rem"}
                fontWeight="normal"
              >
                Détails <ArrowRightLine alignSelf="center" color="bluefrance" boxSize={3} />
              </Link>
            )}
          </Flex>
        </Box>
      </Box>
    </Box>
  );
};

export { CardEtablissements };
