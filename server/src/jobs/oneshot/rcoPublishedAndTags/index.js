const { ConvertedFormation } = require("../../../common/model/index");
const { runScript } = require("../../scriptWrapper");
const logger = require("../../../common/logger");
const { paginator } = require("../../common/utils/paginator");
const { findRcoFormationFromConvertedId } = require("../../common/utils/rcoUtils");

const run = async () => {
  await paginator(ConvertedFormation, {}, async (formation) => {
    const rcoFormation = await findRcoFormationFromConvertedId(formation.id_rco_formation);
    let published = rcoFormation?.published ?? false; // not found in rco should not be published

    let update_error = null;
    if (formation?.etablissement_reference_published === false) {
      published = false;
      if (rcoFormation?.published) {
        update_error = "Formation not published because of etablissement_reference_published";
      }
    }

    // set tags
    let tags = formation.tags ?? [];
    try {
      const years = ["2020", "2021"];
      const periode = JSON.parse(formation.periode);
      const periodeTags = years.filter((year) => periode?.some((p) => p.includes(year)));

      // remove tags in years and not in yearTags, and add yearTags
      tags = tags.filter((tag) => years.includes(tag) && !periodeTags.includes(tag));
      const tagsToAdd = periodeTags.filter((tag) => !tags.includes(tag));
      tags = [...tags, ...tagsToAdd];
    } catch (e) {
      logger.error("unable to set tags", e);
    }

    formation.published = published;
    formation.tags = tags;
    formation.update_error = update_error ?? formation.update_error;

    await formation.save();
  });
};

runScript(async () => {
  await run();
});
