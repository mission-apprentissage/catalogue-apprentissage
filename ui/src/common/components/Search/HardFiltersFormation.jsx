import React from "react";
import { SingleList } from "@appbaseio/reactivesearch";
import { CATALOGUE_GENERAL_LABEL, CATALOGUE_NON_ELIGIBLE_LABEL } from "../../../constants/catalogueLabels";
import { CONTEXT } from "../../../constants/context";

const HardFiltersFormation = React.memo(({ allowedFilters, context }) => {
  return (
    <>
      <SingleList
        componentId="published"
        dataField="published"
        react={{ and: allowedFilters.filter((e) => e !== "published") }}
        value={"true"}
        defaultValue={"true"}
        showFilter={false}
        showSearch={false}
        showCount={false}
        render={() => {
          return <div />;
        }}
      />

      <SingleList
        componentId="catalogue_published"
        dataField="catalogue_published"
        react={{ and: allowedFilters.filter((e) => e !== "catalogue_published") }}
        value={context === CONTEXT.CATALOGUE_GENERAL ? CATALOGUE_GENERAL_LABEL : CATALOGUE_NON_ELIGIBLE_LABEL}
        defaultValue={context === CONTEXT.CATALOGUE_GENERAL ? CATALOGUE_GENERAL_LABEL : CATALOGUE_NON_ELIGIBLE_LABEL}
        transformData={(data) => {
          return data.map((d) => ({
            ...d,
            key: d.key === 1 ? CATALOGUE_GENERAL_LABEL : CATALOGUE_NON_ELIGIBLE_LABEL,
          }));
        }}
        customQuery={(data) => {
          return !data || data.length === 0
            ? {}
            : {
                query: {
                  bool: {
                    must: [{ match: { catalogue_published: data === CATALOGUE_GENERAL_LABEL } }],
                  },
                },
              };
        }}
        showFilter={false}
        showSearch={false}
        showCount={false}
        render={() => {
          return <div />;
        }}
      />
    </>
  );
});
export default HardFiltersFormation;
