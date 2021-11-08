import React from "react";
import { Box, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon } from "@chakra-ui/react";
import Layout from "../layout/Layout";
import { setTitle } from "../../common/utils/pageUtils";
import FormEmployer from "./components/FormEmployer";
import FormLearner from "./components/FormLearner";
import FormLearningMaster from "./components/FormLearningMaster";
import FormContract from "./components/FormContract";
import FormFormation from "./components/FormFormation";
import FormSubmittingContract from "./components/FormSubmittingContract";

const tabsFormAccordion = [
  {
    title: "EMPLOYEUR",
    Component: FormEmployer,
  },
  {
    title: "APPRENTI(E)",
    Component: FormLearner,
  },
  {
    title: "LE MAÎTRE D’APPRENTISSAGE",
    Component: FormLearningMaster,
  },
  {
    title: "LE CONTRAT",
    Component: FormContract,
  },
  {
    title: "LA FORMATION",
    Component: FormFormation,
  },
  {
    title: "CADRE RÉSERVÉ À L’ORGANISME EN CHARGE DU DÉPÔT DU CONTRAT",
    Component: FormSubmittingContract,
  },
];

export default () => {
  const title = "Collecte de l'offre de formation";
  setTitle(title);
  return (
    <Layout>
      <Box w="100%" pt={[4, 8]} px={[1, 1, 12, 24]}>
        <Accordion allowToggle>
          {tabsFormAccordion.map(({ title, Component }, key) => {
            return (
              <AccordionItem key={key}>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    {title}
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <Component />
                </AccordionPanel>
              </AccordionItem>
            );
          })}
        </Accordion>
      </Box>
    </Layout>
  );
};
