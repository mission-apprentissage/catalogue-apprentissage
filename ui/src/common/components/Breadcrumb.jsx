import React from "react";
import { ArrowDropRightLine } from "../../theme/components/icons";
import { BreadcrumbItem, BreadcrumbLink, Breadcrumb as ChakraBreadcrumb } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";

const Breadcrumb = ({ pages }) => {
  return (
    <ChakraBreadcrumb
      separator={<ArrowDropRightLine color="grey.600" boxSize={3} mb={1} />}
      textStyle="xs"
      color="grey.800"
    >
      {pages.map((page, index) => {
        if (index === pages.length - 1) {
          return (
            <BreadcrumbItem key={page.title} isCurrentPage>
              <BreadcrumbLink>{page.title}</BreadcrumbLink>
            </BreadcrumbItem>
          );
        } else {
          return (
            <BreadcrumbItem key={page.title}>
              <BreadcrumbLink as={NavLink} to={page.to} color="grey.600" textDecoration="underline">
                {page.title}
              </BreadcrumbLink>
            </BreadcrumbItem>
          );
        }
      })}
    </ChakraBreadcrumb>
  );
};

export { Breadcrumb };
