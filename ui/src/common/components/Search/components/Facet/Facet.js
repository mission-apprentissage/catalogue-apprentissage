import React from "react";
import { MultiList } from "@appbaseio/reactivesearch";
import { Accordion, AccordionButton, AccordionItem, AccordionPanel, Box } from "@chakra-ui/react";
import useAuth from "../../../../hooks/useAuth";
import { hasOneOfRoles } from "../../../../utils/rolesUtils";
import { compact } from "lodash";
import { academies } from "../../../../../constants/academies";
import "./facet.css";
import { AddFill, SubtractLine } from "../../../../../theme/components/icons";

const Layout = (props) => {
  const { componentId, dataField, filterLabel, filters, title, selectAllLabel, sortBy } = props;
  let [auth] = useAuth();
  let defaultValue = null;
  let defaultIndex = [];

  if (hasOneOfRoles(auth, ["instructeur"])) {
    if (componentId.startsWith("nom_academie")) {
      const userAcademies = auth?.academie?.split(",") || [];
      defaultIndex = [0];
      defaultValue = compact(
        userAcademies.map((ua) => {
          return academies[ua]?.nom_academie;
        })
      );
    } else if (componentId.startsWith("affelnet_statut") || componentId.startsWith("parcoursup_statut")) {
      defaultIndex = [0];
      //defaultValue = ["à publier"];
    }
  }
  return (
    <Accordion allowMultiple defaultIndex={defaultIndex} bg="#F9F8F6" mb={6}>
      <AccordionItem border="none">
        {({ isExpanded }) => (
          <>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  {title}
                </Box>
                {isExpanded ? (
                  <SubtractLine fontSize="12px" color="bluefrance" />
                ) : (
                  <AddFill fontSize="12px" color="bluefrance" />
                )}
              </AccordionButton>
            </h2>
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
                innerClass={{
                  title: "search-title",
                  input: "search-input",
                }}
                showSearch={true}
                placeholder="Filtrer"
                showFilter={true}
                URLParams={false}
                loader="Chargement"
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
          </>
        )}
      </AccordionItem>
    </Accordion>
  );
};

export default Layout;
