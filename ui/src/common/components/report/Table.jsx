import React, { useMemo, useState, useCallback, useEffect } from "react";
import { useTable, useFlexLayout, useGlobalFilter, useFilters, useAsyncDebounce } from "react-table";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList } from "react-window";
import { Box, Flex, Text, Input, Button, Stack } from "@chakra-ui/react";
import { downloadCSV, CSV_SEPARATOR } from "../../utils/downloadUtils";
// A great library for fuzzy filtering/sorting items
import { matchSorter } from "match-sorter";

const csvExport = (headers, rows, filename) => {
  const hasSiretsHeader = headers.some((header) => header === "sirets");

  const computedHeaders = headers.reduce((acc, header) => {
    if (header === "sirets") {
      try {
        const siretHeaders = Object.keys(JSON.parse(rows[0].values["sirets"])).map((key) => `siret_${key}`);
        return [...acc, ...siretHeaders];
      } catch (e) {
        return [...acc, header];
      }
    }

    return [...acc, header];
  }, []);

  const lines = rows.map(({ values }) => {
    let computedValues = { ...values };
    if (hasSiretsHeader) {
      try {
        const siretValues = Object.entries(JSON.parse(values["sirets"])).reduce((acc, [key, value]) => {
          return { ...acc, [`siret_${key}`]: value };
        }, {});

        computedValues = { ...values, ...siretValues };
      } catch (e) {
        // do nothing
      }
    }

    const row = computedHeaders.map((header) => {
      return computedValues[header];
    });
    return row.join(CSV_SEPARATOR);
  });

  const data = [computedHeaders.join(CSV_SEPARATOR), ...lines].join("\n");
  downloadCSV(`${filename}.csv`, data);
};

// Define a default UI for filtering
function GlobalFilter({ preGlobalFilteredRows, globalFilter, setGlobalFilter, rows, headers, filename }) {
  return (
    <Stack direction="row" spacing={4} mb={8} justifyContent={"space-between"}>
      <Text flex={1} px={8} alignSelf="center">
        {rows.length} résultat(s) trouvé(s)
      </Text>
      <Button colorScheme="teal" disabled={rows.length === 0} onClick={() => csvExport(headers, rows, filename)}>
        Exporter
      </Button>
    </Stack>
  );
}

// Define a default UI for filtering
function DefaultColumnFilter({ column: { Header, filterValue, setFilter }, outsideFilter }) {
  const [value, setValue] = useState(filterValue);
  const onChange = useAsyncDebounce((value) => {
    setFilter(value || undefined);
  }, 200);

  useEffect(() => {
    const val = outsideFilter?.values?.join("###");
    if (outsideFilter && Header === outsideFilter.key && val !== value) {
      setValue(val);
      onChange(val);
    }
  }, [outsideFilter, Header, onChange, value]);

  return (
    <Input
      maxWidth="500px"
      variant="flushed"
      value={value || ""}
      onChange={(e) => {
        setValue(e.target.value);
        onChange(e.target.value);
      }}
      placeholder={`Filtrer`}
    />
  );
}

function fuzzyTextFilterFn(rows, id, filterValue) {
  return matchSorter(rows, filterValue, { keys: [(row) => row.values[id]], threshold: matchSorter.rankings.CONTAINS });
}

// Let the table remove the filter if the string is empty
fuzzyTextFilterFn.autoRemove = (val) => !val;

function multipleValuesSearchFilterFn(rows, id, filterValue) {
  if (!filterValue || !filterValue.length) {
    return rows;
  }

  const terms = filterValue.split("###");
  if (!terms) {
    return rows;
  }

  let results = [];
  terms.reduce((acc, term) => {
    const match = matchSorter(acc, term, {
      keys: [(row) => row.values[id]],
      threshold: matchSorter.rankings.CONTAINS,
    });

    results = [...results, ...match];

    const idToRemove = match.map(({ index }) => index);
    return acc.filter(({ index }) => !idToRemove.includes(index));
  }, rows);
  return results;
}
// Let the table remove the filter if the string is empty
multipleValuesSearchFilterFn.autoRemove = (val) => !val;

const Table = ({ data, onRowClick, filename, outsideFilter }) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const tableData = useMemo(() => data, []);

  const filterTypes = React.useMemo(
    () => ({
      // Add a new fuzzyTextFilterFn filter type.
      fuzzyText: fuzzyTextFilterFn,
      multipleValuesSearch: multipleValuesSearchFilterFn,
      // Or, override the default text filter to use
      // "startWith"
      text: (rows, id, filterValue) => {
        return rows.filter((row) => {
          const rowValue = row.values[id];
          return rowValue !== undefined
            ? String(rowValue).toLowerCase().startsWith(String(filterValue).toLowerCase())
            : true;
        });
      },
    }),
    []
  );

  const columns = Object.keys(data[0]).map((key) => {
    return {
      Header: key,
      accessor: key,
      width: key === "updates" ? 300 : key === "mnaId" || key === "id" || key === "cfd" || key === "rncp" ? 60 : 150,
      filter: outsideFilter?.key === key ? "multipleValuesSearch" : "fuzzyText",
    };
  });

  const tableColumns = useMemo(
    () => [
      {
        Header: "index",
        accessor: (row, i) => i,
        width: 25,
        disableFilters: true,
      },
      ...columns,
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const defaultColumn = useMemo(
    () => ({
      // When using the useFlexLayout:
      width: 150, // width is used for both the flex-basis and flex-grow
      // Let's set up our default Filter UI
      Filter: DefaultColumnFilter,
    }),
    []
  );

  const tableInstance = useTable(
    { columns: tableColumns, data: tableData, defaultColumn, filterTypes },
    useFlexLayout,
    useGlobalFilter,
    useFilters
  );
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state: { globalFilter },
    preGlobalFilteredRows,
    setGlobalFilter,
  } = tableInstance;

  const Row = useCallback(
    ({ index, style }) => {
      const row = rows[index];
      prepareRow(row);

      return (
        <Box
          as="tr"
          {...row.getRowProps()}
          display="flex"
          key={row.id}
          data-rowindex={row.index}
          onClick={() => onRowClick?.(row.index)}
          cursor={onRowClick ? "pointer" : undefined}
          _hover={{ bg: "grey.700" }}
          lineHeight="50px"
          borderBottom="1px solid"
          borderColor="grey.600"
          style={style}
        >
          {row.cells.map((cell, i) => {
            return (
              <Box
                as="td"
                {...cell.getCellProps()}
                display={[i === 0 || i > 2 ? "none" : "flex", "flex"]}
                px={2}
                overflow="hidden"
              >
                {cell.value !== "null" ? cell.render("Cell") : "N.A"}
              </Box>
            );
          })}
        </Box>
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [prepareRow, rows]
  );

  return (
    <>
      <GlobalFilter
        preGlobalFilteredRows={preGlobalFilteredRows}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        rows={rows}
        headers={headerGroups[0].headers.map(({ Header }) => Header)}
        filename={filename}
      />
      <Box as="table" {...getTableProps()} w="100%" flex={1} fontSize="delta">
        <Box as="thead">
          {headerGroups.map((headerGroup) => (
            <Flex as="tr" flex={1} {...headerGroup.getHeaderGroupProps({})} pb={4}>
              {headerGroup.headers.map((column, i) => (
                <Box
                  as="th"
                  {...column.getHeaderProps()}
                  display={[i === 0 || i > 2 ? "none" : "flex", "flex"]}
                  overflow="hidden"
                  px={2}
                >
                  <Flex flexDirection="column" w="full" alignItems="flex-start">
                    <Text textTransform="uppercase" fontWeight="normal" textAlign="left">
                      {column.render("Header")}
                    </Text>
                    {/* Render the columns filter UI */}
                    <Flex w="90%" alignItems="flex-start">
                      {column.canFilter ? column.render("Filter", { outsideFilter }) : null}
                    </Flex>
                  </Flex>
                </Box>
              ))}
            </Flex>
          ))}
        </Box>
        <Box as="tbody" {...getTableBodyProps()}>
          <AutoSizer disableHeight>
            {({ width }) => (
              <FixedSizeList height={850} itemCount={rows.length} itemSize={50} width={width} overscanCount={50}>
                {Row}
              </FixedSizeList>
            )}
          </AutoSizer>
        </Box>
      </Box>
    </>
  );
};

export { Table };
