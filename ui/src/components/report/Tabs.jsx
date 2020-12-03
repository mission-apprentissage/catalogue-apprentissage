import React from "react";
import { Tabs as Ctabs, Tab, TabList, TabPanel, TabPanels, Box } from "@chakra-ui/react";
import { Summary } from "./Summary";
import { Table } from "./Table";
import { REPORT_TYPE } from "../../constants/report";

const RcoConversionTabs = ({ data, reportType, errors }) => {
  const { summary } = data;
  const showErrors = errors?.length > 0;

  return (
    <Ctabs isLazy>
      <TabList px={24} border="none" bg="#E5EDEF" color="#2B2B2B" pb="2px">
        <Tab fontSize={20}>Résumé</Tab>
        {summary.convertedCount > 0 && <Tab fontSize={20}>{summary.convertedCount} Formation(s) convertie(s)</Tab>}
        {showErrors && <Tab fontSize={20}>{summary.invalidCount} Formation(s) en échec de conversion</Tab>}
      </TabList>
      <TabPanels px={24} color="#F8F8F8" h={1000}>
        <TabPanel>
          <Summary data={data} reportType={reportType} />
        </TabPanel>
        {data?.converted?.length > 0 && (
          <TabPanel>
            <Table data={data.converted} />
          </TabPanel>
        )}
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
      <TabList px={24} border="none" bg="#E5EDEF" color="#2B2B2B" pb="2px">
        <Tab fontSize={20}>Résumé</Tab>
        {summary.updatedCount > 0 && <Tab fontSize={20}>{summary.updatedCount} Formation(s) mise(s) à jour</Tab>}
        {summary.notUpdatedCount > 0 && <Tab fontSize={20}>{summary.notUpdatedCount} Formation(s) déjà à jour</Tab>}
        {showErrors && <Tab fontSize={20}>{summary.invalidCount} Formation(s) en échec de mise à jour</Tab>}
      </TabList>
      <TabPanels px={24} color="#F8F8F8" h={1000}>
        <TabPanel>
          <Summary data={data} reportType={reportType} />
        </TabPanel>
        {data.updated?.length > 0 && (
          <TabPanel>
            <Table data={data.updated} />
          </TabPanel>
        )}
        {data.notUpdated?.length > 0 && (
          <TabPanel>
            <Table data={data.notUpdated} />
          </TabPanel>
        )}
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
      <TabList px={24} border="none" bg="#E5EDEF" color="#2B2B2B" pb="2px">
        <Tab fontSize={20}>Résumé</Tab>
        {summary.matchingCount > 0 && (
          <Tab fontSize={20}>{summary.matchingCount} Formation(s) qui matchent avec la base MNA</Tab>
        )}
        {showErrors && <Tab fontSize={20}>Erreurs</Tab>}
      </TabList>
      <TabPanels px={24} color="#F8F8F8" h={1000}>
        <TabPanel>
          <Summary data={data} reportType={reportType} />
        </TabPanel>
        {data.matchingFormations.length > 0 && (
          <TabPanel>
            <Table data={data.matchingFormations} />
          </TabPanel>
        )}
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
      <TabList px={24} border="none" bg="#E5EDEF" color="#2B2B2B" pb="2px">
        <Tab fontSize={20}>Résumé</Tab>
        {summary.addedCount > 0 && <Tab fontSize={20}>{summary.addedCount} Formation(s) ajoutée(s)</Tab>}
        {summary.updatedCount > 0 && <Tab fontSize={20}>{summary.updatedCount} Formation(s) mise(s) à jour</Tab>}
        {summary.deletedCount > 0 && <Tab fontSize={20}>{summary.deletedCount} Formation(s) supprimée(s)</Tab>}
        {showErrors && <Tab fontSize={20}>Erreurs</Tab>}
      </TabList>
      <TabPanels px={24} color="#F8F8F8" h={1000}>
        <TabPanel>
          <Summary data={data} reportType={reportType} />
        </TabPanel>
        {data.added?.length > 0 && (
          <TabPanel>
            <Table data={data.added} />
          </TabPanel>
        )}
        {data.updated?.length > 0 && (
          <TabPanel>
            <Table data={data.updated} />
          </TabPanel>
        )}
        {data.deleted?.length > 0 && (
          <TabPanel>
            <Table data={data.deleted} />
          </TabPanel>
        )}
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
