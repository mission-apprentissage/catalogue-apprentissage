import React from "react";
import { Icon } from "@chakra-ui/icons";

import { ReactComponent as EyeOffFillIcon } from "../../assets/eye-off-fill.svg";

export const EyeOffFill = (props) => {
  return <Icon as={EyeOffFillIcon} {...props} />;
};
