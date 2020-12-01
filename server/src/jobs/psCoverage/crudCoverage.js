const logger = require("../../common/logger");
const path = require("path");
const diff = require("deep-object-diff").diff;

const { PsFormation } = require("../../common/model/index");
const { asyncForEach } = require("../../common/utils/asyncUtils");
const { getJsonFromXlsxFile } = require("../../common/utils/fileUtils");

module.exports = async () => {
  const filePath = path.resolve(__dirname, "./assets/Etablissements_6_20201130.xlsx");
  let rawFormations = getJsonFromXlsxFile(filePath);

  const toCreate = rawFormations.filter((x) => x.Analyse === "CREATE");
  const toDelete = rawFormations.filter((x) => x.Analyse === "DELETE");
  const ok = rawFormations.filter((x) => x.Analyse === "TRUE");
  const standby = rawFormations.filter((x) => x.Analyse === "STANDBY");

  console.log({
    base: rawFormations.length,
    create: toCreate.length,
    delete: toDelete.length,
    standby: standby.length,
    ok: ok.length,
  });

  Promise.all(
    toCreate.map(async (etab) => {
      return;
      const payload = {
        uai: etab.uai_gestionnaire,
        siret: etab.etablissement_siret,
        draft: true,
      };

      const response = await postEtablissement(payload);
      await updateInformation(response._id);
    })
  );

  Promise.all(
    toDelete.map(async (etab) => {
      return;
      const id = etab.etablissement_id;

      await deleteEtablissement(id)
        .then(() => logger.info(`Etablissement ${id} has been deleted`))
        .catch((error) => logger.error(error));
    })
  );

  return;
};
