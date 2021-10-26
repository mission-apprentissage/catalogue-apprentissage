import { Text } from "@chakra-ui/react";
import React from "react";

export const HabilitationPartenaire = ({ habilitation }) => {
  let color;
  let text = habilitation;
  switch (habilitation) {
    case "HABILITATION_ORGA_FORM":
      color = "gray.800";
      text = "Établissement habilité à organiser la formation et à former sur cette certification";
      break;
    case "HABILITATION_FORMER":
      color = "gray.800";
      text = "Établissement habilité à former sur cette certification";
      break;
    case "HABILITATION_ORGANISER":
      color = "red";
      text = "Établissement habilité à organiser la formation, mais non habilité à former pour cette certification";
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
