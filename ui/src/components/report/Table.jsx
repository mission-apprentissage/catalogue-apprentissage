import React, { useMemo } from "react";
import { useTable, useFlexLayout } from "react-table";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList } from "react-window";
import { Box, Flex, Text } from "@chakra-ui/react";

const Table = ({ data, onRowClick }) => {
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
    []
  );

  const defaultColumn = React.useMemo(
    () => ({
      // When using the useFlexLayout:
      width: 150, // width is used for both the flex-basis and flex-grow
    }),
    []
  );

  const tableInstance = useTable({ columns: tableColumns, data: tableData, defaultColumn }, useFlexLayout);
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = tableInstance;

  const Row = React.useCallback(
    ({ index, style }) => {
      const row = rows[index];
      prepareRow(row);
      return (
        <Box
          {...row.getRowProps()}
          display="flex"
          key={row.id}
          data-rowindex={row.index}
          onClick={() => onRowClick?.(index)}
          cursor={onRowClick ? "pointer" : undefined}
          _hover={{ bg: "gray.700" }}
          lineHeight="50px"
          borderBottom="1px solid #6A6A6A"
          style={style}
        >
          {row.cells.map((cell) => {
            return (
              <Box {...cell.getCellProps()} display="flex" px={2} overflow="hidden">
                {cell.render("Cell")}
              </Box>
            );
          })}
        </Box>
      );
    },
    [prepareRow, rows]
  );

  return (
    <Box {...getTableProps()} w="100%" flex={1} fontSize={19}>
      <Box>
        {headerGroups.map((headerGroup) => (
          <Flex flex={1} {...headerGroup.getHeaderGroupProps({})} pb={4}>
            {headerGroup.headers.map((column) => (
              <Text as="div" {...column.getHeaderProps()} display="flex" textTransform="uppercase">
                {column.render("Header")}
              </Text>
            ))}
          </Flex>
        ))}
      </Box>
      <Box {...getTableBodyProps()}>
        <AutoSizer disableHeight>
          {({ width }) => (
            <FixedSizeList height={900} itemCount={rows.length} itemSize={50} width={width} overscanCount={50}>
              {Row}
            </FixedSizeList>
          )}
        </AutoSizer>
      </Box>
    </Box>
  );
};

export { Table };
