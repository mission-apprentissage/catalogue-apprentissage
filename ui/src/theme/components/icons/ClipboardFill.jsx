import React from "react";
import { Icon } from "@chakra-ui/icons";

import { ReactComponent as ClipboardFillIcon } from "../../assets/clipboard-fill.svg";

export const ClipboardFill = (props) => {
  return <Icon as={ClipboardFillIcon} {...props} />;
};
