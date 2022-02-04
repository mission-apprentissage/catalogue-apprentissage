import React, { useState, useEffect } from "react";
import { Tab, TabList, TabPanel, TabPanels, Tabs as Ctabs, useDisclosure } from "@chakra-ui/react";
import { Summary } from "./Summary";
import { Table } from "./Table";
import { CodeModal } from "./CodeModal";
import { REPORT_TYPE } from "../../../constants/report";

const getConvertedMetricsFromImportReport = (allConverted = [], importReport) => {
  const addedConvertedIds = [];
  const updatedConvertedIds = [];
  const deletedConvertedIds = [];
  for (let index = 0; index < allConverted.length; index++) {
    const { cle_ministere_educatif } = allConverted[index];
    const id = cle_ministere_educatif;
    if (importReport?.addedIds?.includes(id)) {
      addedConvertedIds.push(id);
    } else if (importReport?.deletedIds?.includes(id)) {
      deletedConvertedIds.push(id);
    } else if (importReport?.updatedIds?.includes(id)) {
      updatedConvertedIds.push(id);
    }
  }
  const convertedIds = [...addedConvertedIds, ...updatedConvertedIds, ...deletedConvertedIds];
  return {
    convertedIds, // ConvertedIds from import
    countAddedConverted: addedConvertedIds.length,
    addedConvertedIds,
    countUpdatedConverted: updatedConvertedIds.length,
    updatedConvertedIds,
    countDeletedConverted: deletedConvertedIds.length,
    deletedConvertedIds,
    convertedIdsRest: allConverted.filter(
      ({ cle_ministere_educatif }) => !convertedIds.includes(cle_ministere_educatif)
    ),
  };
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
              <Table data={data.added.map(({ mnaId, ...i }) => ({ ...i }))} filename={`${reportType}_${date}_added`} />
            </TabPanel>
          )}
          {data.updated?.length > 0 && (
            <TabPanel>
              <Table
                data={data.updated.map(({ mnaId, ...i }) => ({ ...i }))}
                onRowClick={onRowClick}
                filename={`${reportType}_${date}_updated`}
              />
            </TabPanel>
          )}
          {data.deleted?.length > 0 && (
            <TabPanel>
              <Table
                data={data.deleted.map(({ mnaId, ...i }) => ({ ...i }))}
                filename={`${reportType}_${date}_deleted`}
              />
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

const RcoConversionTabs = ({ data, reportType, date, errors, importReport }) => {
  const { summary } = data;
  const showErrors = errors?.length > 0;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedData, setSelectedData] = useState();
  const [importReportRelatedData, setImportReportRelatedData] = useState(null);
  const [title, setTitle] = useState();
  const [tabIndex, setTabIndex] = useState(0);
  const [outsideFilter, setOutsideFilter] = useState(null);

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

  const handleTabsChange = (index) => {
    setOutsideFilter(null);
    setTabIndex(index);
  };

  useEffect(() => {
    const lookup = async () => {
      if (data && data.converted && importReport) {
        const metrics = getConvertedMetricsFromImportReport(data.converted, importReport);

        let countAddedErrored = 0;
        let countUpdatedErrored = 0;
        let countDeletedErrored = 0;
        const erroredIds = [];
        for (let index = 0; index < errors?.length; index++) {
          const error = errors[index];
          const id = error.cle_ministere_educatif;
          if (importReport.addedIds?.includes(id)) {
            countAddedErrored++;
            erroredIds.push(id);
          } else if (importReport.deletedIds?.includes(id)) {
            countDeletedErrored++;
            erroredIds.push(id);
          } else if (importReport.updatedIds?.includes(id)) {
            countUpdatedErrored++;
            erroredIds.push(id);
          }
        }
        setImportReportRelatedData({
          ...importReport,
          ...metrics,
          countAddedErrored,
          countDeletedErrored,
          countUpdatedErrored,
          erroredIds,
        });
      }
    };

    lookup();
  }, [importReport, data, errors]);

  return (
    <>
      <Ctabs isLazy index={tabIndex} onChange={handleTabsChange}>
        <TabList>
          <Tab>Résumé</Tab>
          {summary.convertedCount > 0 && <Tab>{summary.convertedCount} Formation(s) convertie(s)</Tab>}
          {showErrors && <Tab>{summary.invalidCount ?? errors?.length} Formation(s) en échec de conversion</Tab>}
        </TabList>
        <TabPanels>
          <TabPanel>
            <Summary
              data={data}
              reportType={reportType}
              errors={errors}
              importReportRelatedData={importReportRelatedData}
              onGoToClicked={(tabId, key, values) => {
                setOutsideFilter({ key, values });
                setTabIndex(tabId);
              }}
            />
          </TabPanel>
          {data?.converted?.length > 0 && (
            <TabPanel>
              <Table
                data={data.converted}
                onRowClick={onRowClick}
                filename={`${reportType}_${date}_converted`}
                outsideFilter={outsideFilter}
              />
            </TabPanel>
          )}
          {showErrors && (
            <TabPanel>
              <Table
                data={errors}
                onRowClick={onErrorClick}
                filename={`${reportType}_${date}_errors`}
                outsideFilter={outsideFilter}
              />
            </TabPanel>
          )}
        </TabPanels>
      </Ctabs>
      <CodeModal isOpen={isOpen} onClose={onClose} title={title} code={selectedData} />
    </>
  );
};

const TrainingsUpdateTabs = ({ data, reportType, date, errors, importReport, convertReport }) => {
  const { summary } = data;
  const showErrors = errors?.length > 0;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedData, setSelectedData] = useState();
  const [reportRelatedData, setReportRelatedData] = useState(null);
  const [title, setTitle] = useState();

  const onRowClick = (index) => {
    setTitle("Updates");
    setSelectedData(data.updated?.[index]?.updates);
    onOpen();
  };

  const onErrorClick = (index) => {
    setTitle("Détail de l'erreur");
    const error = { ...errors?.[index] } ?? {};
    setSelectedData(JSON.stringify(error));
    onOpen();
  };

  useEffect(() => {
    const lookup = async () => {
      if (data && data.updated) {
        const metricsImportedConverted = getConvertedMetricsFromImportReport(convertReport?.convertedIds, importReport);

        // "Dummy check"
        const unpublishedToday = [];
        for (let k = 0; k < metricsImportedConverted.deletedConvertedIds.length; k++) {
          const id = metricsImportedConverted.deletedConvertedIds[k];
          if (data.unpublished.includes(id)) {
            unpublishedToday.push(id);
          }
        }
        // console.log("unpublishedToday", unpublishedToday.length); // unpublishedToday

        const addedConvertedUpdatedIds = [];
        const updatedIds = data.updated.map(({ cle_ministere_educatif }) => cle_ministere_educatif);
        for (let k = 0; k < metricsImportedConverted.addedConvertedIds.length; k++) {
          const id = metricsImportedConverted.addedConvertedIds[k];
          if (updatedIds.includes(id)) {
            addedConvertedUpdatedIds.push(id);
          }
        }
        // console.log("nb add-> converted-> updated", addedConvertedUpdatedIds.length); // nb add-> converted-> updated

        const addedConvertedErroredIds = [];
        const errorIds = errors?.map(({ cle_ministere_educatif }) => cle_ministere_educatif);
        for (let k = 0; k < metricsImportedConverted.addedConvertedIds.length; k++) {
          const id = metricsImportedConverted.addedConvertedIds[k];
          if (errorIds.includes(id)) {
            addedConvertedErroredIds.push(id);
          }
        }
        // console.log("nb add-> converted-> error", addedConvertedErroredIds.length); // nb add-> converted-> error

        const updatedConvertedUpdatedIds = [];
        for (let k = 0; k < metricsImportedConverted.updatedConvertedIds.length; k++) {
          const id = metricsImportedConverted.updatedConvertedIds[k];
          if (updatedIds.includes(id)) {
            updatedConvertedUpdatedIds.push(id);
          }
        }
        // console.log("nb up-> converted-> updated", updatedConvertedUpdatedIds.length); // nb up-> converted-> updated

        const updatedConvertedErroredIds = [];
        for (let k = 0; k < metricsImportedConverted.updatedConvertedIds.length; k++) {
          const id = metricsImportedConverted.updatedConvertedIds[k];
          if (errorIds.includes(id)) {
            updatedConvertedErroredIds.push(id);
          }
        }
        // console.log("nb up-> converted-> error", updatedConvertedErroredIds.length); // nb up-> converted-> error

        const restConvertedUpdatedIds = [];
        const restIds = metricsImportedConverted.convertedIdsRest.map(
          ({ cle_ministere_educatif }) => cle_ministere_educatif
        );
        for (let k = 0; k < restIds.length; k++) {
          const id = restIds[k];
          if (updatedIds.includes(id)) {
            restConvertedUpdatedIds.push(id);
          }
        }
        // console.log("nb rest converted-> updated", restConvertedUpdatedIds.length); // nb rest converted-> updated

        const restConvertedErroredIds = [];
        for (let k = 0; k < restIds.length; k++) {
          const id = restIds[k];
          if (errorIds.includes(id)) {
            restConvertedErroredIds.push(id);
          }
        }
        // console.log("nb rest converted-> error", restConvertedErroredIds.length); // nb rest converted-> error

        setReportRelatedData({
          updaterReport: {
            ...data,
            summary: {
              ...data.summary,
              unpublishedCount: unpublishedToday.length,
            },
            unpublished: unpublishedToday,
          },
          addedConvertedUpdatedIds,
          addedConvertedErroredIds,
          updatedConvertedUpdatedIds,
          updatedConvertedErroredIds,
          restConvertedUpdatedIds,
          restConvertedErroredIds,
        });
      }
    };

    lookup();
  }, [importReport, convertReport, data, errors]);

  if (!reportRelatedData) {
    return <></>;
  }

  return (
    <>
      <Ctabs isLazy>
        <TabList>
          <Tab>Résumé</Tab>
          {summary.updatedCount > 0 && <Tab>{summary.updatedCount} Formation(s) mise(s) à jour</Tab>}
          {showErrors && <Tab>{summary.invalidCount ?? errors?.length} Formation(s) en échec de mise à jour</Tab>}
        </TabList>
        <TabPanels>
          <TabPanel>
            <Summary data={reportRelatedData} reportType={reportType} />
          </TabPanel>
          {data.updated?.length > 0 && (
            <TabPanel>
              <Table data={data.updated} onRowClick={onRowClick} filename={`${reportType}_${date}_updated`} />
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

const PsRejectTabs = ({ data, reportType, date, errors }) => {
  const { summary } = data;
  const showErrors = errors?.length > 0;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedData, setSelectedData] = useState();

  const onRowClick = (index) => {
    setSelectedData(JSON.stringify(data.rejected?.[index]));
    onOpen();
  };

  return (
    <>
      <Ctabs isLazy>
        <TabList>
          <Tab>Résumé</Tab>
          {summary.countRejete > 0 && <Tab>{summary.countRejete} Rapprochement(s) rejeté(s)</Tab>}
          {showErrors && <Tab>Erreurs</Tab>}
        </TabList>
        <TabPanels>
          <TabPanel>
            <Summary data={data} reportType={reportType} />
          </TabPanel>
          {data?.rejected?.length > 0 && (
            <TabPanel>
              <Table data={data.rejected} onRowClick={onRowClick} filename={`${reportType}_${date}_rejected`} />
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

const MetiersGrandAgeTabs = ({ data, reportType, date, errors }) => {
  const { summary } = data;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedData, setSelectedData] = useState();

  const onRowClick = (index) => {
    setSelectedData(JSON.stringify(data.rejected?.[index]));
    onOpen();
  };

  return (
    <>
      <Ctabs isLazy>
        <TabList>
          <Tab>Résumé</Tab>
          {summary.count > 0 && <Tab>{summary.count} ajoutée(s)</Tab>}
        </TabList>
        <TabPanels>
          <TabPanel>
            <Summary data={data} reportType={reportType} />
          </TabPanel>
          {data?.new?.length > 0 && (
            <TabPanel>
              <Table data={data.new} onRowClick={onRowClick} filename={`${reportType}_${date}_new`} />
            </TabPanel>
          )}
        </TabPanels>
      </Ctabs>
      <CodeModal isOpen={isOpen} onClose={onClose} title="Updates" code={selectedData} />
    </>
  );
};

const Tabs = ({ data = { summary: {} }, reportType, date, errors, importReport, convertReport }) => {
  switch (reportType) {
    case REPORT_TYPE.RCO_IMPORT:
      return <RcoImportTabs data={data} reportType={reportType} date={date} errors={errors} />;

    case REPORT_TYPE.RCO_CONVERSION:
      return (
        <RcoConversionTabs
          data={data}
          reportType={reportType}
          date={date}
          errors={errors}
          importReport={importReport}
        />
      );

    case REPORT_TYPE.TRAININGS_UPDATE:
      return (
        <TrainingsUpdateTabs
          data={data}
          reportType={reportType}
          date={date}
          errors={errors}
          importReport={importReport}
          convertReport={convertReport}
        />
      );

    case REPORT_TYPE.PS_REJECT:
      return <PsRejectTabs data={data} reportType={reportType} date={date} errors={errors} />;

    case REPORT_TYPE.METIER_GRAND_AGE:
      return <MetiersGrandAgeTabs data={data} reportType={reportType} date={date} errors={errors} />;

    default:
      console.warn("unexpected report type", reportType);
      return <></>;
  }
};

export { Tabs };
