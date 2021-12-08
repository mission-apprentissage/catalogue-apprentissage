const { storeByChunks } = require("../../common/utils/reportUtils");
const report = require("../../logic/reporter/report");
const config = require("config");

const cfds = ["40033003", "01033001", "50033205", "40033004", "40033006", "40033002", "50033411"];
const allformationsGrandAge = [];

const createReportNewDiplomeGrandAge = async (formationsGrandAge = [], uuidReport = null, noMail = false) => {
  if (!formationsGrandAge.length && !allformationsGrandAge.length) {
    // Nothing to send
    return;
  }

  const f = formationsGrandAge.length ? formationsGrandAge : allformationsGrandAge;

  console.log("Send report Grand Age");
  const summary = {
    count: f.length,
    count40033003: f.filter(({ cfd }) => cfd === "40033003").length,
    count01033001: f.filter(({ cfd }) => cfd === "01033001").length,
    count50033205: f.filter(({ cfd }) => cfd === "50033205").length,
    count40033004: f.filter(({ cfd }) => cfd === "40033004").length,
    count40033006: f.filter(({ cfd }) => cfd === "40033006").length,
    count40033002: f.filter(({ cfd }) => cfd === "40033002").length,
    count50033411: f.filter(({ cfd }) => cfd === "50033411").length,
  };
  // save report in db
  const date = Date.now();
  const type = "grandAge";
  await storeByChunks(type, date, summary, "new", f, uuidReport);

  let link = `${config.publicUrl}/report?type=${type}&date=${date}`;
  if (uuidReport) {
    link = `${config.publicUrl}/report?type=${type}&date=${date}&id=${uuidReport}`;
  }
  console.log(link); // Useful when send in blue is down

  if (!noMail) {
    const data = {
      summary,
      link,
    };
    const title = "Rapport des métiers du grand-âge";
    const to = config.reportMailingList.split(",");
    await report.generate(data, title, to, "grandAgeReport");
  }
};

const detectNewDiplomeGrandAge = (formation, standalone = false) => {
  if (!cfds.includes(formation.cfd)) {
    return null;
  }
  const result = {
    id: formation._id,
    id_rco_formation: formation.id_rco_formation,
    cfd: formation.cfd,
  };
  if (standalone) {
    allformationsGrandAge.push(result);
  }
  return result;
};

module.exports = { detectNewDiplomeGrandAge, createReportNewDiplomeGrandAge };
