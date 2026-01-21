const logger = require("../../../common/logger");
const { runScript } = require("../../scriptWrapper");
const { downloader } = require("./downloader");
const { converter } = require("./converter");
const { DualControlFormation } = require("../../../common/models/index");

const importer = async (
  { noDownload = false, useExistingArchive = false, forceRecompute = false, skip = 0, filter = {} } = {
    noDownload: false,
    useExistingArchive: false,
    forceRecompute: false,
    skip: 0,
    filter: {},
  }
) => {
  try {
    logger.info({ type: "job" }, " -- FORMATIONS IMPORTER : ⏳ -- ");

    // STEP 1 : Download formations from RCO
    let downloadError;

    if (!noDownload) {
      logger.info({ type: "job" }, " -- Downloading formations -- ");
      downloadError = await downloader({ useExistingArchive });

      if (downloadError) {
        throw new Error(downloadError);
      }
    }

    if (
      !(await DualControlFormation.countDocuments()) ||
      !(await DualControlFormation.countDocuments({ published: true, catalogue_published: true }))
    ) {
      throw new Error("Aucune formation à convertir.");
    }

    // STEP 2 : Convert formations
    logger.info({ type: "job" }, " -- Converting formations -- ");
    await converter({ forceRecompute, skip, filter });

    logger.info({ type: "job" }, " -- FORMATIONS IMPORTER : ✅ -- ");
  } catch (error) {
    logger.error({ type: "job" }, error);
    logger.error({ type: "job" }, " -- FORMATIONS IMPORTER : ❌ -- ");
  }
};

module.exports = { importer };

if (process.env.standalone) {
  runScript(async () => {
    const args = process.argv.slice(2);
    const noDownload = args.includes("--noDownload");
    const useExistingArchive = args.includes("--useExistingArchive");
    const forceRecompute = args.includes("--forceRecompute");

    const skip = +(args.find((arg) => arg.startsWith("--skip"))?.split("=")?.[1] ?? 0);
    const filter = JSON.parse(args.find((arg) => arg.startsWith("--filter"))?.split("=")?.[1] ?? "{}");

    await importer({
      noDownload,
      useExistingArchive,
      forceRecompute,
      skip,
      filter,
      // filter: {
      //   published: true,
      //   // affelnet_statut: { $ne: "non publiable en l'état" },
      //   // affelnet_mefs_10: { $in: [null, []] },
      //   // bcn_mefs_10: { $ne: [] },
      // },
    });
  });
}
