/* eslint-disable no-unused-vars */
const { runScript } = require("../scriptWrapper");

const report = require("../../logic/reporter/report");
const config = require("config");
const { ParcoursupFormation } = require("../../common/model");
const { storeByChunks } = require("../../common/utils/reportUtils");

const createRejectedReport = async (summary, rejetes) => {
  // save report in db
  const date = Date.now();
  const type = "psReject";

  await storeByChunks(type, date, summary, "rejected", rejetes);
  await storeByChunks(`${type}.error`, date, summary, "errors", []);

  const link = `${config.publicUrl}/report?type=${type}&date=${date}`;
  const data = { summary, link };

  // Send mail
  const title = "[ParcourSup/Carif-Oref] Rapport de rapprochements";
  const to = config.reportMailingList.split(",");
  await report.generate(data, title, to, "rejectedReport");
};

const reportRejected = async () => {
  try {
    console.log(" -- Start of Repports reconciliation rejected -- ");

    const countTotal = await ParcoursupFormation.countDocuments({});
    const countAutomatique = await ParcoursupFormation.countDocuments({ statut_reconciliation: "AUTOMATIQUE" });
    const countAVerifier = await ParcoursupFormation.countDocuments({ statut_reconciliation: "A_VERIFIER" });
    const rejetes = await ParcoursupFormation.find({ statut_reconciliation: "REJETE" }).lean();
    const countInconnu = await ParcoursupFormation.countDocuments({ statut_reconciliation: "INCONNU" });
    const countValide = await ParcoursupFormation.countDocuments({ statut_reconciliation: "VALIDE" });

    const cleannedData = rejetes.map(
      ({
        matching_mna_etablissement,
        matching_mna_parcoursup_statuts,
        etat_reconciliation,
        statut_reconciliation,
        matching_rejete_updated,
        matching_type,
        __v,
        _id,
        ...item
      }) => {
        return {
          ...item,
          matching_mna_formation: item.matching_mna_formation.map(
            ({
              // etablissement_reference,
              // etablissement_gestionnaire_complement_adresse,
              // etablissement_formateur_complement_adresse,
              // nom,
              // num_academie,
              cle_ministere_educatif,
              // ...subitem
            }) => {
              return cle_ministere_educatif; //JSON.stringify(subitem, null, 2);
            }
          ),
        };
      }
    );

    const reportData = cleannedData.map(
      ({ matching_mna_formation, nom_academie, matching_rejete_raison, id_parcoursup }) => {
        return {
          nom_academie,
          id_parcoursup,
          raison: matching_rejete_raison,
          // parcourSup: JSON.stringify(item),
          cle_ministere_educatif1: matching_mna_formation?.[0] || null,
          cle_ministere_educatif2: matching_mna_formation?.[0] || null,
          cle_ministere_educatif3: matching_mna_formation?.[0] || null,
        };
      }
    );
    // console.log(reportData);

    await createRejectedReport(
      {
        countTotal,
        countAutomatique,
        countAVerifier,
        countInconnu,
        countRejete: reportData.length,
        countValide,
      },
      reportData
    );

    console.log(" -- End of Repports reconciliation rejected -- ");
  } catch (err) {
    console.error(err);
  }
};

module.exports = reportRejected;

if (process.env.standalone) {
  runScript(async () => {
    await reportRejected();
  });
}
