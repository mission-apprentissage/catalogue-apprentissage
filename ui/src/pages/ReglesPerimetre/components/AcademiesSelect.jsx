import React, { memo, useEffect, useState } from "react";
import { Select } from "@chakra-ui/react";
import { ACADEMIES } from "../../../constants/academies";
import { hasAcademyRight, hasAllAcademiesRight, isUserAdmin } from "../../../common/utils/rolesUtils";

const sortedAcademies = Object.values(ACADEMIES).sort(({ nom_academie: nomA }, { nom_academie: nomB }) =>
  nomA.localeCompare(nomB, "fr")
);

export const AcademiesSelect = memo(
  ({ user, onChange, ...props }) => {
    const [academiesList, setAcademiesList] = useState([]);

    useEffect(() => {
      if (user) {
        if (isUserAdmin(user) || hasAllAcademiesRight(user)) {
          setAcademiesList(sortedAcademies);
          onChange(null);
        } else {
          setAcademiesList(sortedAcademies.filter(({ num_academie }) => hasAcademyRight(user, num_academie)));
          const [firstAcademy] = user.academie?.split(",")?.map((academieStr) => Number(academieStr)) ?? [];
          onChange(`${firstAcademy}`);
        }
      }
    }, [user, onChange]);

    return (
      <Select
        {...props}
        onChange={async (e) => {
          const academie = e.target.value === "national" ? null : e.target.value;
          onChange(academie);
        }}
        data-testid={"academies"}
      >
        {user && (isUserAdmin(user) || hasAllAcademiesRight(user)) && <option value={"national"}>au National</option>}
        {academiesList.map(({ nom_academie, num_academie }) => {
          return (
            <option key={num_academie} value={num_academie}>
              de {nom_academie} ({num_academie})
            </option>
          );
        })}
      </Select>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.user?.permissions?.isAdmin === nextProps.user?.permissions?.isAdmin &&
      prevProps.user?.academie === nextProps.user?.academie
    );
  }
);
