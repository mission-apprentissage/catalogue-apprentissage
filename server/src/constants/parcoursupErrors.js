const parcoursupErrors = [
  {
    regexp: /400 Erreur lors de la creation : Ce type de formation est marqué "Fermé" dans la BCN. Vous ne pouvez donc pas créer une formation de ce type./,
    description:
      "Il semble que cette formation est obsolète au niveau de la BCN. Vérifier que le code MEF utilisé dans le catalogue correspond au plus récent pour cette formation.",
    action: `Faire un message dans contact parcoursup au SCN en indiquant le ou les codes BCN trouvés.`,
  },
  {
    regexp: /400 Impossible de créer : Établissement inconnu/,
    description: "L'établissement d'accueil n'existe pas encore dans Parcoursup.",
    action: `Créer l'établissement (profil établissement d'accueil) et accompagner le paramétrage dans Parcoursup; relancer la publication une fois que le paramétrage est validé.`,
  },
  {
    regexp: /400 L'UAI ne correspond pas à un IUT alors que le type de formation correspond à un BUT/,
    description: "Les BUT en apprentissage ne peuvent pas être proposés par un CFA qui n'est pas un IUT.",
    action: `Si c'est bien un IUT qui propose la formation, corriger l'UAI du lieu de formation pour qu'il corresponde à l'IUT déjà présent dans parcoursup. Puis signalez au SCN via contact pour déblocage de la création via webservice. Si ce n'est pas un IUT: modifier le statut de la fiche en "non publié" pour que cette formation ne soit plus dans le webservice. .`,
  },
  {
    regexp: /400 La filière n'a pas pu être retrouvée. Le MEF : correspond à .* fillières Le CFD : .* correspond à .* fillières Le RNCP : .*, correspond à .* fillière(s)/,
    description:
      "Aucune formation correspondant aux codes envoyés n'existe dans Parcoursup. En général il s'agit d'un CFD (code formation diplôme) ou d'un RNCP qui n'existe pas encore dans Parcoursup. .",
    action: `Adresser au SCN via contact le tableau excel contenant les indications nécessaires à la création (intitulé, code CFD, RNCP...).`,
  },
  {
    regexp: /400 Le code RCO .+ existe dejà sur un autre établissement .+/,
    description:
      "Cette fiche formation a déjà été rapprochée ou envoyée via webservice dans Parcoursup vers un autre établissement, elle est identifiée comme un doublon.",
    action: `Adresser au SCN ou à la MOSS après analyse de votre part les éléments permettant de savoir où doit être réellement créée la formation.`,
  },
];

module.exports = { parcoursupErrors };
