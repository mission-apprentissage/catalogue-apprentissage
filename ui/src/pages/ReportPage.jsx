import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import queryString from "query-string";
import { Box, Text } from "@chakra-ui/react";
import { useFetch } from "../common/hooks/useFetch";
import { Tabs } from "../components/report/Tabs";
import { REPORT_TYPE, reportTypes } from "../constants/report";
import { _get } from "../common/httpClient";

const REPORT_URL = "/api/entity/report";
const REPORTS_URL = "/api/entity/reports";

const getReportTitle = (reportType) => {
  switch (reportType) {
    case REPORT_TYPE.RCO_CONVERSION:
      return "Rapport de conversion des formations RCO";

    case REPORT_TYPE.TRAININGS_UPDATE:
      return "Rapport de mise à jour des formations du catalogue";

    case REPORT_TYPE.RCO_DIFF:
      return "Rapport de différentiel des formations RCO avec la base MNA";

    case REPORT_TYPE.RCO_IMPORT:
      return "Rapport d'importation catalogue RCO";

    default:
      console.warn("unexpected report type", reportType);
      return reportType;
  }
};

const getConversionReport = async (reportType, date, page = 1, fullReport = null) => {
  try {
    const response = await _get(`${REPORTS_URL}?type=${reportType}&date=${date}&page=${page}`);
    const { report, pagination } = response;

    if (!fullReport) {
      fullReport = report;
    } else {
      fullReport.data.converted = [...fullReport.data.converted, ...report.data.converted];
    }

    if (page < pagination.nombre_de_page) {
      return getConversionReport(reportType, date, page + 1, fullReport);
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
  const { type: reportType, date } = queryString.parse(search);

  const [report, setReport] = useState(null);
  const [errorFetchData, setErrorFetchData] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      let report;
      let error;
      if (reportType === REPORT_TYPE.RCO_CONVERSION) {
        const response = await getConversionReport(reportType, date);
        report = response.report;
        error = response.error;
      } else if (reportTypes.includes(reportType)) {
        try {
          const response = await _get(`${REPORT_URL}?type=${reportType}&date=${date}`);
          report = response;
        } catch (e) {
          error = e;
        }
      }

      if (error) {
        setErrorFetchData(error);
      } else if (report) {
        setReport(report);
      }
    };

    fetchReport();
  }, [reportType, date]);

  const [responseErrors] = useFetch(`${REPORT_URL}?type=${reportType}.error&date=${date}`);

  const dateLabel = new Date(Number(date)).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const reportTitle = getReportTitle(reportType);

  return (
    <Box bg="#2b2b2b">
      {errorFetchData && (
        <Text color="#F8F8F8" px={24} py={3}>
          Erreur lors du chargement des données
        </Text>
      )}
      {!errorFetchData && !report && (
        <Text color="#F8F8F8" px={24} py={3}>
          Chargement des données...
        </Text>
      )}

      {report?.data && (
        <>
          <Box bg="#E5EDEF" w="100%" py={8} px={24} color="#19414C">
            <Text fontSize={36}>{reportTitle}</Text>
            <Text fontSize={28} pt={2}>
              {dateLabel}
            </Text>
          </Box>
          <Box>
            <Tabs data={report.data} reportType={reportType} errors={responseErrors?.data?.errors} />
          </Box>
        </>
      )}
    </Box>
  );
};

export default ReportPage;
