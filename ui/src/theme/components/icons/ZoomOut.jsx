import React from "react";
import { Icon } from "@chakra-ui/icons";

import { ReactComponent as ZoomOutIcon } from "../../assets/zoom-out.svg";

export const ZoomOut = (props) => {
  return <Icon as={ZoomOutIcon} {...props} />;
};
