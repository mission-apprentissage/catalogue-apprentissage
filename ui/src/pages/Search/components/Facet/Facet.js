import React, { useState } from "react";
import { MultiList } from "@appbaseio/reactivesearch";
// import { Card } from "tabler-react";
// import { useSelector } from "react-redux";
import { Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Box } from "@chakra-ui/react";

import "./facet.css";

const Layout = (props) => {
  const { componentId, dataField, filterLabel, filters, title, selectAllLabel, sortBy } = props;
  const [isOpen, setIsOpen] = useState(false);
  // const { acm: userAcm } = useSelector((state) => state.user);

  const toggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Accordion allowMultiple className="card">
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
