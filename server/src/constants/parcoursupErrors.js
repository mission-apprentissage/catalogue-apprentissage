/**
 * Erreurs métiers Parcoursup
 *
 * @type {{regexp: RegExp, description: string, action: string}[]}
 */
const parcoursupErrors = [
  {
    regexp: /Mise à jour impossible : Code Établissement inconnu ou non renseigné/,
    description:
      "L'établissement vers lequel vous envoyez la formation est fermé dans la BCE, ou n'existe pas encore dans Parcoursup.",
    action: `Vous devez faire le point avec l'établissement, afin de confirmer l'UAI lieu de formation.
    Si l'établissement n'existe pas encore dans Parcoursup, vous devez procéder à sa création.`,
  },
  {
    regexp: /La filière n'a pas pu être retrouvée. Le RNCP : .* , correspond à .* fillière\(s\)\r\n/,
    description:
      "Le code RNCP est rattaché à plusieurs filières dans Parcoursup. La création de la formation n'est pas possible.",
    action: `Si le problème est lié au RNCP, il est probable qu'il n'existe pas encore dans Parcoursup. Vous pouvez transmettre les informations nécessaires au SCN pour création de la filière.`,
  },
  {
    regexp: /Mise à jour Impossible : Établissement fermé/,
    description: "L'établissement est fermé dans Parcoursup.",
    action: `Vous pouvez vérifier la base ACCÉ pour vous assurer que l'UAI est bien déclaré comme fermé avant de reprendre contact avec l'établissement pour clarifier la situation. Vous pourrez modifier l'UAI sur cette fiche si besoin.`,
  },
  {
    regexp: /Mise a jour refusée car la specialité ne correspond pas à la filière lié au g_ta_cod :.*/,
    description: "La formation est actuellement rattachée dans la base de données Parcoursup à une autre filière. ",
    action: `Vous pouvez faire un message dans la rubrique contact Parcoursup en indiquant l’URL de l’offre que la Moss rectifie les enregistrements dans la base de données.`,
  },
  {
    regexp: /La filière n'a pas pu être retrouvée. Le CFD : .+ correspond à n fillières\r\nLe RNCP : .* /,
    description: "La formation que vous souhaitez mettre à jour ne correspond pas à celle qui existe dans Parcoursup.",
    action: `Vous devez vous assurer que la formation prêt pour intégration correspond à une formation existante dans Parcoursup.`,
  },
  {
    regexp:
      /Erreur lors de la creation : Ce type de formation est marqué "Fermé" dans la BCN. Vous ne pouvez donc pas créer une formation de ce type./,
    description:
      "La formation est obsolète au niveau de la BCN. Vérifier que le code MEF utilisé dans le catalogue correspond au code MEF le plus récent pour cette formation.",
    action: `Vous pouvez faire un message dans la rubrique contact parcoursup en indiquant le ou les codes BCN trouvés.`,
  },
  {
    regexp: /Impossible de créer : Établissement inconnu/,
    description: "L'établissement d'accueil n'existe pas encore dans Parcoursup.",
    action: `Vous devez procéder à la création de l'établissement dans Parcoursup avant de demander à nouveau la publication. Revenir sur cette page demander la publication.`,
  },
  {
    regexp: /L'UAI ne correspond pas à un IUT alors que le type de formation correspond à un BUT/,
    description: "Les BUT en apprentissage ne peuvent pas être proposés par un CFA qui n'est pas un IUT.",
    action: `Si cette formation est bien proposée par un IUT, vous devez corriger l'UAI du lieu de formation dans le catalogue puis relancer la publication depuis le catalogue. Si cette formation n'est pas proposée par un IUT, vous devez modifier le statut de la fiche en "non publié" pour que cette formation ne soit plus envoyée à Parcoursup.`,
  },
  {
    regexp:
      /La filière n'a pas pu être retrouvée\. Le MEF : .*correspond à .* fillières\r\nLe CFD : .*correspond à .* fillières\r\nLe RNCP : .*/,
    description: "La spécialité n'existe pas dans la base de donnée Parcoursup.",
    action: `Envoyez un message dans la rubrique contact Parcoursup avec l’URL catalogue de l’offre, afin que la filière puisse être créée.`,
  },
  {
    regexp: /Le code RCO .+ existe dejà sur un autre établissement .+/,
    description: "Cette offre a déjà été envoyée à Parcoursup, mais sur un autre code UAI.",
    action: `Envoyez un message dans la rubrique contact Parcoursup avec l’URL catalogue de l’offre, afin que le précédent rattachement soit annulé et que l’offre puisse être publiée sur le bon UAI.`,
  },

  {
    regexp: /La formation .+ n'est pas accessible depuis parcoursup+/,
    description: "Le code Parcoursup de la formation n'est plus actif sur Parcoursup.",
    action: ``,
  },

  {
    regexp: /Impossible de retrouver un utilisateur valide pour .+/,
    description: "Aucun utilisateur n'a activé son compte sur Parcoursup.",
    action: `Vous devez contacter l'administrateur Parcoursup de cet établissement pour faire le point et relancer la publication une fois qu'au moins 1 utilisateur aura activé son compte sur le site de gestion.`,
  },

  {
    regexp: /Impossible de creer, etablissement gestionnaire non unique pour .+/,
    description: "L'UAI renseigné en tant que lieu de formation est fermé dans la BCE.",
    action: `Vous devez faire le point avec l'établissement, afin de confirmer l'UAI lieu de formation.`,
  },
  {
    regexp: /Mise à jour Impossible : Cette formation n'est plus sur l'UAI .+, mais sur l'UAI .+/,
    description:
      "La mise à jour de la formation est actuellement impossible car cette formation est rattachée dans Parcoursup à un autre UAI.",
    action: `Vous souhaitez déverser une formation dont le code Parcoursup est rattaché à un autre UAI. Nous vous invitons à vérifier que l’UAI que vous avez mentionné est correct et à prendre l’attache de la Moss via la messagerie contacts.`,
  },
  {
    regexp: /Mise à jour impossible : Code Établissement inconnu ou non renseigné./,
    description:
      "L'UAI renseigné en tant que lieu de formation est fermé dans la BCE, ou n'a pas encore crée dans Parcoursup.",
    action: `Vous devez faire le point avec l'établissement, afin de confirmer l'UAI lieu de formation. Si l'établissement n'existe pas encore dans Parcoursup, vous devez procéder à sa création dans Parcoursup.`,
  },
  {
    regexp: /Formation déclarée fermée dans Parcoursup : g_ta_cod = +/,
    description: "Formation déclarée fermée dans Parcoursup",
    action: ``,
  },
  {
    regexp:
      /Erreur lors de la creation : Il n'est pas possible de créer une formation sur un établissement d'inscription qui n'a pas de rôle d'inscription./,
    description: "Le rôle défini dans Parcoursup pour cet établissement ne permet pas une publication de l’offre.",
    action: `Vous devez vérifier voir modifier le rôle de l'établissement dans la partie Données administratives du site de gestion Parcoursup et vous assurer que l'établissement dispose d'un rôle d'établissement d'accueil avant de demander à nouveau la publication.`,
  },
  {
    regexp: /Impossible de créer, établissement gestionnaire non unique ou inexistant pour +/,
    description:
      "Le rôle défini dans Parcoursup pour cet établissement ne permet pas une publication de l'offre vers Parcoursup.",
    action: `Vous devez vérifier voire modifier le rôle de l'établissement (profil établissement d'accueil) dans Parcoursup puis demander à nouveau la publication une fois la modification effectuée.`,
  },
  {
    regexp:
      /Erreur lors de la creation : Il n'est pas possible de créer une formation sur un établissement d'inscription qui n'a pas de rôle d'inscription./,
    description:
      "Il n’est pas possible de créer une formation sur un établissement d’affectation qui n’a pas de rôle d’établissement d’accueil.",
    action: `Veuillez contacter la Moss via la messagerie Parcoursup afin d’attribuer le rôle d’accueil à l’établissement dans lequel se déroulera la formation, puis revenez sur cette fiche pour demander à nouveau la publication Parcoursup.`,
  },
];

module.exports = { parcoursupErrors };
