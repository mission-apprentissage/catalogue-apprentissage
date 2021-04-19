const { reconciliationAffelnet } = require("../../logic/controller/reconciliation");
const { paginator } = require("../common/utils/paginator");
const { AfFormation, AfReconciliation } = require("../../common/model");
const { runScript } = require("../scriptWrapper");
const logger = require("../../common/logger");

const afReconciliation = async () => {
  try {
    logger.info(`Start affelnet reconciliation`);

    await AfReconciliation.deleteMany({ source: { $in: [null, "AUTOMATIQUE"] } });

    const duplicates = await AfFormation.aggregate([
      { $match: { matching_mna_formation: { $size: 1 } } },
      {
        $unwind: "$matching_mna_formation",
      },
      {
        $group: {
          _id: "$_id",
          mna: {
            $first: "$matching_mna_formation",
          },
        },
      },
      {
        $group: {
          _id: "$mna._id",
          count: { $sum: 1 },
        },
      },
      { $match: { count: { $gte: 2 } } },
      { $sort: { count: -1 } },
    ]);

    console.log(`found ${duplicates.length} duplicates`);
    const excludedIds = duplicates.map(({ _id }) => _id);

    await paginator(
      AfFormation,
      {
        filter: {
          matching_mna_formation: { $size: 1 },
          matching_type: "3",
          "matching_mna_formation._id": { $nin: excludedIds },
        },
        lean: true,
        limit: 200,
      },
      async (formation) => await reconciliationAffelnet(formation, "AUTOMATIQUE")
    );

    logger.info(`End affelnet reconciliation`);
  } catch (error) {
    logger.error(error);
  }
};

module.exports = afReconciliation;

if (process.env.standalone) {
  runScript(async () => {
    await afReconciliation();
  });
}
