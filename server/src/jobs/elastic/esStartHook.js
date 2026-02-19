const { Formation, Etablissement, User } = require("../../common/models/index");

const esStartHook = (index) => {
  switch (index) {
    case "formation":
    case "formations":
      Formation.startMongoosasticHooks();
      break;

    case "etablissement":
    case "etablissements":
      Etablissement.startMongoosasticHooks();
      break;

    case "user":
    case "users":
      User.startMongoosasticHooks();
      break;

    case "all":
      User.startMongoosasticHooks();
      Formation.startMongoosasticHooks();
      Etablissement.startMongoosasticHooks();
      break;

    default:
      throw Error(
        "Il est nécessaire de passer l'index à synchroniser. Si vous souhaitez synchroniser tous les indexes, passez 'all'"
      );
  }
};

module.exports = { esStartHook };
