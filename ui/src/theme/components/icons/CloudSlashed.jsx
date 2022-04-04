import React from "react";
import { Icon } from "@chakra-ui/icons";

import { ReactComponent as CloudSlashedIcon } from "../../assets/cloud-slashed.svg";

export const CloudSlashed = (props) => {
  return <Icon as={CloudSlashedIcon} {...props} />;
};
