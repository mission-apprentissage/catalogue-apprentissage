import React from "react";
import { Badge, Text, Flex } from "@chakra-ui/react";
// import { ReactComponent as InfoIcon } from "../../theme/assets/info-circle.svg";
// import { ReactComponent as ExclamationIcon } from "../../theme/assets/exclamation-circle.svg";
// import { ReactComponent as ProcessingIcon } from "../../theme/assets/processing.svg";
// import { ReactComponent as CloudSlashedIcon } from "../../theme/assets/cloud-slashed.svg";
// import { ReactComponent as CloudIcon } from "../../theme/assets/cloud.svg";
import { InfoCircle, Cloud, Processing, ExclamationCircle, CloudSlashed } from "../../theme/components/icons/index";

// const Icon = ({ variant }) => {
//   switch (variant) {
//     case "notRelevant":
//       return <InfoIcon />;
//     case "published":
//       return <CloudIcon />;
//     case "notPublished":
//       return <CloudSlashedIcon />;
//     case "pending":
//       return <ProcessingIcon />;
//     case "toBePublished":
//       return <ExclamationIcon />;
//     default:
//       return <InfoIcon />;
//   }
// };

const Icon = ({ variant }) => {
  switch (variant) {
    case "notRelevant":
      return <bold />;
    case "published":
      return <Cloud w="0.938rem" h="0.938rem" />;
    case "notPublished":
      return <CloudSlashed w="0.938rem" h="0.938rem" />;
    case "pending":
      return <Processing w="0.938rem" h="0.938rem" />;
    case "toBePublished":
      return <ExclamationCircle w="0.938rem" h="0.938rem" />;
    default:
      return <InfoCircle w="0.938rem" h="0.938rem" />;
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
