const { runScript } = require("../scriptWrapper");
const logger = require("../../common/logger");
const { Etablissement, Formation } = require("../../common/model");

const etablissementTags = async () => {
  logger.info("Settings tags on 'etablissements'...");
  const filter = {};

  const total = await Etablissement.countDocuments(filter);

  const cursor = Etablissement.find(filter).cursor();
  let count = 0,
    updated = 0,
    republished = 0,
    unpublished = 0;
  for await (const etablissement of cursor) {
    (count++ + 1) % 100 === 0 && console.log(`${count} / ${total}`);
    try {
      const tags = await Formation.distinct("tags", {
        published: true,
        $or: [
          { etablissement_gestionnaire_id: etablissement._id },
          { etablissement_formateur_id: etablissement._id },
          { etablissement_responsable_id: etablissement._id },
        ],
      }).sort();

      const diff = tags
        .filter((tag) => !etablissement?.tags?.includes(tag))
        .concat(etablissement?.tags?.filter((tag) => !tags.includes(tag)));

      const published = !!tags.length;

      if (etablissement.published !== published || diff.length) {
        await Etablissement.findOneAndUpdate({ _id: etablissement._id }, { published, tags });

        if (!published && diff.length) {
          unpublished++;
          console.warn(`Unpublishing ${etablissement._id}`);
        }
        if (published && diff.length) {
          if (etablissement.published) {
            updated++;
            console.info(`Updating ${etablissement._id}`);
          } else {
            republished++;
            console.info(`Republishing ${etablissement._id}`);
          }
        }
      }
    } catch (error) {
      logger.error(error);
      console.error(error);
    }
  }

  logger.info(
    `Settings tags on 'etablissements' : 🆗 // ${updated} updated // ${republished} republished // ${unpublished} unpublished`
  );
};

module.exports = etablissementTags;

if (process.env.standalone) {
  runScript(async () => {
    await etablissementTags();
  });
}
