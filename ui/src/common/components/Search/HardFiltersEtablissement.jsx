import React from "react";
import { SingleList } from "@appbaseio/reactivesearch";

export const HardFiltersEtablissement = React.memo(({ allowedFilters }) => {
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
    </>
  );
});
