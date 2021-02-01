import React, { useState } from "react";
import { SingleList } from "@appbaseio/reactivesearch";
import { Link, Box } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink } from "@fortawesome/free-solid-svg-icons";

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
                bool: {
                  must: [
                    { match: { etablissement_reference_catalogue_published: data === "Catalogue général" } },
                    // { match: { rncp_etablissement_reference_habilite: data === "Catalogue général" } },
                    // { match: { rncp_eligible_apprentissage: data === "Catalogue général" } },
                  ],
                },
              },
            };
      }}
      showFilter={false}
      showSearch={false}
      showCount={true}
      renderItem={(label, count) => (
        <>
          <span>
            <span>
              <span>{label}</span>
              {label === "Catalogue non-éligible" && (
                <Box pt={2}>
                  <Link as={NavLink} to="/guide-reglementaire#conditions-etablissement" color="grey.600">
                    <FontAwesomeIcon icon={faLink} /> conditions d'éligibilité
                  </Link>
                </Box>
              )}
            </span>
            <span>{count}</span>
          </span>
        </>
      )}
    />
  );
});
export default ToggleCatalogue;
