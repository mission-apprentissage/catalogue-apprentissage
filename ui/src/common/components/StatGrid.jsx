import { Grid, GridItem } from "@chakra-ui/react";
import React from "react";
import StatCard from "./StatCard";

const StatGrid = (props) => {
  return (
    <Grid templateColumns="repeat(12, 1fr)" gap={2} pb={4}>
      {props.data?.map((item, i) => {
        return (
          <GridItem key={i} colSpan={[6, 3]}>
            <StatCard
              background={props.background ?? "#ffffff"}
              color={props.color ?? "#1a424c"}
              label={item.title}
              stat={item.value}
            />
          </GridItem>
        );
      })}
    </Grid>
  );
};

export default StatGrid;
