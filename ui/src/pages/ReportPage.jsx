import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import queryString from "query-string";
import { Box, Container, Heading, Text } from "@chakra-ui/react";
import { Tabs } from "../common/components/report/Tabs";
import { REPORT_TYPE, reportTypes } from "../constants/report";
import { _get } from "../common/httpClient";
import Layout from "./layout/Layout";
import { Breadcrumb } from "../common/components/Breadcrumb";
import { setTitle } from "../common/utils/pageUtils";

const REPORTS_URL = "/api/entity/reports";

const getReportTitle = (reportType) => {
  switch (reportType) {
    case REPORT_TYPE.RCO_IMPORT:
      return "Rapport d'importation catalogue RCO";

    case REPORT_TYPE.RCO_CONVERSION:
      return "Rapport de conversion des formations RCO";

    case REPORT_TYPE.TRAININGS_UPDATE:
      return "Rapport de mise à jour des formations du catalogue";

    case REPORT_TYPE.PS_REJECT:
      return "Rapport de rapprochements Parcoursup / Carif-Oref";

    case REPORT_TYPE.METIER_GRAND_AGE:
      return "Rapport des métiers du grand-âge";

    default:
      console.warn("unexpected report type", reportType);
      return reportType;
  }
};

function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const getReport = async (reportType, date, uuidReport = null, page = 1, fullReport = null, range = false) => {
  try {
    let response = null;

    if (range) {
      const maxDate = new Date(parseInt(date));
      const minDate = new Date(new Date(parseInt(date)).setHours(0, 0, 0, 0));
      response = await _get(
        `${REPORTS_URL}?type=${reportType}&minDate=${minDate.toISOString()}&maxDate=${maxDate.toISOString()}&page=${page}&uuidReport=${uuidReport}`
      );
    } else {
      response = await _get(`${REPORTS_URL}?type=${reportType}&date=${date}&page=${page}&uuidReport=${uuidReport}`);
    }

    const { report, pagination } = response;

    if (!fullReport) {
      fullReport = report;
    } else {
      Object.keys(report.data)
        .filter((key) => key !== "summary")
        .forEach((key) => {
          const prevData = fullReport?.data?.[key] ?? [];
          fullReport.data[key] = [...prevData, ...report.data[key]];
        });
    }

    if (page < pagination.nombre_de_page) {
      await timeout(150);
      return getReport(reportType, date, uuidReport, page + 1, fullReport, range);
    } else {
      return { report: fullReport };
    }
  } catch (error) {
    console.error(error);
    return { error };
  }
};

const ReportPage = () => {
  const { search } = useLocation();
  const { type: reportType, date, id: uuidReport } = queryString.parse(search);

  const [report, setReport] = useState(null);
  const [importReport, setImportReport] = useState(null);
  const [convertReport, setConvertReport] = useState(null);
  const [errorFetchData, setErrorFetchData] = useState(null);
  const [reportErrors, setReportErrors] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      if (!reportTypes.includes(reportType)) {
        setErrorFetchData({ statusCode: 404 });
        return;
      }

      const { report, error } = await getReport(reportType, date, uuidReport);

      if (reportType === REPORT_TYPE.TRAININGS_UPDATE) {
        if (report) {
          // handle no update case
          report.data = report.data ?? {};
          report.data.updated = report.data.updated ?? [];
        }

        const convertReportResp = await getReport(REPORT_TYPE.RCO_CONVERSION, date, uuidReport, 1, null, true);
        if (convertReportResp.report && convertReportResp.report.data) {
          const { converted, summary: convertSummary } = convertReportResp.report?.data;
          setConvertReport({
            convertedIds: converted.map(({ id_rco_formation, cle_ministere_educatif, _id }) => ({
              id_rco_formation,
              cle_ministere_educatif,
              _id,
            })),
            summary: convertSummary,
          });
        }
      }

      if (reportType === REPORT_TYPE.RCO_CONVERSION || reportType === REPORT_TYPE.TRAININGS_UPDATE) {
        const importReportResp = await getReport(REPORT_TYPE.RCO_IMPORT, date, uuidReport, 1, null, true);
        if (importReportResp.report) {
          const { added, updated, deleted, summary } = importReportResp.report?.data;
          setImportReport({
            addedIds: added?.map(({ rcoId }) => rcoId.replaceAll(" ", "|")),
            updatedIds: updated?.map(({ rcoId }) => rcoId.replaceAll(" ", "|")),
            deletedIds: deleted?.map(({ rcoId }) => rcoId.replaceAll(" ", "|")),
            summary,
          });
        }
      }

      const { report: reportErr } = await getReport(`${reportType}.error`, date, uuidReport);

      if (reportErr) {
        setReportErrors(reportErr);
      }
      if (error) {
        setErrorFetchData(error);
      } else if (report) {
        setReport(report);
      }
    };

    fetchReports();
  }, [reportType, date, uuidReport]);

  const dateLabel = new Date(Number(date)).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const reportTitle = getReportTitle(reportType);
  setTitle(reportTitle);

  return (
    <Layout>
      <Box bg="secondaryBackground" w="100%" pt={[4, 8]} px={[1, 24]}>
        <Container maxW="xl">
          <Breadcrumb pages={[{ title: "Accueil", to: "/" }, { title: `${reportTitle}` }]} />
        </Container>
      </Box>
      <Box bg="grey.750">
        {errorFetchData && !reportErrors?.data?.errors && (
          <>
            <Text color="grey.100" px={[8, 24]} py={3}>
              Erreur lors du chargement des données
            </Text>
            {errorFetchData?.statusCode === 404 && (
              <Box bg="white">
                <Text color="grey.750" px={[8, 24]} py={3}>
                  Ce rapport est introuvable
                </Text>
              </Box>
            )}
          </>
        )}
        {!errorFetchData && !report && (
          <Text color="grey.100" px={[8, 24]} py={3}>
            Chargement des données... Cette opération peut prendre jusqu'a 1 minute
          </Text>
        )}

        {(report?.data || reportErrors?.data?.errors) && (
          <>
            <Box bg="secondaryBackground" w="100%" py={[4, 8]} px={[8, 24]}>
              <Heading fontFamily="Marianne" fontWeight="400" fontSize={["beta", "alpha"]} as="h1">
                {reportTitle}
              </Heading>
              <Heading fontFamily="Marianne" fontWeight="400" fontSize={["gamma", "beta"]} pt={2} lineHeight="1.5">
                {dateLabel}
              </Heading>
            </Box>
            <Box>
              <Tabs
                data={report?.data}
                reportType={reportType}
                date={date}
                errors={reportErrors?.data?.errors}
                importReport={importReport}
                convertReport={convertReport}
              />
            </Box>
          </>
        )}
      </Box>
    </Layout>
  );
};

export default ReportPage;
