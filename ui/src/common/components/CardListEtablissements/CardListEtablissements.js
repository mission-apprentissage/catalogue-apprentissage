import React from "react";
import { NavLink } from "react-router-dom";
import { Badge, Text, Flex, Box, Heading, Link } from "@chakra-ui/react";
import { ArrowRightLine } from "../../../theme/components/icons";

const CardListEtablissements = ({ data, withoutLink }) => {
  const RenderCard = ({ withoutLink }) => {
    return (
      <>
        <Flex display={["none", "flex"]} textStyle="xs" justifyContent="space-between">
          <Text>Siret : {data.siret}</Text>
          <Text>Code UAI: {data.uai}</Text>
        </Flex>
        <Heading textStyle="h6" color="grey.800" mt={2}>
          {data.entreprise_raison_sociale}
        </Heading>
        <Box>
          <Text textStyle="sm">{data.adresse}</Text>
          <Text textStyle="sm">Académie : {data.nom_academie}</Text>
          <Box>
            <Flex justifyContent="space-between">
              <Flex>
                {data.tags &&
                  data.tags
                    .sort((a, b) => a - b)
                    .map((tag, i) => (
                      <Badge
                        variant="solid"
                        bg="greenmedium.300"
                        borderRadius="16px"
                        color="grey.800"
                        textStyle="sm"
                        px="15px"
                        mr="10px"
                        mt={3}
                        key={i}
                      >
                        {tag}
                      </Badge>
                    ))}
              </Flex>
              {!withoutLink && <ArrowRightLine alignSelf="center" color="bluefrance" boxSize={4} />}
            </Flex>
          </Box>
        </Box>
      </>
    );
  };
  return !withoutLink ? (
    <Link as={NavLink} to={`/etablissement/${data._id}`} variant="card" mt={4} isExternal>
      <RenderCard withoutLink />
    </Link>
  ) : (
    <Box p={8} bg="#F9F8F6">
      <RenderCard />
    </Box>
  );
};

export default CardListEtablissements;
