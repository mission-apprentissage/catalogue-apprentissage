import React from "react";
import { useTable } from "react-table";
import { Box } from "@chakra-ui/react";

export default ({ headers, data }) => {
  const headersData = React.useMemo(() => headers, [headers]);
  const tableData = React.useMemo(() => data, [data]);

  const table = useTable({ columns: headersData, data: tableData });

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = table;

  return (
    <Box as="table" {...getTableProps()}>
      <Box bg="lightgray" as="thead">
        {headerGroups.map((headerGroup) => {
          return (
            <Box as="tr" {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => {
                return (
                  <Box p={2} minWidth="100px" fontSize="sm" as="th" {...column.getHeaderProps()}>
                    {column.render("Header")}
                  </Box>
                );
              })}
            </Box>
          );
        })}
      </Box>

      <Box as="tbody" {...getTableBodyProps()}>
        {rows.map((row) => {
          const {
            values: {
              _id: { dangerously_added_by_user },
            },
          } = row;
          prepareRow(row);
          return (
            <Box bg={dangerously_added_by_user ? "lightblue" : ""} as="tr" {...row.getRowProps()}>
              {row.cells.map((cell) => {
                return (
                  <Box p={2} minWidth="100px" as="td" {...cell.getCellProps()}>
                    {cell.render("Cell")}
                  </Box>
                );
              })}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};
