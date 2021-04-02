import React from "react";
import { MultiList } from "@appbaseio/reactivesearch";
import { Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Box } from "@chakra-ui/react";
import useAuth from "../../../../common/hooks/useAuth";
import { hasOneOfRoles } from "../../../../common/utils/rolesUtils";
import { compact } from "lodash";
import { academies } from "../../../../constants/academies";

const Layout = (props) => {
  const { componentId, dataField, filterLabel, filters, title, selectAllLabel, sortBy } = props;
  let [auth] = useAuth();
  let defaultValue = null;
  let defaultIndex = [];

  if (hasOneOfRoles(auth, ["instructeur"])) {
    if (componentId === "nom_academie") {
      const userAcademies = auth?.academie?.split(",") || [];
      defaultIndex = [0];
      defaultValue = compact(
        userAcademies.map((ua) => {
          return academies[ua]?.nom_academie;
        })
      );
    } else if (componentId === "affelnet_statut" || componentId === "parcoursup_statut") {
      defaultIndex = [0];
      //defaultValue = ["à publier"];
    }
  }

  return (
    <Accordion allowMultiple defaultIndex={defaultIndex} bg="white" mb={6}>
      <AccordionItem>
        <AccordionButton>
          <Box flex="1" textAlign="left">
            {title}
          </Box>
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel pb={4}>
          <MultiList
            className="facet-filters"
            componentId={componentId}
            dataField={dataField}
            filterLabel={filterLabel}
            react={{ and: filters.filter((e) => e !== componentId) }}
            // showMissing={userAcm.all !== "false"}
            defaultValue={defaultValue}
            showCount={true}
            queryFormat="or"
            missingLabel="(Vide)"
            size={20000}
            selectAllLabel={selectAllLabel}
            showCheckbox={true}
            showSearch={true}
            placeholder="Filtrer..."
            showFilter={true}
            URLParams={false}
            loader="Chargement ..."
            defaultQuery={() => {
              return {
                query: {
                  match: {
                    published: true,
                  },
                },
              };
            }}
            sortBy={sortBy}
          />
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};

export default Layout;
