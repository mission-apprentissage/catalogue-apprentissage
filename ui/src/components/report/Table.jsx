import React, { useMemo } from "react";
import { useTable } from "react-table";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList } from "react-window";
import { Box, Flex, PseudoBox, Text } from "@chakra-ui/react";

const Table = ({ data }) => {
  const tableData = useMemo(() => data, []);

  const columns = Object.keys(data[0]).map((key) => {
    return {
      Header: key,
      accessor: key,
    };
  });

  const tableColumns = useMemo(
    () => [
      {
        Header: "index",
        accessor: (row, i) => i,
      },
      ...columns,
    ],
    []
  );
  const tableInstance = useTable({ columns: tableColumns, data: tableData });
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = tableInstance;

  const Row = React.useCallback(
    ({ index, style }) => {
      const row = rows[index];
      prepareRow(row);
      return (
        <tr {...row.getRowProps()} style={{ ...style, display: "flex" }}>
          {row.cells.map((cell) => {
            return (
              <div
                {...cell.getCellProps()}
                style={{
                  display: "flex",
                  padding: "10px",
                  border: "solid 1px gray",
                  overflow: "hidden",
                  minWidth: 200,
                }}
              >
                {cell.render("Cell")}
              </div>
            );
          })}
        </tr>
      );
    },
    [prepareRow, rows]
  );

  return (
    <table {...getTableProps()} style={{ border: "solid 1px gray", width: "100%" }}>
      <div>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <th
                {...column.getHeaderProps()}
                style={{
                  borderBottom: "solid 3px gray",
                  fontWeight: "bold",
                }}
              >
                {column.render("Header")}
              </th>
            ))}
          </tr>
        ))}
      </div>
      <tbody {...getTableBodyProps()}>
        <AutoSizer disableHeight>
          {({ width }) => (
            <FixedSizeList height={700} itemCount={rows.length} itemSize={35} width={width} overscanCount={50}>
              {Row}
            </FixedSizeList>
          )}
        </AutoSizer>
      </tbody>
    </table>
  );
};

export { Table };
