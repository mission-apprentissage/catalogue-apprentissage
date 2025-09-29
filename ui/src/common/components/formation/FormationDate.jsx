import { Box, ListItem, UnorderedList } from "@chakra-ui/react";

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
    <Box style={{ background: "#f9f8f6" }}>
      <UnorderedList style={{ px: 2, py: 0.5, fontWeight: 700 }}>
        {dates?.map(
          (
            {
              date_debut,
              date_fin,
              modalites_entrees_sorties,
              effectif_minimal,
              capacite_simultanee,
              capacite_cumulee,
            },
            index
          ) => (
            <ListItem key={index}>
              Du {new Date(date_debut).toLocaleDateString("fr-FR")} au {new Date(date_fin).toLocaleDateString("fr-FR")}.{" "}
              <Box as="span" fontWeight="normal">
                {modalites_entrees_sorties && "Entrée-sortie permanente."}{" "}
                {
                  <>
                    {[
                      `Effectif minimal : ${effectif_minimal ?? "non précisé"}.`,
                      `Capacité simultanée : ${capacite_simultanee ?? "non précisée"}.`,
                      `Capacité cumulée : ${capacite_cumulee ?? "non précisée"}.`,
                    ].join(" ")}
                  </>
                }
              </Box>
              <br />
            </ListItem>
          )
        )}
      </UnorderedList>
    </Box>
  );
};
