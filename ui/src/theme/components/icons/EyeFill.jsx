import React from "react";
import { Icon } from "@chakra-ui/icons";

import { ReactComponent as EyeFillIcon } from "../../assets/eye-fill.svg";

export const EyeFill = (props) => {
  return <Icon as={EyeFillIcon} {...props} />;
};
