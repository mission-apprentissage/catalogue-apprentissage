import React from "react";
import { useLocation } from "react-router-dom";
import queryString from "query-string";
import { useFetch } from "../common/hooks/useFetch";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import { Table } from "../components/report/Table";
import { Summary } from "../components/report/Summary";
import { REPORT_TYPE, reportTypes } from "../constants/report";

const REPORT_URL = "/api/entity/report";

// TODO list report types --> columns & data access
// TODO chakra-ui style

const getReportData = (data, reportType) => {
  switch (reportType) {
    case REPORT_TYPE.RCO_CONVERSION:
      return data.converted;

    case REPORT_TYPE.TRAININGS_UPDATE:
      return [...data.updated, ...data.notUpdated];

    case REPORT_TYPE.RCO_DIFF:
      return data.matchingFormations;

    case REPORT_TYPE.RCO_IMPORT:
      return [...data.added, ...data.updated];

    default:
      console.warn("unexpected report type", reportType);
      return [];
  }
};

const ReportPage = () => {
  const { search } = useLocation();
  const { type: reportType, date } = queryString.parse(search);

  console.log(reportTypes);
  // TODO check reportTypes.includes(type)

  const [responseData, loadingData, errorFetchData] = useFetch(`${REPORT_URL}?type=${reportType}&date=${date}`);
  console.log(reportType, date, responseData);

  const [responseErrors, loadingErrors, errorFetchErrors] = useFetch(
    `${REPORT_URL}?type=${reportType}.error&date=${date}`
  );
  const showErrors = responseErrors?.data?.errors?.length > 0;
  console.log(responseErrors);

  return (
    <div>
      {loadingData && "Chargement des données..."}
      {responseData?.data && (
        <Tabs isLazy>
          <TabList>
            <Tab>Résumé</Tab>
            <Tab>Data</Tab>
            {showErrors && <Tab>Errors</Tab>}
          </TabList>
          <TabPanels>
            {/* initially mounted */}
            <TabPanel>
              <Summary data={responseData.data} reportType={reportType} />
            </TabPanel>
            {/* initially not mounted */}
            <TabPanel>
              <Table data={getReportData(responseData.data, reportType)} />
            </TabPanel>
            {/* initially not mounted */}
            {showErrors && (
              <TabPanel>
                <Table data={responseErrors.data?.errors} />
              </TabPanel>
            )}
          </TabPanels>
        </Tabs>
      )}
    </div>
  );
};

export default ReportPage;
