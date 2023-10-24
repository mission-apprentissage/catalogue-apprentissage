import React, { useCallback } from "react";
import { MultiList } from "@appbaseio/reactivesearch";
import { Accordion, AccordionButton, AccordionItem, AccordionPanel, Box, Flex, Text } from "@chakra-ui/react";
import useAuth from "../../../../hooks/useAuth";
import { hasOneOfRoles } from "../../../../utils/rolesUtils";
import compact from "lodash.compact";
import { academies } from "../../../../../constants/academies";
import "./facet.css";
import { AddFill, SubtractLine } from "../../../../../theme/components/icons";
import InfoTooltip from "../../../InfoTooltip";
import { QuickFilterItem } from "../QuickFilters";

const Facet = ({
  componentId,
  dataField,
  filterLabel,
  filters,
  title,
  selectAllLabel,
  sortBy,
  helpTextSection,
  defaultQuery,
  transformData,
  customQuery,
  size,
  showSearch = true,
}) => {
  let [auth] = useAuth();
  let defaultValue = null;
  let defaultIndex = [];

  if (hasOneOfRoles(auth, ["instructeur"])) {
    if (componentId.startsWith("nom_academie")) {
      const userAcademies = auth?.academie?.split(",") || [];
      defaultValue = compact(
        userAcademies.map((ua) => {
          return academies[ua]?.nom_academie;
        })
      );
    }
  }

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
          react={{ and: filters.filter((e) => e !== componentId) }}
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
        />
      }
    />
  );
};

export default Facet;
