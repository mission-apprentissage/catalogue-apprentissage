import React from "react";
import { Icon } from "@chakra-ui/icons";

import { ReactComponent as ProcessingIcon } from "../../assets/processing.svg";

export const Processing = (props) => {
  return <Icon as={ProcessingIcon} {...props} />;
};
