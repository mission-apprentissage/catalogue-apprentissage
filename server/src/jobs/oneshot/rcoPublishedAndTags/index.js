const { RcoFormation, ConvertedFormation } = require("../../../common/model/index");
const { runScript } = require("../../scriptWrapper");
const logger = require("../../../common/logger");

const run = async () => {
  let offset = 0;
  let limit = 100;
  let computed = 0;
  let nbFormations = 10;

  while (computed < nbFormations) {
    let { docs, total } = await ConvertedFormation.paginate({}, { offset, limit });
    nbFormations = total;

    await Promise.all(
      docs.map(async (formation) => {
        computed += 1;

        const [id_formation, id_action, id_certifinfo] = formation.id_rco_formation.split("|");
        const rcoFormation = await RcoFormation.findOne({ id_formation, id_action, id_certifinfo });
        let published = rcoFormation?.published ?? formation.published;

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
      })
    );

    offset += limit;

    logger.info(`progress ${computed}/${total}`);
  }
};

runScript(async () => {
  await run();
});
