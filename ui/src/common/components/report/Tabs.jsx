import React, { useState } from "react";
import { Tab, TabList, TabPanel, TabPanels, Tabs as Ctabs, useDisclosure } from "@chakra-ui/react";
import { Summary } from "./Summary";
import { Table } from "./Table";
import { CodeModal } from "./CodeModal";
import { REPORT_TYPE } from "../../../constants/report";

const RcoConversionTabs = ({ data, reportType, date, errors }) => {
  const { summary } = data;
  const showErrors = errors?.length > 0;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedData, setSelectedData] = useState();
  const [title, setTitle] = useState();

  const onRowClick = (index) => {
    setTitle("Updates");
    setSelectedData(data.converted?.[index]?.updates);
    onOpen();
  };

  const onErrorClick = (index) => {
    setTitle("Détail de l'erreur");
    const error = { ...errors?.[index] } ?? {};
    error.sirets = error.sirets && JSON.parse(error.sirets);
    setSelectedData(JSON.stringify(error));
    onOpen();
  };

  return (
    <>
      <Ctabs isLazy>
        <TabList>
          <Tab>Résumé</Tab>
          {summary.convertedCount > 0 && <Tab>{summary.convertedCount} Formation(s) convertie(s)</Tab>}
          {showErrors && <Tab>{summary.invalidCount ?? errors?.length} Formation(s) en échec de conversion</Tab>}
        </TabList>
        <TabPanels>
          <TabPanel>
            <Summary data={data} reportType={reportType} errors={errors} />
          </TabPanel>
          {data?.converted?.length > 0 && (
            <TabPanel>
              <Table data={data.converted} onRowClick={onRowClick} filename={`${reportType}_${date}_converted`} />
            </TabPanel>
          )}
          {showErrors && (
            <TabPanel>
              <Table data={errors} onRowClick={onErrorClick} filename={`${reportType}_${date}_errors`} />
            </TabPanel>
          )}
        </TabPanels>
      </Ctabs>
      <CodeModal isOpen={isOpen} onClose={onClose} title={title} code={selectedData} />
    </>
  );
};

const TrainingsUpdateTabs = ({ data, reportType, date, errors }) => {
  const { summary } = data;
  const showErrors = errors?.length > 0;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedData, setSelectedData] = useState();

  const onRowClick = (index) => {
    setSelectedData(data.updated?.[index]?.updates);
    onOpen();
  };

  return (
    <>
      <Ctabs isLazy>
        <TabList>
          <Tab>Résumé</Tab>
          {summary.updatedCount > 0 && <Tab>{summary.updatedCount} Formation(s) mise(s) à jour</Tab>}
          {summary.notUpdatedCount > 0 && <Tab>{summary.notUpdatedCount} Formation(s) déjà à jour</Tab>}
          {showErrors && <Tab>{summary.invalidCount ?? errors?.length} Formation(s) en échec de mise à jour</Tab>}
        </TabList>
        <TabPanels>
          <TabPanel>
            <Summary data={data} reportType={reportType} errors={errors} />
          </TabPanel>
          {data.updated?.length > 0 && (
            <TabPanel>
              <Table data={data.updated} onRowClick={onRowClick} filename={`${reportType}_${date}_updated`} />
            </TabPanel>
          )}
          {data.notUpdated?.length > 0 && (
            <TabPanel>
              <Table data={data.notUpdated} filename={`${reportType}_${date}_notUpdated`} />
            </TabPanel>
          )}
          {showErrors && (
            <TabPanel>
              <Table data={errors} filename={`${reportType}_${date}_errors`} />
            </TabPanel>
          )}
        </TabPanels>
      </Ctabs>
      <CodeModal isOpen={isOpen} onClose={onClose} title="Updates" code={selectedData} />
    </>
  );
};

const RcoDiffTabs = ({ data, reportType, date, errors }) => {
  const { summary } = data;
  const showErrors = errors?.length > 0;

  return (
    <Ctabs isLazy>
      <TabList>
        <Tab>Résumé</Tab>
        {summary.matchingCount > 0 && <Tab>{summary.matchingCount} Formation(s) qui matchent avec la base MNA</Tab>}
        {showErrors && <Tab>Erreurs</Tab>}
      </TabList>
      <TabPanels>
        <TabPanel>
          <Summary data={data} reportType={reportType} />
        </TabPanel>
        {data.matchingFormations.length > 0 && (
          <TabPanel>
            <Table data={data.matchingFormations} filename={`${reportType}_${date}_matching`} />
          </TabPanel>
        )}
        {showErrors && (
          <TabPanel>
            <Table data={errors} filename={`${reportType}_${date}_errors`} />
          </TabPanel>
        )}
      </TabPanels>
    </Ctabs>
  );
};

const RcoImportTabs = ({ data, reportType, date, errors }) => {
  const { summary } = data;
  const showErrors = errors?.length > 0;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedData, setSelectedData] = useState();

  const onRowClick = (index) => {
    setSelectedData(data.updated?.[index]?.updates);
    onOpen();
  };

  return (
    <>
      <Ctabs isLazy>
        <TabList>
          <Tab>Résumé</Tab>
          {summary.addedCount > 0 && <Tab>{summary.addedCount} Formation(s) ajoutée(s)</Tab>}
          {summary.updatedCount > 0 && <Tab>{summary.updatedCount} Formation(s) mise(s) à jour</Tab>}
          {summary.deletedCount > 0 && <Tab>{summary.deletedCount} Formation(s) supprimée(s)</Tab>}
          {showErrors && <Tab>Erreurs</Tab>}
        </TabList>
        <TabPanels>
          <TabPanel>
            <Summary data={data} reportType={reportType} />
          </TabPanel>
          {data.added?.length > 0 && (
            <TabPanel>
              <Table data={data.added} filename={`${reportType}_${date}_added`} />
            </TabPanel>
          )}
          {data.updated?.length > 0 && (
            <TabPanel>
              <Table data={data.updated} onRowClick={onRowClick} filename={`${reportType}_${date}_updated`} />
            </TabPanel>
          )}
          {data.deleted?.length > 0 && (
            <TabPanel>
              <Table data={data.deleted} filename={`${reportType}_${date}_deleted`} />
            </TabPanel>
          )}
          {showErrors && (
            <TabPanel>
              <Table data={errors} filename={`${reportType}_${date}_errors`} />
            </TabPanel>
          )}
        </TabPanels>
      </Ctabs>
      <CodeModal isOpen={isOpen} onClose={onClose} title="Updates" code={selectedData} />
    </>
  );
};

const Tabs = ({ data = { summary: {} }, reportType, date, errors }) => {
  switch (reportType) {
    case REPORT_TYPE.RCO_CONVERSION:
      return <RcoConversionTabs data={data} reportType={reportType} date={date} errors={errors} />;

    case REPORT_TYPE.TRAININGS_UPDATE:
      return <TrainingsUpdateTabs data={data} reportType={reportType} date={date} errors={errors} />;

    case REPORT_TYPE.RCO_DIFF:
      return <RcoDiffTabs data={data} reportType={reportType} date={date} errors={errors} />;

    case REPORT_TYPE.RCO_IMPORT:
      return <RcoImportTabs data={data} reportType={reportType} date={date} errors={errors} />;

    default:
      console.warn("unexpected report type", reportType);
      return <></>;
  }
};

export { Tabs };
