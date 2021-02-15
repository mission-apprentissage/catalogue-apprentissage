import React from "react";
import { Badge, Text, Flex } from "@chakra-ui/react";
import { ReactComponent as InfoIcon } from "../../theme/assets/info-circle.svg";
import { ReactComponent as ExclamationIcon } from "../../theme/assets/exclamation-circle.svg";
import { ReactComponent as ProcessingIcon } from "../../theme/assets/processing.svg";
import { ReactComponent as CloudSlashedIcon } from "../../theme/assets/cloud-slashed.svg";
import { ReactComponent as CloudIcon } from "../../theme/assets/cloud.svg";

const Icon = ({ variant }) => {
  switch (variant) {
    case "notRelevant":
      return <InfoIcon />;
    case "published":
      return <CloudIcon />;
    case "notPublished":
      return <CloudSlashedIcon />;
    case "pending":
      return <ProcessingIcon />;
    case "toBePublished":
      return <ExclamationIcon />;
    default:
      return <InfoIcon />;
  }
};

export const StatusBadge = ({ source, status, ...badgeProps }) => {
  const defaultVariant = "notRelevant";
  const variantsMap = {
    "hors périmètre": "notRelevant",
    publié: "published",
    "non publié": "notPublished",
    "à publier (soumis à validation)": "toBePublished",
    "à publier": "toBePublished",
    "en attente de publication": "pending",
  };

  const variant = variantsMap[status] ?? defaultVariant;

  return (
    <Badge variant={variant} {...badgeProps}>
      <Flex alignItems="center">
        <Icon variant={variant} />
        <Text ml={1}>
          {source} - {status}
        </Text>
      </Flex>
    </Badge>
  );
};
