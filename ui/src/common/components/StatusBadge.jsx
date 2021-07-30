import React from "react";
import { Badge, Text, Flex } from "@chakra-ui/react";
import {
  InfoCircle,
  Cloud,
  Processing,
  ExclamationCircle,
  CloudSlashed,
  RejectIcon,
  Question,
} from "../../theme/components/icons/index";
import { AFFELNET_STATUS, COMMON_STATUS, PARCOURSUP_STATUS } from "../../constants/status";

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
    case "reject":
      return <RejectIcon />;
    case "unknown":
      return <Question />;
    default:
      return <InfoCircle />;
  }
};

export const StatusBadge = ({ source, status, ...badgeProps }) => {
  const defaultVariant = "notRelevant";
  const variantsMap = {
    [COMMON_STATUS.HORS_PERIMETRE]: "notRelevant",
    [COMMON_STATUS.PUBLIE]: "published",
    [COMMON_STATUS.NON_PUBLIE]: "notPublished",
    [AFFELNET_STATUS.A_PUBLIER_VALIDATION]: "toBePublished",
    [PARCOURSUP_STATUS.A_PUBLIER_VERIFIER_POSTBAC]: "toBePublished",
    [PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR]: "toBePublished",
    [COMMON_STATUS.A_PUBLIER]: "toBePublished",
    [COMMON_STATUS.EN_ATTENTE]: "pending",
    Rejeté: "reject",
    Inconnu: "unknown",
  };

  const variant = variantsMap[status] ?? defaultVariant;

  return (
    <Badge variant={variant} {...badgeProps}>
      <Flex alignItems="center">
        <Icon variant={variant} />
        <Text ml={1} as={"span"} whiteSpace={"break-spaces"}>
          {source ? `${source} - ${status}` : `${status}`}
        </Text>
      </Flex>
    </Badge>
  );
};
