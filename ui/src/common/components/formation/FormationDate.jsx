import React, { Fragment } from "react";
import { Text } from "@chakra-ui/react";

export const FormationDate = ({ formation }) => {
  const dates = formation.date_debut
    ?.map((date_debut, index) => ({
      date_debut,
      date_fin: formation.date_fin ? formation.date_fin[index] : null,
      modalites_entrees_sorties: formation.modalites_entrees_sorties
        ? formation.modalites_entrees_sorties[index]
        : null,
    }))
    .sort((a, b) => new Date(a.date_debut) - new Date(b.date_debut));

  return (
    <Text variant="highlight" as="span">
      {dates?.map(({ date_debut, date_fin, modalites_entrees_sorties }) => (
        <>
          Du {new Date(date_debut).toLocaleDateString("fr-FR")} au {new Date(date_fin).toLocaleDateString("fr-FR")}.{" "}
          {modalites_entrees_sorties && "Entrée-sortie permanente."}
          <br />
        </>
      ))}
    </Text>
  );
};
