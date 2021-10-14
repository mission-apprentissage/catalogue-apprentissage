import { Text } from "@chakra-ui/react";
import React from "react";

export const HabilitationPartenaire = ({ habilitation }) => {
  let color;
  let text = habilitation;
  switch (habilitation) {
    case "HABILITATION_ORGA_FORM":
      color = "green";
      text = "ORGANISER ET FORMER";
      break;
    case "HABILITATION_FORMER":
      color = "green";
      text = "FORMER";
      break;
    case "HABILITATION_ORGANISER":
      color = "red";
      text = "ORGANISER";
      break;
    default:
      break;
  }

  return (
    <Text as="strong" style={{ color }}>
      {text}
    </Text>
  );
};
