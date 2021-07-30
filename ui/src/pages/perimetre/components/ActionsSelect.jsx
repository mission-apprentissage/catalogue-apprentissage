import React from "react";
import { Select } from "@chakra-ui/react";
import { CONDITIONS } from "../../../constants/conditionsIntegration";

export const ActionsSelect = ({ value = CONDITIONS.NE_DOIT_PAS_INTEGRER, onChange, size = "sm", ...rest }) => {
  return (
    <Select
      {...rest}
      bg={[CONDITIONS.PEUT_INTEGRER, CONDITIONS.DOIT_INTEGRER].includes(value) ? "greenmedium.200" : "greendark.200"}
      size={size}
      onClick={(e) => {
        e.stopPropagation();
      }}
      onChange={onChange}
      value={value}
    >
      {Object.values(CONDITIONS).map((value) => {
        return (
          <option key={value} value={value}>
            {value}
          </option>
        );
      })}
    </Select>
  );
};
