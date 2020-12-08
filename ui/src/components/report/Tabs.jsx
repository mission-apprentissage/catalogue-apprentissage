import React, { useState } from "react";
import {
  chakra,
  Tab as Ctab,
  TabList as CtabList,
  TabPanel,
  TabPanels as CtabPanels,
  Tabs as Ctabs,
  useDisclosure,
} from "@chakra-ui/react";
import { Summary } from "./Summary";
import { Table } from "./Table";
import { CodeModal } from "./CodeModal";
import { REPORT_TYPE } from "../../constants/report";

const Tab = chakra(Ctab, {
  baseStyle: {
    fontSize: 20,
    _focus: { boxShadow: "none", outlineWidth: 0 },
    color: "#9C9C9C",
    _selected: { color: "#1E1E1E", borderBottom: "4px solid #2B2B2B" },
  },
});

const TabList = chakra(CtabList, {
  baseStyle: {
    px: 24,
    border: "none",
    bg: "#E5EDEF",
    color: "#2B2B2B",
    pb: "2px",
  },
});

const TabPanels = chakra(CtabPanels, {
  baseStyle: {
    px: 24,
    color: "#F8F8F8",
    h: 1000,
  },
});

const RcoConversionTabs = ({ data, reportType, errors }) => {
  const { summary } = data;
  const showErrors = errors?.length > 0;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedData, setSelectedData] = useState();

  const onRowClick = (index) => {
    setSelectedData(data.converted?.[index]?.updates);
    onOpen();
  };

  return (
    <>
      <Ctabs isLazy>
        <TabList>
          <Tab>Résumé</Tab>
          {summary.convertedCount > 0 && <Tab>{summary.convertedCount} Formation(s) convertie(s)</Tab>}
          {showErrors && <Tab>{summary.invalidCount} Formation(s) en échec de conversion</Tab>}
        </TabList>
        <TabPanels>
          <TabPanel>
            <Summary data={data} reportType={reportType} />
          </TabPanel>
          {data?.converted?.length > 0 && (
            <TabPanel>
              <Table data={data.converted} onRowClick={onRowClick} />
            </TabPanel>
          )}
          {showErrors && (
            <TabPanel>
              <Table data={errors} />
            </TabPanel>
          )}
        </TabPanels>
      </Ctabs>
      <CodeModal isOpen={isOpen} onClose={onClose} title="Updates" code={selectedData} />
    </>
  );
};

const TrainingsUpdateTabs = ({ data, reportType, errors }) => {
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
          {showErrors && <Tab>{summary.invalidCount} Formation(s) en échec de mise à jour</Tab>}
        </TabList>
        <TabPanels>
          <TabPanel>
            <Summary data={data} reportType={reportType} />
          </TabPanel>
          {data.updated?.length > 0 && (
            <TabPanel>
              <Table data={data.updated} onRowClick={onRowClick} />
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
      <CodeModal isOpen={isOpen} onClose={onClose} title="Updates" code={selectedData} />
    </>
  );
};

const RcoDiffTabs = ({ data, reportType, errors }) => {
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
              <Table data={data.added} />
            </TabPanel>
          )}
          {data.updated?.length > 0 && (
            <TabPanel>
              <Table data={data.updated} onRowClick={onRowClick} />
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
      <CodeModal isOpen={isOpen} onClose={onClose} title="Updates" code={selectedData} />
    </>
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
