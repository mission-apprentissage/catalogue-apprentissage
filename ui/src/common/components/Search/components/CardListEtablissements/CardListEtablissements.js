import React from "react";
import { Link } from "react-router-dom";
import { Badge, Text, Flex, Box, Heading } from "@chakra-ui/react";
// import "./cardListEtablissements.css";
import { ArrowRightLine } from "../../../../../theme/components/icons";

export const CardListEtablissements = ({ data }) => {
  return (
    <Link to={`/etablissement/${data._id}`} className="list-card" style={{ textDecoration: "none" }} target="_blank">
      <Box p={5} bg="#F9F8F6" mt={4}>
        <Flex display={["none", "flex"]} textStyle="xs" justifyContent="space-between">
          <Text>Siret : {data.siret}</Text>
          <Text>Code UAI: {data.uai}</Text>
        </Flex>
        <Heading textStyle="h6" color="grey.800" mt={2}>
          {data.entreprise_raison_sociale}
        </Heading>
        <div>
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
              <ArrowRightLine alignSelf="center" color="bluefrance" />
            </Flex>
          </Box>
        </div>
      </Box>
      {/* <div className="list-card-container ">
        <div className="thumbnail">
          <div className="field grow-1" />
          <div className="field grow-1">
            <p>UAI: {data.uai}</p>
            <p>Localité: {data.localite}</p>
          </div>
          <div className="field pills">
            {data.tags &&
              data.tags
                .sort((a, b) => a - b)
                .map((tag, i) => (
                  <Badge variant="solid" colorScheme="green" key={i} className="badge">
                    {tag}
                  </Badge>
                ))}
          </div>
        </div>
        <div className="content">
          <div style={{ display: "flex" }}>
            <h2>
              {data.entreprise_raison_sociale}
              <br />
              <small>{data.enseigne}</small>
            </h2>
          </div>
          <div>
            <p>{data.nom_academie}</p>
            <p>{data.code_postal}</p>
            <p>{data.adresse}</p>
          </div>
        </div>
      </div> */}
    </Link>
  );
};
