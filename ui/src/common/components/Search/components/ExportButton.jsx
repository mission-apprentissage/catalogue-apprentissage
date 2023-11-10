import React, { useEffect, useState } from "react";
import { ReactiveComponent } from "@appbaseio/reactivesearch";
import { Button } from "@chakra-ui/react";
import { DownloadLine } from "../../../../theme/components/icons";
import { _post } from "../../../httpClient";
import { downloadCSV, CSV_SEPARATOR } from "../../../utils/downloadUtils";

const CATALOGUE_API = `${process.env.REACT_APP_BASE_URL}/api`;

const serializeObject = (columns, obj) => {
  const res = [];

  columns.forEach((c) => {
    let value = c.fieldName.split(".").reduce((acc, curr) => acc?.[curr], obj);
    if (typeof c.formatter === "function") {
      value = c.formatter(value, obj);
    } else if (!value) {
      value = "";
    } else if (Array.isArray(value)) {
      if (value.length && typeof value[0] === "object") {
        value = JSON.stringify(value);
      } else {
        value = value.join(",");
      }
    } else if (typeof value === "object") {
      value = JSON.stringify(value);
    } else {
      value = `${value}`.trim().replace(/"/g, "'").replace(/;/g, ",").replace(/\n/g, "").replace(/\r/g, "");
    }
    res.push(value !== "" ? `="${value}"` : "");
  });
  return res.join(CSV_SEPARATOR);
};

const search = (index, query) => {
  return _post(
    `${CATALOGUE_API}/es/search/${index}/_search?scroll=5m`,
    {
      size: 1000,
      query: query.query,
    },
    false
  );
};

const scroll = (index, scrollId) => {
  return _post(
    `${CATALOGUE_API}/es/search/${index}/scroll?scroll=5m&scroll_id=${scrollId}`,
    {
      scroll: true,
      scroll_id: scrollId,
      activeQuery: {
        scroll: "1m",
        scroll_id: scrollId,
      },
    },
    false
  );
};

const getDataAsCSV = async (searchUrl, query, columns, setProgress) => {
  let data = [];
  let pushAll = (hits) => {
    let total = hits.total.value;
    data = [...data, ...hits.hits.map((h) => ({ ...h._source, _id: h._id }))];
    setProgress(Math.round((data.length * 100) / total));
  };

  let { hits, _scroll_id } = await search(searchUrl, query);
  pushAll(hits);

  while (data.length < hits.total.value) {
    let { hits } = await scroll(searchUrl, _scroll_id);
    pushAll(hits);
  }

  let headers = columns.map((c) => c.header).join(CSV_SEPARATOR) + "\n";
  let lines = data.map((obj) => serializeObject(columns, obj)).join("\n");
  setProgress(100);
  return `${headers}${lines}`;
};

const ExportButton = ({ index, filters, columns, context }) => {
  const [requestExport, setRequestExport] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [query, setQuery] = useState({ match_all: {} });

  useEffect(() => {
    async function download() {
      try {
        if (requestExport) {
          let csv = await getDataAsCSV(index, query, columns, setProgress);
          let fileName = `${index}_${new Date().toJSON()}.csv`;
          downloadCSV(fileName, csv);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setExporting(false);
        setProgress(0);
        setRequestExport(false);
      }
    }
    download();
  }, [index, requestExport, columns, query, setProgress, setExporting, setRequestExport]);

  return (
    <ReactiveComponent
      componentId={`${index}-${context}-export`}
      react={{ and: filters }}
      onQueryChange={(_prevQuery, nextQuery) => setQuery(nextQuery)}
      defaultQuery={() => {
        return {
          query: { match_all: {} },
        };
      }}
      render={() => {
        if (exporting) {
          return (
            <Button isLoading size="sm" variant="pill" py={2} loadingText={`${progress}%`}>
              Exporter
            </Button>
          );
        }

        if (!requestExport) {
          return (
            <Button
              variant="pill"
              py={2}
              onClick={() => {
                setExporting(true);
                setRequestExport(true);
              }}
            >
              <DownloadLine mx="0.5rem" w="0.75rem" h="0.75rem" />
              Exporter
            </Button>
          );
        }

        return <div />;
      }}
    />
  );
};

export default ExportButton;
