import React from "react";
import { Icon } from "@chakra-ui/icons";

import { ReactComponent as EmojiSmileIcon } from "../../assets/emoji-smile.svg";

export const EmojiSmile = (props) => {
  return <Icon as={EmojiSmileIcon} {...props} />;
};
