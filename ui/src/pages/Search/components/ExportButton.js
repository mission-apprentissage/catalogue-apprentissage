import React, { useState } from "react";
import { ReactiveComponent } from "@appbaseio/reactivesearch";
import { Button } from "@chakra-ui/react";

import { _post } from "../../../common/httpClient";
import { downloadCSV, CSV_SEPARATOR } from "../../../common/utils/downloadUtils";

const endpointNewFront = process.env.REACT_APP_ENDPOINT_NEW_FRONT || "https://catalogue.apprentissage.beta.gouv.fr/api";
const endpointTCO =
  process.env.REACT_APP_ENDPOINT_TCO || "https://tables-correspondances.apprentissage.beta.gouv.fr/api";

const serializeObject = (columns, obj) => {
  const fieldNames = columns.map((c) => c.fieldName);
  const res = [];
  for (let i = 0; i < fieldNames.length; i++) {
    let value = obj[fieldNames[i]];
    if (!value) {
      value = "";
    } else if (Array.isArray(value)) {
      if (value.length && typeof value[0] === "object") {
        if (fieldNames[i] === "mefs_10") {
          value = value.map((x) => x.mef10).join(",");
        } else {
          value = JSON.stringify(value);
        }
      } else {
        value = value.join(",");
      }
    } else if (typeof value === "object") {
      value = JSON.stringify(value);
    } else {
      value = `${value}`.trim().replace(/"/g, "'").replace(/;/g, ",").replace(/\n/g, "").replace(/\r/g, "");
    }
    res.push(value !== "" ? `="${value}"` : "");
  }
  return res.join(CSV_SEPARATOR);
};

let search = (index, query) => {
  if (index === "etablissements") {
    return _post(
      `${endpointTCO}/es/search/${index}/_search?scroll=5m`,
      {
        size: 1000,
        query: query.query,
      },
      false
    );
  }

  return _post(
    `${endpointNewFront}/es/search/${index}/_search?scroll=5m`,
    {
      size: 1000,
      query: query.query,
    },
    false
  );
};

let scroll = (index, scrollId) => {
  if (index === "etablissements") {
    return _post(
      `${endpointTCO}/es/search/${index}/scroll?scroll=5m&scroll_id=${scrollId}`,
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
  }

  return _post(
    `${endpointNewFront}/es/search/${index}/scroll?scroll=5m&scroll_id=${scrollId}`,
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

let getDataAsCSV = async (searchUrl, query, columns, setProgress) => {
  let data = [];
  let pushAll = (hits) => {
    let total = hits.total.value;
    data = [...data, ...hits.hits.map((h) => h._source)];
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

//let countMount = 0;

const ExportButton = ({ index, filters, columns, defaultQuery = { match_all: {} } }) => {
  const [requestExport, setRequestExport] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  if (!requestExport) {
    return (
      <Button
        size="sm"
        colorScheme="blue"
        onClick={async () => {
          setRequestExport(true);
          setExporting(true);
        }}
      >
        Exporter
      </Button>
    );
  }

  const onQueryChange = async (prevQuery, nextQuery) => {
    // console.log("here");
    // if (countMount === 1) {
    console.log(nextQuery);
    let csv = await getDataAsCSV(index, nextQuery, columns, setProgress);
    let fileName = `${index}_${new Date().toJSON()}.csv`;
    downloadCSV(fileName, csv);
    setExporting(false);
    setRequestExport(false);
    setProgress(0);
    //   countMount = 0;
    // } else if (countMount === 0) {
    //   countMount++;
    // }
  };

  return (
    <ReactiveComponent
      componentId={`${index}-export`}
      react={{ and: filters }}
      onQueryChange={onQueryChange}
      defaultQuery={() => {
        return {
          query: defaultQuery,
        };
      }}
      render={() => {
        if (exporting) {
          return (
            <Button isLoading size="sm" colorScheme="blue" loadingText={`${progress}%`}>
              Exporter
            </Button>
          );
        }
        return <div />;
      }}
    />
  );
};

export default React.memo(ExportButton);
