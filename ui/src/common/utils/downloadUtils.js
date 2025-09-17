export const downloadCSV = (fileName, csv) => {
  const blob = new Blob([csv], {
    type: "text/csv;charset=UTF-8",
  });

  if (window.navigator.msSaveOrOpenBlob) {
    // IE hack; see http://msdn.microsoft.com/en-us/library/ie/hh779016.aspx
    window.navigator.msSaveBlob(blob, fileName);
  } else {
    let a = window.document.createElement("a");
    a.href = window.URL.createObjectURL(blob);

    a.download = fileName;
    document.body.appendChild(a);
    a.click(); // IE: "Access is denied"; see: https://connect.microsoft.com/IE/feedback/details/797361/ie-10-treats-blob-url-as-cross-origin-and-denies-access
    document.body.removeChild(a);
  }
};

export const CSV_SEPARATOR = ";";

export const escapeDiacritics = (str) =>
  str
    ?.normalize("NFD")
    ?.replace(/[\u0300-\u036f]/g, "")
    ?.replace(/\s+/g, " ")
    ?.replaceAll('"', '""')
    ?.replaceAll(";", ",") ?? "";

export const createCSV = ({ headers, rows }) => {
  const lines = rows.map((rowData) => {
    const row = headers.map(({ key, formatter }) => {
      return rowData[key] && formatter ? formatter(rowData[key]) : rowData[key];
    });
    return row.join(CSV_SEPARATOR);
  });

  return [headers.map(({ label }) => label).join(CSV_SEPARATOR), ...lines].join("\n");
};
