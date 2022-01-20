import React, { Fragment } from "react";
import { Text } from "@chakra-ui/react";

export const FormationPeriode = ({ periode }) => {
  let displayedPeriode = <strong>{periode}</strong>;
  try {
    const periodeObj = periode.reduce((acc, dateStr) => {
      const date = new Date(dateStr);
      const formattedDate = date.toLocaleString("fr-FR", { month: "long" });
      const displayedDate = formattedDate === "Invalid Date" ? dateStr : formattedDate;
      const year = isNaN(date.getFullYear()) ? "Période invalide" : date.getFullYear();
      acc[year] = acc[year] ?? [];
      acc[year] = [...acc[year], displayedDate];
      return acc;
    }, {});

    displayedPeriode = Object.entries(periodeObj).map(([key, value]) => {
      return (
        <Fragment key={key}>
          <br />
          <Text as="span">
            <strong>
              {key} : {value.join(", ")}
            </strong>
          </Text>
        </Fragment>
      );
    });
  } catch (e) {
    console.error("unable to parse periode field", periode, e);
  }

  return <>{displayedPeriode}</>;
};
