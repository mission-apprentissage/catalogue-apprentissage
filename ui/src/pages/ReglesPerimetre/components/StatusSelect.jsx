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

export const StatusSelect = ({ plateforme, currentStatus, condition, onChange, size = "sm", isDisabled, ...rest }) => {
  const statusList = STATUS_LIST[condition]?.[plateforme];
  return (
    <Select
      {...rest}
      isDisabled={isDisabled || (statusList?.length <= 1 && !rest.placeholder)}
      bg={
        currentStatus && currentStatus !== COMMON_STATUS.NON_PUBLIABLE_EN_LETAT ? "orangemedium.200" : "greendark.200"
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
        <option value={status} key={status}>
          {status}
        </option>
      ))}
    </Select>
  );
};
