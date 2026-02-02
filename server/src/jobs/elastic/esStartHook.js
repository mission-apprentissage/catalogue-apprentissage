const { Formation, Etablissement, User } = require("../../common/models/index");

const esStartHook = (index) => {
  switch (index) {
    case "formation":
    case "formations":
      Formation.startAllMongoosaticHooks();
      break;

    case "etablissement":
    case "etablissements":
      Etablissement.startAllMongoosaticHooks();
      break;

    case "user":
    case "users":
      User.startAllMongoosaticHooks();
      break;

    case "all":
      User.startAllMongoosaticHooks();
      Formation.startAllMongoosaticHooks();
      Etablissement.startAllMongoosaticHooks();
      break;

    default:
      throw Error(
        "Il est nécessaire de passer l'index à synchroniser. Si vous souhaitez synchroniser tous les indexes, passez 'all'"
      );
  }
};

module.exports = { esStartHook };
