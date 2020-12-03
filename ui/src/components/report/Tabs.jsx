import React from "react";
import { Tabs as Ctabs, Tab, TabList, TabPanel, TabPanels } from "@chakra-ui/react";
import { Summary } from "./Summary";
import { Table } from "./Table";
import { REPORT_TYPE } from "../../constants/report";

const RcoConversionTabs = ({ data, reportType, errors }) => {
  const { summary } = data;
  const showErrors = errors?.length > 0;

  return (
    <Ctabs isLazy>
      <TabList>
        <Tab>Résumé</Tab>
        <Tab>{summary.convertedCount} Formation(s) convertie(s)</Tab>
        {showErrors && <Tab>{summary.invalidCount} Formation(s) en échec de conversion</Tab>}
      </TabList>
      <TabPanels>
        <TabPanel>
          <Summary data={data} reportType={reportType} />
        </TabPanel>
        <TabPanel>
          <Table data={data.converted} />
        </TabPanel>
        {showErrors && (
          <TabPanel>
            <Table data={errors} />
          </TabPanel>
        )}
      </TabPanels>
    </Ctabs>
  );
};

const TrainingsUpdateTabs = ({ data, reportType, errors }) => {
  const { summary } = data;
  const showErrors = errors?.length > 0;

  return (
    <Ctabs isLazy>
      <TabList>
        <Tab>Résumé</Tab>
        <Tab>{summary.updatedCount} Formation(s) mise(s) à jour</Tab>
        <Tab>{summary.notUpdatedCount} Formation(s) déjà à jour</Tab>
        {showErrors && <Tab>{summary.invalidCount} Formation(s) en échec de mise à jour</Tab>}
      </TabList>
      <TabPanels>
        <TabPanel>
          <Summary data={data} reportType={reportType} />
        </TabPanel>
        <TabPanel>
          <Table data={data.updated} />
        </TabPanel>
        <TabPanel>
          <Table data={data.notUpdated} />
        </TabPanel>
        {showErrors && (
          <TabPanel>
            <Table data={errors} />
          </TabPanel>
        )}
      </TabPanels>
    </Ctabs>
  );
};

const RcoDiffTabs = ({ data, reportType, errors }) => {
  const { summary } = data;
  const showErrors = errors?.length > 0;

  return (
    <Ctabs isLazy>
      <TabList>
        <Tab>Résumé</Tab>
        <Tab>{summary.matchingCount} Formation(s) qui matchent avec la base MNA</Tab>
        {showErrors && <Tab>Erreurs</Tab>}
      </TabList>
      <TabPanels>
        <TabPanel>
          <Summary data={data} reportType={reportType} />
        </TabPanel>
        <TabPanel>
          <Table data={data.matchingFormations} />
        </TabPanel>
        {showErrors && (
          <TabPanel>
            <Table data={errors} />
          </TabPanel>
        )}
      </TabPanels>
    </Ctabs>
  );
};

const RcoImportTabs = ({ data, reportType, errors }) => {
  const { summary } = data;
  const showErrors = errors?.length > 0;

  return (
    <Ctabs isLazy>
      <TabList>
        <Tab>Résumé</Tab>
        <Tab>{summary.addedCount} Formation(s) ajoutée(s)</Tab>
        <Tab>{summary.updatedCount} Formation(s) mise(s) à jour</Tab>
        <Tab>{summary.deletedCount} Formation(s) supprimée(s)</Tab>
        {showErrors && <Tab>Erreurs</Tab>}
      </TabList>
      <TabPanels>
        <TabPanel>
          <Summary data={data} reportType={reportType} />
        </TabPanel>
        <TabPanel>
          <Table data={data.added} />
        </TabPanel>
        <TabPanel>
          <Table data={data.updated} />
        </TabPanel>
        <TabPanel>
          <Table data={data.deleted} />
        </TabPanel>
        {showErrors && (
          <TabPanel>
            <Table data={errors} />
          </TabPanel>
        )}
      </TabPanels>
    </Ctabs>
  );
};

const Tabs = ({ data, reportType, errors }) => {
  switch (reportType) {
    case REPORT_TYPE.RCO_CONVERSION:
      return <RcoConversionTabs data={data} reportType={reportType} errors={errors} />;

    case REPORT_TYPE.TRAININGS_UPDATE:
      return <TrainingsUpdateTabs data={data} reportType={reportType} errors={errors} />;

    case REPORT_TYPE.RCO_DIFF:
      return <RcoDiffTabs data={data} reportType={reportType} errors={errors} />;

    case REPORT_TYPE.RCO_IMPORT:
      return <RcoImportTabs data={data} reportType={reportType} errors={errors} />;

    default:
      console.warn("unexpected report type", reportType);
      return <></>;
  }
};

export { Tabs };
