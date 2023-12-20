import React from "react";
import { Box, Text, Link } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <Box py={[4, 8]} px={[8, 24]} color="grey.750">
      <Text fontFamily="Marianne" fontWeight="400" fontSize={["gamma", "beta"]} pb={4}>
        Page inconnue
      </Text>
      <Text pb={2}>La page que vous cherchez n'existe pas.</Text>
      <Link as={RouterLink} to="/">
        Retourner à l'accueil
      </Link>
    </Box>
  );
};

export default NotFoundPage;
