const { Formation, Etablissement, User } = require("../../common/models/index");

const esPauseHook = (index) => {
  switch (index) {
    case "formation":
    case "formations":
      Formation.pauseMongoosasticHooks();
      break;

    case "etablissement":
    case "etablissements":
      Etablissement.pauseMongoosasticHooks();
      break;

    case "user":
    case "users":
      User.pauseMongoosasticHooks();
      break;

    case "all":
      User.pauseMongoosasticHooks();
      Formation.pauseMongoosasticHooks();
      Etablissement.pauseMongoosasticHooks();
      break;

    default:
      throw Error(
        "Il est nécessaire de passer l'index à désynchroniser. Si vous souhaitez désynchroniser tous les indexes, passez 'all'"
      );
  }
};

module.exports = { esPauseHook };
