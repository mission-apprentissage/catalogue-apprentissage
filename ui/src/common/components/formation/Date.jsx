import React, { Fragment } from "react";
import { Text } from "@chakra-ui/react";

export const Date = ({ date }) => {
  let displayedDate = <strong>{date}</strong>;
  try {
    const dateObj = date.reduce((acc, dateStr) => {
      const date = new Date(dateStr);
      const formattedDate = date.toLocaleString("fr-FR", { month: "long" });
      const displayedDate = formattedDate === "Invalid Date" ? dateStr : formattedDate;
      const year = isNaN(date.getFullYear()) ? "Période invalide" : date.getFullYear();
      acc[year] = acc[year] ?? [];
      acc[year] = [...acc[year], displayedDate];
      return acc;
    }, {});

    displayedDate = Object.entries(dateObj).map(([key, value], index) => {
      return (
        <Fragment key={key}>
          {!!index && <br />}
          <Text as="span">
            <strong>
              {key} : {value.join(", ")}
            </strong>
          </Text>
        </Fragment>
      );
    });
  } catch (e) {
    console.error("unable to parse date field", date, e);
  }

  return (
    <Text variant="highlight" as="span">
      {displayedDate}
    </Text>
  );
};
