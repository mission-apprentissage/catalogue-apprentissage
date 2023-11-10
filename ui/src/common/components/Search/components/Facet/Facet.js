import React, { useCallback } from "react";
// import { useSearchParams } from "react-router-dom";
import { MultiList } from "@appbaseio/reactivesearch";
import { Flex, Text } from "@chakra-ui/react";
import useAuth from "../../../../hooks/useAuth";
import { hasOneOfRoles } from "../../../../utils/rolesUtils";
import compact from "lodash.compact";
import { academies } from "../../../../../constants/academies";
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
  let [auth] = useAuth();
  let defaultValue = null;
  // const [searchParams, setSearchParams] = useSearchParams();

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

  // const onValueChange = useCallback(
  //   (value) => {
  //     setSearchParams((prevSearchParams) => {
  //       prevSearchParams.set(componentId, JSON.stringify(value));
  //       return prevSearchParams;
  //     });
  //   },
  //   [componentId, setSearchParams]
  // );

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
