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
      effectif_minimal: formation.effectif_minimal ? formation.effectif_minimal[index] : null,
      capacite_simultanee: formation.capacite_simultanee ? formation.capacite_simultanee[index] : null,
      capacite_cumulee: formation.capacite_cumulee ? formation.capacite_cumulee[index] : null,
    }))
    .sort((a, b) => new Date(a.date_debut) - new Date(b.date_debut));

  return (
    <Text variant="highlight" as="span">
      {dates?.map(
        (
          { date_debut, date_fin, modalites_entrees_sorties, effectif_minimal, capacite_simultanee, capacite_cumulee },
          index
        ) => (
          <Fragment key={index}>
            Du {new Date(date_debut).toLocaleDateString("fr-FR")} au {new Date(date_fin).toLocaleDateString("fr-FR")}.{" "}
            {modalites_entrees_sorties && "Entrée-sortie permanente."}
            {(effectif_minimal || capacite_simultanee || capacite_cumulee) && (
              <>
                {" "}
                {[
                  `Effectif minimal : ${effectif_minimal ?? "non précisé"}.`,
                  `Capacité simultanée : ${capacite_simultanee ?? "non précisée"}.`,
                  `Capacité cumulée : ${capacite_cumulee ?? "non précisée"}.`,
                ].join(" ")}
              </>
            )}
            <br />
          </Fragment>
        )
      )}
    </Text>
  );
};
