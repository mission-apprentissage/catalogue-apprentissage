import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import queryString from "query-string";
import { Box, Text, Heading } from "@chakra-ui/react";
import { Tabs } from "../common/components/report/Tabs";
import { REPORT_TYPE, reportTypes } from "../constants/report";
import { _get } from "../common/httpClient";
import Layout from "./layout/Layout";

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

const getReport = async (reportType, date, page = 1, fullReport = null) => {
  try {
    const response = await _get(`${REPORTS_URL}?type=${reportType}&date=${date}&page=${page}`);
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
      return getReport(reportType, date, page + 1, fullReport);
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
  const [reportErrors, setReportErrors] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      if (!reportTypes.includes(reportType)) {
        setErrorFetchData({ statusCode: 404 });
        return;
      }

      const { report, error } = await getReport(reportType, date);
      const { report: reportErr } = await getReport(`${reportType}.error`, date);

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
  }, [reportType, date]);

  const dateLabel = new Date(Number(date)).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const reportTitle = getReportTitle(reportType);

  return (
    <Layout>
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
            Chargement des données...
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
              <Tabs data={report?.data} reportType={reportType} date={date} errors={reportErrors?.data?.errors} />
            </Box>
          </>
        )}
      </Box>
    </Layout>
  );
};

export default ReportPage;
