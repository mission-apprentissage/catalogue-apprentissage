import React from "react";
import { Icon } from "@chakra-ui/icons";

import { ReactComponent as SentPaperPlaneIcon } from "../../assets/sent-paper-plane.svg";

export const SentPaperPlane = (props) => {
  return <Icon as={SentPaperPlaneIcon} {...props} />;
};
