import React from "react";
import { Badge, Text, Flex } from "@chakra-ui/react";
import { InfoCircle, Cloud, Processing, ExclamationCircle, CloudSlashed } from "../../theme/components/icons/index";

const Icon = ({ variant }) => {
  switch (variant) {
    case "notRelevant":
      return null;
    case "published":
      return <Cloud />;
    case "notPublished":
      return <CloudSlashed />;
    case "pending":
      return <Processing />;
    case "toBePublished":
      return <ExclamationCircle />;
    default:
      return <InfoCircle />;
  }
};

export const StatusBadge = ({ source, status, ...badgeProps }) => {
  const defaultVariant = "notRelevant";
  const variantsMap = {
    "hors périmètre": "notRelevant",
    publié: "published",
    "non publié": "notPublished",
    "à publier (soumis à validation)": "toBePublished",
    "à publier (vérifier accès direct postbac)": "toBePublished",
    "à publier (soumis à validation Recteur)": "toBePublished",
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
