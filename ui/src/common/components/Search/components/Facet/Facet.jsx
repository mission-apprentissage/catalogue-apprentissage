import React, { useCallback } from "react";
import { MultiList } from "@appbaseio/reactivesearch";
import { Flex, Text } from "@chakra-ui/react";
import { InfoTooltip } from "../../../InfoTooltip";
import { QuickFilterItem } from "../QuickFilters";

import "./facet.css";

const Facet = ({
  componentId,
  dataField,
  filterLabel,
  // filters,
  title,
  selectAllLabel,
  sortBy,
  helpTextSection,
  defaultQuery,
  transformData,
  customQuery,
  size,
  react,
  showSearch = true,
}) => {
  let defaultValue = null;

  const renderItem = useCallback(
    (label, count) => (
      <Flex justifyContent="space-between" w="full">
        <Flex pr={2}>
          <Text as="span" pr={1}>
            {label}
          </Text>
          {helpTextSection?.[label] && <InfoTooltip description={helpTextSection[label]} />}
        </Flex>
        <Text as={"span"} color={"grey.500"}>
          {count}
        </Text>
      </Flex>
    ),
    [helpTextSection]
  );

  return (
    <QuickFilterItem
      head={
        <>
          {title} {helpTextSection?.title && <InfoTooltip description={helpTextSection.title} />}
        </>
      }
      body={
        <MultiList
          className="facet-filters"
          componentId={componentId}
          dataField={dataField}
          filterLabel={filterLabel}
          react={react}
          defaultValue={defaultValue}
          showCount={true}
          queryFormat="or"
          missingLabel="(Vide)"
          size={size}
          selectAllLabel={selectAllLabel}
          showCheckbox={true}
          innerClass={{
            title: "search-title",
            input: "search-input",
            list: "search-list",
            checkbox: "search-checkbox",
            label: "search-label",
          }}
          showSearch={showSearch}
          placeholder="Rechercher"
          showFilter={true}
          URLParams={true}
          loader="Chargement"
          defaultQuery={defaultQuery}
          transformData={transformData}
          customQuery={customQuery}
          sortBy={sortBy}
          renderItem={helpTextSection ? renderItem : null}
          // onValueChange={onValueChange}
        />
      }
    />
  );
};

export default Facet;
