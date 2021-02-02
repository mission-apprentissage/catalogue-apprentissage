import React from "react";
import { MultiList } from "@appbaseio/reactivesearch";
import { Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Box } from "@chakra-ui/react";
import useAuth from "../../../../common/hooks/useAuth";
import { hasOneOfRoles } from "../../../../common/utils/rolesUtils";
import { compact } from "lodash";

const academies = {
  "01": { nom_academie: "Paris", num_academie: 1 },
  "02": { nom_academie: "Aix-Marseille", num_academie: 2 },
  "03": { nom_academie: "Besançon", num_academie: 3 },
  "04": { nom_academie: "Bordeaux", num_academie: 4 },
  "06": { nom_academie: "Clermont-Ferrand", num_academie: 6 },
  "07": { nom_academie: "Dijon", num_academie: 7 },
  "08": { nom_academie: "Grenoble", num_academie: 8 },
  "09": { nom_academie: "Lille", num_academie: 9 },
  "10": { nom_academie: "Lyon", num_academie: 10 },
  "11": { nom_academie: "Montpellier", num_academie: 11 },
  "12": { nom_academie: "Nancy-Metz", num_academie: 12 },
  "13": { nom_academie: "Poitiers", num_academie: 13 },
  "14": { nom_academie: "Rennes", num_academie: 14 },
  "15": { nom_academie: "Strasbourg", num_academie: 15 },
  "16": { nom_academie: "Toulouse", num_academie: 16 },
  "17": { nom_academie: "Nantes", num_academie: 17 },
  "18": { nom_academie: "Orléans-Tours", num_academie: 18 },
  "19": { nom_academie: "Reims", num_academie: 19 },
  "20": { nom_academie: "Amiens", num_academie: 20 },
  "22": { nom_academie: "Limoges", num_academie: 22 },
  "23": { nom_academie: "Nice", num_academie: 23 },
  "24": { nom_academie: "Créteil", num_academie: 24 },
  "25": { nom_academie: "Versailles", num_academie: 25 },
  "27": { nom_academie: "Corse", num_academie: 27 },
  "28": { nom_academie: "La Réunion", num_academie: 28 },
  "31": { nom_academie: "Martinique", num_academie: 31 },
  "32": { nom_academie: "Guadeloupe", num_academie: 32 },
  "33": { nom_academie: "Guyane", num_academie: 33 },
  "43": { nom_academie: "Mayotte", num_academie: 43 },
  "70": { nom_academie: "Normandie", num_academie: 70 },
};

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
