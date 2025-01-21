import React from "react";
import { Select } from "@chakra-ui/react";
import { CONDITIONS } from "../../../constants/conditionsIntegration";
import { AFFELNET_STATUS, COMMON_STATUS, PARCOURSUP_STATUS } from "../../../constants/status";

export const STATUS_LIST = {
  [CONDITIONS.PEUT_INTEGRER]: {
    parcoursup: [
      PARCOURSUP_STATUS.A_PUBLIER_HABILITATION,
      PARCOURSUP_STATUS.A_PUBLIER_VERIFIER_POSTBAC,
      PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR,
      PARCOURSUP_STATUS.A_PUBLIER,
    ],
    affelnet: [AFFELNET_STATUS.A_PUBLIER_VALIDATION],
  },
  [CONDITIONS.DOIT_INTEGRER]: {
    parcoursup: [PARCOURSUP_STATUS.A_PUBLIER],
    affelnet: [AFFELNET_STATUS.A_PUBLIER],
  },
  [CONDITIONS.NE_DOIT_PAS_INTEGRER]: {
    parcoursup: [PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT],
    affelnet: [AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT],
  },
};

const getDisplayedStatus = ({ plateforme, status }) => {
  if (status === COMMON_STATUS.NON_PUBLIABLE_EN_LETAT) {
    return `hors périmètre ${plateforme}`;
  }
  return status;
};

export const StatusSelect = ({
  plateforme,
  academie,
  currentStatus,
  condition,
  onChange,
  size = "sm",
  isDisabled,
  ...rest
}) => {
  const academieStatusList =
    plateforme === "affelnet"
      ? [COMMON_STATUS.A_PUBLIER, AFFELNET_STATUS.A_PUBLIER_VALIDATION, COMMON_STATUS.NON_PUBLIABLE_EN_LETAT]
      : [];

  const statusList = [
    ...new Set(
      academie ? [...STATUS_LIST[condition]?.[plateforme], ...academieStatusList] : STATUS_LIST[condition]?.[plateforme]
    ),
  ];

  return (
    <Select
      {...rest}
      isDisabled={isDisabled || (statusList?.length <= 1 && !rest.placeholder)}
      bg={
        currentStatus && currentStatus === COMMON_STATUS.A_PUBLIER
          ? "greenmedium.300"
          : currentStatus && currentStatus !== COMMON_STATUS.NON_PUBLIABLE_EN_LETAT
            ? "orangemedium.300"
            : "greendark.300"
      }
      size={size}
      onClick={(e) => {
        e.stopPropagation();
      }}
      value={currentStatus}
      onChange={onChange}
      iconColor={rest.disabled ? "gray.400" : "gray.800"}
    >
      {statusList?.map((status) => (
        <option value={status} disabled={academie ? !academieStatusList.includes(status) : false} key={status}>
          {getDisplayedStatus({ plateforme, status })}
        </option>
      ))}
    </Select>
  );
};
