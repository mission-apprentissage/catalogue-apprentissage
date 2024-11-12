import React, { useContext } from "react";
import { Badge, Text, Flex } from "@chakra-ui/react";
import {
  Cloud,
  CloudSlashed,
  WarningLine,
  ExclamationCircle,
  InfoCircle,
  Processing,
  Question,
  Reject,
} from "../../theme/components/icons";
import { AFFELNET_STATUS, COMMON_STATUS, PARCOURSUP_STATUS } from "../../constants/status";
import { DateContext } from "../../DateContext";

const Icon = ({ variant }) => {
  switch (variant) {
    case "notRelevant":
      return <CloudSlashed />;
    case "published":
      return <Cloud />;
    case "notPublished":
      return <CloudSlashed />;
    case "pending":
      return <Processing />;
    case "toBePublished":
      return <ExclamationCircle />;
    case "reject":
      return <Reject />;
    case "nonConforme":
      return <Reject />;
    case "unknown":
      return <Question />;
    case "conforme":
      return <InfoCircle />;
    case "error":
      return <WarningLine />;
    default:
      return <InfoCircle />;
  }
};

export const StatusBadge = ({ source, status, text, ...badgeProps }) => {
  const defaultVariant = "notRelevant";
  const variantsMap = {
    [COMMON_STATUS.NON_PUBLIABLE_EN_LETAT]: "notRelevant",
    [COMMON_STATUS.PUBLIE]: "published",
    [COMMON_STATUS.NON_PUBLIE]: "notPublished",
    [AFFELNET_STATUS.A_PUBLIER_VALIDATION]: "toBePublished",
    [PARCOURSUP_STATUS.A_PUBLIER_HABILITATION]: "toBePublished",
    [PARCOURSUP_STATUS.A_PUBLIER_VERIFIER_POSTBAC]: "toBePublished",
    [PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR]: "toBePublished",
    [PARCOURSUP_STATUS.REJETE]: "error",
    [PARCOURSUP_STATUS.FERME]: "error",
    [COMMON_STATUS.A_PUBLIER]: "toBePublished",
    [COMMON_STATUS.EN_ATTENTE]: "pending",
    Rejeté: "reject",
    Inconnu: "unknown",
    nonConforme: "nonConforme",
    conforme: "conforme",
  };

  const variant = variantsMap[status] ?? defaultVariant;

  return (
    <Badge variant={variant} {...badgeProps} minHeight={"28px"}>
      <Flex alignItems="center" mx={2}>
        <Icon variant={variant} />
        <Text ml={1} as={"span"} whiteSpace={"break-spaces"}>
          {text ? `${text}` : source ? `${source} - ${status}` : `${status}`}
        </Text>
      </Flex>
    </Badge>
  );
};

export const PreviousStatusBadge = ({ source, status, created_at, text, ...badgeProps }) => {
  const defaultVariant = "ok";

  const { campagneStartDate } = useContext(DateContext);

  const variant = defaultVariant;
  if (created_at && new Date(created_at).getTime() > campagneStartDate?.getTime()) {
    return (
      <Badge variant={"conforme"} {...badgeProps} minHeight={"28px"}>
        <Text as={"span"} whiteSpace={"break-spaces"}>
          Nouvelle fiche
        </Text>
      </Badge>
    );
  }

  return (
    <Badge variant={variant} {...badgeProps} minHeight={"28px"}>
      <Flex alignItems="center" mx={2}>
        {/* <Icon variant={variant} /> */}
        <Text as={"span"} whiteSpace={"break-spaces"}>
          {text ? `${text}` : source ? `${source} N-1 - ${status}` : `N-1 - ${status}`}
        </Text>
      </Flex>
    </Badge>
  );
};
