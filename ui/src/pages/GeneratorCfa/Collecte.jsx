import React from "react";
import { Box, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon } from "@chakra-ui/react";
import Layout from "../layout/Layout";
import { setTitle } from "../../common/utils/pageUtils";

import FormEmployer from "./components/FormEmployer";

// const endpointFront = `${process.env.REACT_APP_BASE_URL}/api`;

export default () => {
  const title = "Collecte de l'offre de formation";
  setTitle(title);
  return (
    <Layout>
      <Box w="100%" pt={[4, 8]} px={[1, 1, 12, 24]}>
        <Accordion allowToggle>
          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                Employeur
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <FormEmployer />
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </Box>
    </Layout>
  );
};
