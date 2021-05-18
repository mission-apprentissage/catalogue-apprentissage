import React from "react";
import { Box } from "@chakra-ui/react";
import "./search.css";
import ResultsEs from "./Results";

export default ({ match, location }) => {
  return (
    <Box className="search-page">
      <ResultsEs match={match} location={location} />
    </Box>
  );
};
