import React from "react";
import { Icon } from "@chakra-ui/icons";

import { ReactComponent as InfoLineIcon } from "../../assets/info-line.svg";

export const InfoLine = (props) => {
  return <Icon as={InfoLineIcon} {...props} />;
};
