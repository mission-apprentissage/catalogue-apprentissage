import React, { useState } from "react";
// import { API } from "aws-amplify";
import { ReactiveComponent } from "@appbaseio/reactivesearch";
import { Button, Progress } from "reactstrap";

import { _post } from "../../../common/httpClient";

// import { getEnvName } from "../../../config";
const ENV_NAME = "dev"; // getEnvName();

const endpointNewFront =
  ENV_NAME === "local" || ENV_NAME === "dev"
    ? "https://catalogue-recette.apprentissage.beta.gouv.fr/api"
    : "https://catalogue.apprentissage.beta.gouv.fr/api";

const CSV_SEPARATOR = ";";

const serializeObject = (columns, obj) => {
  const fieldNames = columns.map((c) => c.fieldName);
  const res = [];
  for (let i = 0; i < fieldNames.length; i++) {
    let value = obj[fieldNames[i]];
    if (!value) {
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
  }
  return res.join(CSV_SEPARATOR);
};

const downloadCSV = (fileName, csv) => {
  let blob = new Blob([csv]);

  if (window.navigator.msSaveOrOpenBlob) {
    // IE hack; see http://msdn.microsoft.com/en-us/library/ie/hh779016.aspx
    window.navigator.msSaveBlob(blob, fileName);
  } else {
    let a = window.document.createElement("a");
    a.href = window.URL.createObjectURL(blob, {
      type: "text/plain;charset=UTF-8",
    });
    a.download = fileName;
    document.body.appendChild(a);
    a.click(); // IE: "Access is denied"; see: https://connect.microsoft.com/IE/feedback/details/797361/ie-10-treats-blob-url-as-cross-origin-and-denies-access
    document.body.removeChild(a);
  }
};

let search = (index, query) => {
  if (index === "convertedformation") {
    return _post(`${endpointNewFront}/es/search/${index}/_search?scroll=5m`, {
      size: 1000,
      query: query.query,
    });
  }

  // return API.post("api", `/es/search/${index}/_search?scroll=5m`, {
  //   body: {
  //     size: 1000,
  //     query: query.query,
  //   },
  // });
};

let scroll = (index, scrollId) => {
  if (index === "convertedformation") {
    return _post(`${endpointNewFront}/es/search/${index}/scroll?scroll=5m&scroll_id=${scrollId}`, {
      scroll: true,
      scroll_id: scrollId,
      activeQuery: {
        scroll: "1m",
        scroll_id: scrollId,
      },
    });
  }

  // return API.post("api", `/es/search/${index}/scroll?scroll=5m&scroll_id=${scrollId}`, {
  //   body: {
  //     scroll: true,
  //     scroll_id: scrollId,
  //     activeQuery: {
  //       scroll: "1m",
  //       scroll_id: scrollId,
  //     },
  //   },
  // });
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
        color="primary"
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
            <Progress min={0} max={100} value={progress} style={{ width: "100%", position: "absolute" }}>
              {progress}%
            </Progress>
          );
        }
        return <div />;
      }}
    />
  );
};

export default React.memo(ExportButton);
