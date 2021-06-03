import React, { useMemo } from "react";
import { useTable, useFlexLayout, useGlobalFilter, useSortBy } from "react-table";
import { Box, Flex, Text, Stack, Checkbox } from "@chakra-ui/react";
import { Star, SortingArrows } from "../../../theme/components/icons";
import { InfoBadge } from "../InfoBadge";

// TODO FIXEME !important css rules

const buildColumns = (key) => {
  switch (key) {
    case "indice":
      return {
        Header: "INDICE",
        accessor: key,
        width: 110,
      };
    case "uai":
      return {
        Header: "UAI",
        accessor: key,
        width: 180,
      };
    case "siret":
      return {
        Header: "SIRET",
        accessor: key,
        width: 180,
      };
    case "enseigne":
      return {
        Header: "Enseigne",
        accessor: key,
        width: 225,
      };
    case "raison_sociale":
      return {
        Header: "Raison sociale",
        accessor: key,
        width: 225,
      };
    case "adresse":
      return {
        Header: "Adresse de l’organisme",
        accessor: key,
        width: 360,
      };
    case "naf_libelle":
      return {
        Header: "Nature de l’activité",
        accessor: key,
        width: 225,
      };
    case "siege_social":
      return {
        Header: "Siège social",
        accessor: key,
        width: 200,
      };
    case "matched_uai":
      return {
        Header: "Infos issues collecte Carif",
        accessor: key,
        width: 300,
      };
    default:
      return {
        Header: key,
        accessor: key,
      };
  }
};

const Table = ({ data, onRowClick, filename, onSelect }) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const tableData = useMemo(() => data, []);

  const columns = Object.keys(data[0]).map((key) => {
    return buildColumns(key);
  });

  const tableColumns = useMemo(
    () => [
      {
        Header: "select",
        accessor: (row, i) => i,
        width: 20,
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
    useGlobalFilter,
    useSortBy
  );
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = tableInstance;

  const handleChange = (cell, val) => {
    if (document.querySelector(val).checked) {
      const { siret, uai } = cell.row.values;
      onSelect({
        siret,
        uai,
      });
    }
  };

  return (
    <>
      <Box as="table" {...getTableProps()} flex={1} fontSize="delta">
        <Box as="thead">
          {headerGroups.map((headerGroup) => (
            <Flex
              as="tr"
              flex={1}
              {...headerGroup.getHeaderGroupProps({})}
              pb={4}
              borderBottom="3px solid"
              borderColor="bluefrance"
            >
              {headerGroup.headers.map((column, i) => (
                <Text
                  as="th"
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  display={[i === 0 || i > 2 ? "none" : "flex", "flex"]}
                  fontWeight="bold"
                  overflow="hidden"
                  borderColor="grey.800"
                  color="grey.800"
                  px={5}
                >
                  {i !== 0 && (
                    <Stack direction="row" alignItems="center" justifyContent="center">
                      <Text>{column.render("Header")}</Text>
                      <SortingArrows
                        width="9px"
                        height="15px"
                        color="grey.800"
                        mt="0.25rem!important"
                        disabledColor="#cecece"
                        sorting={column.isSorted ? (column.isSortedDesc ? "desc" : "asc") : "none"}
                      />
                    </Stack>
                  )}
                </Text>
              ))}
            </Flex>
          ))}
        </Box>
        <Box as="tbody" {...getTableBodyProps()}>
          {rows.map((row, j) => {
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
                h="auto!important"
                color="grey.800"
                bg={j % 2 === 0 ? "galt" : "white"}
                py="3"
              >
                {row.cells.map((cell, i) => {
                  return (
                    <Box
                      as="td"
                      {...cell.getCellProps()}
                      display={[i === 0 || i > 2 ? "none" : "flex", "flex"]}
                      px={5}
                      overflow="hidden"
                    >
                      {i === 0 && (
                        <Stack mt="0.35rem">
                          <Checkbox
                            name="selectEta"
                            id={`selectEta${j}_${i}`}
                            onChange={() => {
                              handleChange(cell, `#selectEta${j}_${i}`);
                            }}
                            value="on"
                          />
                        </Stack>
                      )}
                      {i === 1 && (
                        <Stack direction="row" mt="0.35rem">
                          {[1, 2, 3].slice(0, cell.value).map((val, i) => {
                            return <Star width="18px" height="15px" color="yellowdark.500" key={i} />;
                          })}
                          {[1, 2, 3].slice(cell.value).map((val, i) => {
                            return <Star width="18px" height="15px" color="grey.400" key={i} />;
                          })}
                        </Stack>
                      )}
                      {i > 1 && i !== 9 && (!cell.value ? <Text color="grey.500">N.A</Text> : cell.render("Cell"))}
                      {i === 9 && (
                        <Stack mt="0.35rem">
                          {cell.value.map((v, i) => (
                            <InfoBadge text={v} variant="published" key={i} />
                          ))}
                        </Stack>
                      )}
                    </Box>
                  );
                })}
              </Box>
            );
          })}
        </Box>
      </Box>
    </>
  );
};

export { Table };
