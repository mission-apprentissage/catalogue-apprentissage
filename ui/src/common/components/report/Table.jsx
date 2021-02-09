import React, { useMemo, useState, useCallback } from "react";
import { useTable, useFlexLayout, useGlobalFilter, useAsyncDebounce } from "react-table";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList } from "react-window";
import { Box, Flex, Text, Input, Button, Stack } from "@chakra-ui/react";
import { downloadCSV, REPORTS_CSV_SEPARATOR } from "../../utils/downloadUtils";

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
    return row.join(REPORTS_CSV_SEPARATOR);
  });

  const data = [computedHeaders.join(REPORTS_CSV_SEPARATOR), ...lines].join("\n");
  downloadCSV(`${filename}.csv`, data);
};

// Define a default UI for filtering
function GlobalFilter({ preGlobalFilteredRows, globalFilter, setGlobalFilter, rows, headers, filename }) {
  const count = preGlobalFilteredRows.length;
  const [value, setValue] = useState(globalFilter);

  const onChange = useAsyncDebounce((value) => {
    setGlobalFilter(value || undefined);
  }, 200);

  return (
    <Stack direction="row" spacing={4} mb={8} justifyContent={"space-between"}>
      <Input
        flex={1}
        maxWidth="500px"
        variant="flushed"
        value={value || ""}
        onChange={(e) => {
          setValue(e.target.value);
          onChange(e.target.value);
        }}
        placeholder={`Rechercher parmi les ${count} résultats`}
      />
      {rows.length !== count && (
        <Text flex={1} px={8} alignSelf="center">
          {rows.length} résultat(s) trouvé(s)
        </Text>
      )}
      <Button colorScheme="teal" disabled={rows.length === 0} onClick={() => csvExport(headers, rows, filename)}>
        Exporter
      </Button>
    </Stack>
  );
}

const Table = ({ data, onRowClick, filename }) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const tableData = useMemo(() => data, []);

  const columns = Object.keys(data[0]).map((key) => {
    return {
      Header: key,
      accessor: key,
      width: key === "updates" ? 300 : 150,
    };
  });

  const tableColumns = useMemo(
    () => [
      {
        Header: "index",
        accessor: (row, i) => i,
        width: 50,
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
    }),
    []
  );

  const tableInstance = useTable(
    { columns: tableColumns, data: tableData, defaultColumn },
    useFlexLayout,
    useGlobalFilter
  );
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state,
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
                {cell.render("Cell")}
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
        globalFilter={state.globalFilter}
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
                <Text
                  as="th"
                  {...column.getHeaderProps()}
                  display={[i === 0 || i > 2 ? "none" : "flex", "flex"]}
                  textTransform="uppercase"
                  fontWeight="normal"
                  overflow="hidden"
                  px={2}
                >
                  {column.render("Header")}
                </Text>
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
