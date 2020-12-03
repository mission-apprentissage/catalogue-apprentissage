import React from "react";
import { useLocation } from "react-router-dom";
import queryString from "query-string";
import { useFetch } from "../common/hooks/useFetch";
import { Tabs } from "../components/report/Tabs";
import { reportTypes } from "../constants/report";

const REPORT_URL = "/api/entity/report";

// TODO list report types --> columns & data access
// TODO chakra-ui style

const ReportPage = () => {
  const { search } = useLocation();
  const { type: reportType, date } = queryString.parse(search);

  console.log(reportTypes);
  // TODO check reportTypes.includes(type)

  const [responseData, loadingData, errorFetchData] = useFetch(`${REPORT_URL}?type=${reportType}&date=${date}`);
  const [responseErrors] = useFetch(`${REPORT_URL}?type=${reportType}.error&date=${date}`);

  return (
    <div>
      {errorFetchData && "Erreur lors du chargement des données"}
      {!errorFetchData && loadingData && "Chargement des données..."}
      {responseData?.data && (
        <Tabs data={responseData.data} reportType={reportType} errors={responseErrors?.data?.errors} />
      )}
    </div>
  );
};

export default ReportPage;
