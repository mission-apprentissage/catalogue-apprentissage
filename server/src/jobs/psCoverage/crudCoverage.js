const logger = require("../../common/logger");
const path = require("path");

const { getJsonFromXlsxFile } = require("../../common/utils/fileUtils");

module.exports = async (catalogue) => {
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
      const payload = {
        uai: etab.uai_gestionnaire,
        siret: etab.etablissement_siret,
        draft: true,
      };

      const response = await catalogue.postEtablissement(payload);
      await catalogue.updateInformation(response._id);
    })
  );

  Promise.all(
    toDelete.map(async (etab) => {
      const id = etab.etablissement_id;

      await catalogue
        .deleteEtablissement(id)
        .then(() => logger.info(`Etablissement ${id} has been deleted`))
        .catch((error) => logger.error(error));
    })
  );
};
