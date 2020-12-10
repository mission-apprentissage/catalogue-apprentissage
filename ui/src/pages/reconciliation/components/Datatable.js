import React from "react";
import { useTable } from "react-table";
import { Box } from "@chakra-ui/react";

const style = {};

export default ({ headers, data }) => {
  const headersData = React.useMemo(() => headers, []);
  const tableData = React.useMemo(() => data, []);

  const table = useTable({ columns: headersData, data: tableData });

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = table;

  return (
    <Box as="table" {...getTableProps()}>
      <Box as="thead">
        {headerGroups.map((headerGroup) => {
          return (
            <Box as="tr" {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <Box as="th" {...column.getHeaderProps()}>
                  {column.render("Header")}
                </Box>
              ))}
            </Box>
          );
        })}
      </Box>

      <Box as="tbody" {...getTableBodyProps()}>
        {rows.map((row) => {
          prepareRow(row);
          return (
            <Box as="tr" {...row.getRowProps()}>
              {row.cells.map((cell) => {
                return (
                  <Box as="td" {...cell.getCellProps()}>
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
