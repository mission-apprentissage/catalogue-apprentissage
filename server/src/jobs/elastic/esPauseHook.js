const { Formation, Etablissement, User } = require("../../common/models/index");

const esPauseHook = (index) => {
  switch (index) {
    case "formation":
    case "formations":
      Formation.pauseAllMongoosaticHooks();
      break;

    case "etablissement":
    case "etablissements":
      Etablissement.pauseAllMongoosaticHooks();
      break;

    case "user":
    case "users":
      User.pauseAllMongoosaticHooks();
      break;

    case "all":
      User.pauseAllMongoosaticHooks();
      Formation.pauseAllMongoosaticHooks();
      Etablissement.pauseAllMongoosaticHooks();
      break;

    default:
      throw Error(
        "Il est nécessaire de passer l'index à désynchroniser. Si vous souhaitez désynchroniser tous les indexes, passez 'all'"
      );
  }
};

module.exports = { esPauseHook };
