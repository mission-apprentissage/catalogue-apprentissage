/**
 * Erreurs métiers Parcoursup
 *
 * @type {{regexp: RegExp, description: string, action: string}[]}
 */
const parcoursupErrors = [
  {
    regexp: /400 Mise à jour impossible : Code Établissement inconnu ou non renseigné/,
    description:
      "L'établissement vers lequel vous envoyez la formation est fermé dans la BCE, ou n'existe pas encore dans Parcoursup.",
    action: `Vous devez faire le point avec l'établissement, afin de confirmer l'UAI lieu de formation.
    Si l'établissement n'existe pas encore dans Parcoursup, vous devez procéder à sa création.`,
  },
  {
    regexp: /500 La filière n'a pas pu être retrouvée. Le RNCP : .* , correspond à .* fillière\(s\)\r\n/,
    description:
      "Le code RNCP est rattaché à plusieurs filières dans Parcoursup. La création de la formation n'est pas possible.",
    action: `Si le problème est lié au RNCP, il est probable qu'il n'existe pas encore dans Parcoursup. Vous pouvez transmettre les informations nécessaires au SCN pour création de la filière.`,
  },
  {
    regexp: /400 Mise à jour Impossible : Établissement fermé/,
    description: "L'UAI renseigné en tant que lieu de formation est fermé dans la BCE",
    action: `Vous devez faire le point avec l'établissement, afin de confirmer l'UAI lieu de formation.`,
  },
  {
    regexp: /500 Mise a jour refusée car la specialité ne correspond pas à la filière lié au g_ta_cod :.*/,
    description:
      "La formation ne peut pas être créée, car les codes rattachés correspondent à plusieurs filières ou aucune filière dans Parcoursup.",
    action: ` Vous devez vous assurer que les codes (MEF et CFD) rattachés à la formation dans le catalogue  sont bien ouverts dans la BCN. Dans l'éventualité où le code RNCP de la formation n'existerait pas encore dans Parcoursup, vous pouvez transmettre les informations nécessaires via la rubrique contact pour création de la formation.`,
  },
  {
    regexp: /400 La filière n'a pas pu être retrouvée. Le CFD : .+ correspond à n fillières\r\nLe RNCP : .* /,
    description: "La formation que vous souhaitez mettre à jour ne correspond pas à celle qui existe dans Parcoursup.",
    action: `Vous devez vous assurer que la formation en attente de publication correspond à une formation existante dans Parcoursup.`,
  },
  {
    regexp: /400 Erreur lors de la creation : Ce type de formation est marqué "Fermé" dans la BCN. Vous ne pouvez donc pas créer une formation de ce type./,
    description:
      "La formation est obsolète au niveau de la BCN. Vérifier que le code MEF utilisé dans le catalogue correspond au code MEF le plus récent pour cette formation.",
    action: `Vous pouvez faire un message dans la rubrique contact parcoursup en indiquant le ou les codes BCN trouvés.`,
  },
  {
    regexp: /400 Impossible de créer : Établissement inconnu/,
    description: "L'établissement d'accueil n'existe pas encore dans Parcoursup.",
    action: `Vous devez créer l'établissement (profil établissement d'accueil) dans Parcoursup puis relancer la publication une fois que la création est effectuée.`,
  },
  {
    regexp: /400 L'UAI ne correspond pas à un IUT alors que le type de formation correspond à un BUT/,
    description: "Les BUT en apprentissage ne peuvent pas être proposés par un CFA qui n'est pas un IUT.",
    action: `Si cette formation est bien proposée par un IUT, vous devez corriger l'UAI du lieu de formation dans le catalogue puis relancer la publication depuis le catalogue. Si cette formation n'est pas proposée par un IUT, vous devez modifier le statut de la fiche en "non publié" pour que cette formation ne soit plus envoyée à Parcoursup.`,
  },
  {
    regexp: /400 La filière n'a pas pu être retrouvée\. Le MEF : .*correspond à .* fillières\r\nLe CFD : .*correspond à .* fillières\r\nLe RNCP : .*/,
    description:
      "Aucune formation correspondant aux codes envoyés n'existe dans Parcoursup. En général il s'agit d'un CFD (code formation diplôme) ou d'un RNCP qui n'existe pas encore dans Parcoursup. .",
    action: `Vous devez faire un message dans la rubrique contact parcoursup en adressant le tableau excel contenant les indications nécessaires à la création  de la formation(intitulé, code CFD, RNCP...).`,
  },
  {
    regexp: /400 Le code RCO .+ existe dejà sur un autre établissement .+/,
    description: "Cette fiche formation a déjà été envoyée dans Parcoursup, elle est identifiée comme un doublon.",
    action: `Vous pouvez faire un message dans la rubrique contact parcoursup en indiquant l'ensemble des éléments permettant de rattacher la formation vers le bon établissement.`,
  },

  {
    regexp: /400 La formation .+ n'est pas accessible depuis parcoursup+/,
    description: "Le code Parcoursup de la formation n'est plus actif sur Parcoursup.",
    action: ``,
  },

  {
    regexp: /200 Impossible de retrouver un utilisateur valide pour .+/,
    description: "Vous devez faire le point avec l'établissement, afin de confirmer l'UAI lieu de formation.",
    action: ``,
  },

  {
    regexp: /200 Impossible de creer, etablissement gestionnaire non unique pour .+/,
    description: "L'UAI renseigné en tant que lieu de formation est fermé dans la BCE.",
    action: `Vous devez faire le point avec l'établissement, afin de confirmer l'UAI lieu de formation.`,
  },
  {
    regexp: /400 Mise à jour Impossible : Cette formation n'est plus sur l'UAI .+, mais sur l'UAI .+/,
    description:
      "La mise à jour de la formation est actuellement impossible car cette formation est rattachée dans Parcoursup à un autre UAI.",
    action: `Vous devez vous assurer du lieu de formation et si nécessaire mettre à jour l'UAI.`,
  },
  {
    regexp: /400 Mise à jour impossible : Code Établissement inconnu ou non renseigné.+/,
    description:
      "L'UAI renseigné en tant que lieu de formation est fermé dans la BCE, ou n'a pas encore crée dans Parcoursup.",
    action: `Vous devez faire le point avec l'établissement, afin de confirmer l'UAI lieu de formation. Si l'établissement n'existe pas encore dans Parcoursup, vous devez procéder à sa création dans Parcoursup.`,
  },
  {
    regexp: /400 Formation déclarée fermée dans Parcoursup : g_ta_cod = +/,
    description: "Formation déclarée fermée dans Parcoursup",
    action: ``,
  },
];

module.exports = { parcoursupErrors };
