import React from "react";
import { Icon } from "@chakra-ui/icons";

import { ReactComponent as DownloadLineIcon } from "../../assets/download-line.svg";

export const DownloadLine = (props) => {
  return <Icon as={DownloadLineIcon} {...props} />;
};
