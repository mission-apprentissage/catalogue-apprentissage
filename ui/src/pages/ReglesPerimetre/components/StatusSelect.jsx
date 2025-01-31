import React from "react";
import { Select } from "@chakra-ui/react";
import { CONDITIONS } from "../../../constants/conditionsIntegration";
import { AFFELNET_STATUS, COMMON_STATUS, PARCOURSUP_STATUS } from "../../../constants/status";
import { PLATEFORME } from "../../../constants/plateforme";

export const STATUS_LIST = {
  [CONDITIONS.PEUT_INTEGRER]: {
    parcoursup: [
      PARCOURSUP_STATUS.A_PUBLIER_HABILITATION,
      PARCOURSUP_STATUS.A_PUBLIER_VERIFIER_POSTBAC,
      PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR,
      PARCOURSUP_STATUS.A_PUBLIER,
    ],
    affelnet: [AFFELNET_STATUS.A_DEFINIR],
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
    plateforme === PLATEFORME.AFFELNET
      ? [
          AFFELNET_STATUS.A_DEFINIR,
          COMMON_STATUS.A_PUBLIER,
          AFFELNET_STATUS.A_PUBLIER_VALIDATION,
          COMMON_STATUS.NON_PUBLIABLE_EN_LETAT,
        ]
      : [];

  const statusList = [
    ...new Set(
      academie ? [...STATUS_LIST[condition]?.[plateforme], ...academieStatusList] : STATUS_LIST[condition]?.[plateforme]
    ),
  ];

  let background = "greendark.300";

  console.log(currentStatus);

  switch (currentStatus) {
    case AFFELNET_STATUS.A_DEFINIR:
      background = "#D5DBEF";
      break;
    case COMMON_STATUS.NON_PUBLIABLE_EN_LETAT:
      background = "greendark.300";
      break;
    case COMMON_STATUS.A_PUBLIER:
    case AFFELNET_STATUS.A_PUBLIER_VALIDATION:
    case PARCOURSUP_STATUS.A_PUBLIER_HABILITATION:
    case PARCOURSUP_STATUS.A_PUBLIER_VERIFIER_POSTBAC:
    case PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR:
      background = "orangemedium.300";
      break;
    default:
      break;
  }

  return (
    <Select
      {...rest}
      isDisabled={isDisabled || (statusList?.length <= 1 && !rest.placeholder)}
      bg={background}
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
