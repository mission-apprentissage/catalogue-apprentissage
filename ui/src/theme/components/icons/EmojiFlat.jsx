import React from "react";
import { Icon } from "@chakra-ui/icons";

import { ReactComponent as EmojiFlatIcon } from "../../assets/emoji-flat.svg";

export const EmojiFlat = (props) => {
  return <Icon as={EmojiFlatIcon} {...props} />;
};
