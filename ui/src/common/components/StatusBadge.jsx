import React from "react";
import { Badge } from "@chakra-ui/react";

export const StatusBadge = ({ source, status, ...badgeProps }) => {
  const defaultVariant = "notRelevant";
  const variantsMap = {
    "hors périmètre": "notRelevant",
    publié: "published",
    "non publié": "notPublished",
    "à publier": "toBePublished",
    "en attente de publication": "pending",
  };

  const variant = variantsMap[status] ?? defaultVariant;

  return (
    <Badge variant={variant} {...badgeProps}>
      {source} - {status}
    </Badge>
  );
};
