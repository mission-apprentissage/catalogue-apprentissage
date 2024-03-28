import React from "react";
import { Icon } from "@chakra-ui/icons";

import { ReactComponent as ClipboardLineIcon } from "../../assets/clipboard-line.svg";

export const ClipboardLine = (props) => {
  return <Icon as={ClipboardLineIcon} {...props} />;
};
