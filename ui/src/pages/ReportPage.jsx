import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import queryString from "query-string";
import { useFetch } from "../common/hooks/useFetch";
import { Tabs } from "../components/report/Tabs";
import { REPORT_TYPE, reportTypes } from "../constants/report";
import { _get } from "../common/httpClient";

const REPORT_URL = "/api/entity/report";
const REPORTS_URL = "/api/entity/reports";

// TODO list report types --> columns & data access
// TODO chakra-ui style

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
  }, []);

  const [responseErrors] = useFetch(`${REPORT_URL}?type=${reportType}.error&date=${date}`);

  return (
    <div>
      {errorFetchData && "Erreur lors du chargement des données"}
      {!errorFetchData && !report && "Chargement des données..."}
      {report?.data && <Tabs data={report.data} reportType={reportType} errors={responseErrors?.data?.errors} />}
    </div>
  );
};

export default ReportPage;
