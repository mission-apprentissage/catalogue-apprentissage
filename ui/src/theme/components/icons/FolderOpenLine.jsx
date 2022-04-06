import React from "react";
import { Icon } from "@chakra-ui/icons";

import { ReactComponent as FolderOpenLineIcon } from "../../assets/folder-open-line.svg";

export const FolderOpenLine = (props) => {
  return <Icon as={FolderOpenLineIcon} {...props} />;
};
