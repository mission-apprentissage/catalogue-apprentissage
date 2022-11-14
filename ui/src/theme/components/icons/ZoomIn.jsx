import React from "react";
import { Icon } from "@chakra-ui/icons";

import { ReactComponent as ZoomInIcon } from "../../assets/zoom-in.svg";

export const ZoomIn = (props) => {
  return <Icon as={ZoomInIcon} {...props} />;
};
