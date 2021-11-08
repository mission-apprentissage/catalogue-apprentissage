const commandLineArgs = require("command-line-args");
const { createParcoursupToken } = require("../../../common/utils/jwtUtils");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");

/**
 * ttl: validity of the token in ms (default 1h)
 */
const optionsList = [{ name: "ttl", alias: "t", type: Number, defaultValue: 3600000 }];

// https://catalogue.apprentissage.beta.gouv.fr/formation/5fc61688712d48a98813379f
const sampleData = {
  // type_de_formation: 0, // not required, will be computed on PS side
  // specialite: 1696, // not required, will be computed on PS side
  rncp: "RNCP1901",
  cfd: "36T3110A",
  mef: "",
  uai: "0541958K", // ne pas envoyer sans UAI !! (car création etab pas possible coté ps)
  rco: "01_LO33327|01_GE519633|98569",
  rome: "N1303", // 2 romes sur cette formation : ["N1303", "N1302"] --> le plus récent ?
};

const run = async () => {
  const options = commandLineArgs(optionsList);
  console.log(options);

  // private key in env var :
  const privateKey = process.env.CATALOGUE_APPRENTISSAGE_PARCOURSUP_PRIVATE_KEY.replace(/\\n/gm, "\n");
  const pwd = process.env.CATALOGUE_APPRENTISSAGE_PARCOURSUP_PRIVATE_KEY_PWD;
  const id = process.env.CATALOGUE_APPRENTISSAGE_PARCOURSUP_CERTIFICATE_ID;

  const data = sampleData;

  const token = createParcoursupToken({ ...options, data, privateKey, pwd, id });

  console.log("Parcoursup token :", `"${token}"`);

  const cert = fs.readFileSync(path.resolve(__dirname, "test-api-catalogue.psup.fr.cert"));
  const decodedToken = jwt.verify(token, cert, {
    algorithms: ["RS512"],
  });

  console.log("decoded", decodedToken);
};

run();
process.exitCode = 0;
