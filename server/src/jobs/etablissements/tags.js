const { runScript } = require("../scriptWrapper");
const logger = require("../../common/logger");
const { Etablissement, Formation } = require("../../common/model");

const etablissementTags = async () => {
  logger.info("Settings tags on 'etablissements'...");

  const cursor = Etablissement.find({}).cursor();
  let count = 0,
    updated = 0,
    deleted = 0;
  for await (const etablissement of cursor) {
    (count++ + 1) % 100 === 0 && console.log(count);
    try {
      const tags = await Formation.distinct("tags", {
        published: true,
        $or: [
          { etablissement_gestionnaire_id: etablissement._id },
          { etablissement_formateur_id: etablissement._id },
          { etablissement_responsable_id: etablissement._id },
        ],
      }).sort();

      console.log(tags);
      const diff = tags
        .filter((tag) => !etablissement?.tags?.includes(tag))
        .concat(etablissement?.tags?.filter((tag) => !tags.includes(tag)));

      !tags.length &&
        deleted++ &&
        (await Etablissement.findOneAndUpdate({ _id: etablissement._id }, { published: false, tags })) &&
        console.warn(`Unpublishing ${etablissement._id}`);

      tags.length &&
        diff.length &&
        updated++ &&
        (await Etablissement.findOneAndUpdate({ _id: etablissement._id }, { tags })) &&
        console.info(`Updating ${etablissement._id}`);
    } catch (error) {
      logger.error(error);
    }
  }

  logger.info(`Settings tags on 'etablissements' : 🆗 // ${updated} updated // ${deleted} deleted`);
};

module.exports = etablissementTags;

if (process.env.standalone) {
  runScript(async () => {
    await etablissementTags();
  });
}
