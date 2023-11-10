import React from "react";
import { NavLink } from "react-router-dom";
import { Badge, Text, Flex, Box, Heading, Link } from "@chakra-ui/react";
import { ArrowRightLine } from "../../../theme/components/icons";
import { QualiteBadge } from "../QualiteBadge";

const CardListEtablissement = ({ data, withoutLink }) => {
  const RenderCard = ({ withoutLink }) => {
    return (
      <>
        <Flex display={["none", "flex"]} textStyle="xs" justifyContent="space-between">
          <Text>Siret : {data.siret}</Text>
          <Text>Code UAI: {data.uai}</Text>
        </Flex>
        <QualiteBadge value={data.certifie_qualite} mt={2} ml={0} />
        <Flex w={"100%"} justifyContent="space-between" mb={2}>
          <Heading textStyle="h6" color="grey.800" mt={2} w={"100%"}>
            {data.entreprise_raison_sociale}
          </Heading>
          <Box></Box>
        </Flex>
        <Box>
          <Text textStyle="sm">{data.adresse}</Text>
          <Text textStyle="sm">Académie : {data.nom_academie}</Text>
          <Box>
            <Flex justifyContent="space-between">
              <Flex flexWrap={"wrap"}>
                {data.tags &&
                  data.tags
                    .sort((a, b) => a - b)
                    .map((tag, i) => (
                      <Badge variant="year" key={i}>
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
  return withoutLink ? (
    <Box p={8} bg="#F9F8F6">
      <RenderCard withoutLink />
    </Box>
  ) : (
    <Link as={NavLink} to={`/etablissement/${data._id}`} variant="card" mt={4}>
      <RenderCard />
    </Link>
  );
};

export default CardListEtablissement;
