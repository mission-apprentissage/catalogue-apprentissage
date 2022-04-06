import React from "react";
import { Icon } from "@chakra-ui/icons";

import { ReactComponent as ExternalLinkLineIcon } from "../../assets/external-link-line.svg";

export const ExternalLinkLine = (props) => {
  return <Icon as={ExternalLinkLineIcon} {...props} />;
};
