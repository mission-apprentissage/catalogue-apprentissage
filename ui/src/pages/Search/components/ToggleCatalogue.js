import React, { useState } from "react";
import { SingleList } from "@appbaseio/reactivesearch";

const ToggleCatalogue = React.memo(({ filters, onChanged }) => {
  const [values, setValues] = useState("Catalogue général");

  const onChange = (val) => {
    const value = val || "Catalogue général";
    setValues(value);
    onChanged(value === "Catalogue général" ? true : false);
  };

  return (
    <SingleList
      componentId="catalogue_published"
      dataField="etablissement_reference_catalogue_published"
      react={{ and: filters.filter((e) => e !== "catalogue_published") }}
      value={values}
      onChange={onChange}
      defaultValue="Catalogue général"
      transformData={(data) => {
        return data.map((d) => ({
          ...d,
          key: d.key === 1 ? "Catalogue général" : "Catalogue non-éligible",
        }));
      }}
      customQuery={(data) => {
        return !data || data.length === 0
          ? {}
          : {
              query: {
                match: {
                  etablissement_reference_catalogue_published: data === "Catalogue général",
                },
              },
            };
      }}
      showFilter={true}
      showSearch={false}
      showCount={true}
    />
  );
});
export default ToggleCatalogue;
