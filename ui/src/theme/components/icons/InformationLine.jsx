import React from "react";
import { Icon } from "@chakra-ui/icons";

import { ReactComponent as InformationLineIcon } from "../../assets/information-line.svg";

export const InformationLine = (props) => {
  return <Icon as={InformationLineIcon} {...props} />;
};
