import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Divider,
  Flex,
} from "@chakra-ui/react";
import { AddFill, SubtractLine } from "../../../../theme/components/icons";
import Facet from "./Facet";
import { allowedFilters } from "../constantsFormations";
import useAuth from "../../../hooks/useAuth";
import { InfoTooltip } from "../../InfoTooltip";
import { DatePicker } from "@appbaseio/reactivesearch";
import React, { useState } from "react";

export const QuickFilterItem = ({ head, body }) => {
  let defaultIndex = [];

  return (
    <Box mb={2}>
      <Accordion allowMultiple defaultIndex={defaultIndex} bg="#F9F8F6">
        <AccordionItem border="none">
          {({ isExpanded }) => (
            <>
              <h2>
                <AccordionButton height={"auto"} minHeight={"3.5rem"}>
                  <Box flex="1" textAlign="left">
                    {head}
                  </Box>
                  {isExpanded ? (
                    <SubtractLine fontSize="12px" color="bluefrance" />
                  ) : (
                    <AddFill fontSize="12px" color="bluefrance" />
                  )}
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>{body}</AccordionPanel>
            </>
          )}
        </AccordionItem>
      </Accordion>
    </Box>
  );
};

const FacetFilter = ({ filter }) => {
  return (
    <Facet
      componentId={filter.componentId}
      dataField={filter.dataField}
      title={filter.title}
      filterLabel={filter.filterLabel}
      selectAllLabel={filter.selectAllLabel}
      filters={allowedFilters}
      sortBy={filter.sortBy}
      size={filter.size}
      defaultQuery={() => {
        return {
          query: {
            match: {
              published: true,
            },
          },
        };
      }}
      URLParams={true}
      react={{ and: allowedFilters.filter((e) => e !== filter.componentId) }}
      helpTextSection={filter.helpTextSection}
      transformData={filter.transformData}
      customQuery={filter.customQuery}
      showSearch={filter.showSearch}
    />
  );
};

const DateRangeFilter = ({ filter }) => {
  const auth = useAuth();

  return (
    <>
      {auth?.sub !== "anonymous" && (
        <QuickFilterItem
          head={
            <>
              {filter.title} {filter.helpTextSection && <InfoTooltip description={filter.helpTextSection} />}
            </>
          }
          body={
            <Flex direction="column" mb={2} bgColor={"#F9F8F6"}>
              <Flex>
                <Box w="50%">
                  <DatePicker
                    componentId={`${filter.dataField}_start`}
                    dataField={filter.dataField}
                    placeholder={"A partir de"}
                    numberOfMonths={1}
                    queryFormat="date"
                    showClear={false}
                    showFilter={true}
                    filterLabel={`${filter.filterLabel} à partir du`}
                    URLParams={true}
                    customQuery={(value) => {
                      return value
                        ? {
                            query: {
                              range: {
                                [`${filter.dataField}`]: {
                                  gte: value,
                                },
                              },
                            },
                          }
                        : {};
                    }}
                  />
                </Box>
                <Box w="50%">
                  <DatePicker
                    componentId={`${filter.dataField}_end`}
                    dataField={filter.dataField}
                    placeholder={"Jusqu'au"}
                    numberOfMonths={1}
                    queryFormat="date"
                    showClear={false}
                    showFilter={true}
                    filterLabel={`${filter.filterLabel} jusqu'au`}
                    URLParams={true}
                    customQuery={(value) => {
                      return value
                        ? {
                            query: {
                              range: {
                                [`${filter.dataField}`]: {
                                  lte: value,
                                },
                              },
                            },
                          }
                        : {};
                    }}
                  />
                </Box>
              </Flex>
            </Flex>
          }
        />
      )}
    </>
  );
};

const AdvancedFilter = ({ filter }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!filter.filters?.length) {
    return null;
  }

  return (
    <Box>
      <Button
        variant="unstyled"
        textDecoration={"underline"}
        fontStyle="italic"
        style={{ textWrap: "balance", textAlign: "left", height: "auto", color: "gray" }}
        p={1}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? filter.openText : filter.closeText}
      </Button>

      <Box mt={2} display={isOpen ? "block" : "none"}>
        <QuickFilters filters={filter.filters} />{" "}
      </Box>
    </Box>
  );
};

export const QuickFilters = ({ filters }) => {
  return (
    <>
      {filters.map((filter, index) => {
        switch (filter.type) {
          case "facet": {
            return (
              <React.Fragment key={index}>
                <FacetFilter filter={filter} />
              </React.Fragment>
            );
          }

          case "date-range": {
            return (
              <React.Fragment key={index}>
                <DateRangeFilter filter={filter} />
              </React.Fragment>
            );
          }

          case "advanced": {
            return (
              <React.Fragment key={index}>
                <AdvancedFilter filter={filter} />
              </React.Fragment>
            );
          }

          case "component": {
            return <React.Fragment key={index}>{filter.component}</React.Fragment>;
          }

          case "divider": {
            return (
              <React.Fragment key={index}>
                <Divider my={6} />
              </React.Fragment>
            );
          }

          default: {
            return null;
          }
        }
      })}
    </>
  );
};
