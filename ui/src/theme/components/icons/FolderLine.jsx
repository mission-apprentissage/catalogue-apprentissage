import React from "react";
import { Icon } from "@chakra-ui/icons";

import { ReactComponent as FolderLineIcon } from "../../assets/folder-line.svg";

export const FolderLine = (props) => {
  return <Icon as={FolderLineIcon} {...props} />;
};
