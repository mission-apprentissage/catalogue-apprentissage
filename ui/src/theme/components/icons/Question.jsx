import React from "react";
import { Icon } from "@chakra-ui/icons";

import { ReactComponent as QuestionIcon } from "../../assets/question.svg";

export const Question = (props) => {
  return <Icon as={QuestionIcon} {...props} />;
};
