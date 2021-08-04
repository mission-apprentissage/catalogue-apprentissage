import React, { useCallback, useEffect, useMemo, useState } from "react";
import Rule from "../../../common/components/Search/components/QueryBuilder/rule";
import { combinators, operators } from "../../../common/components/Search/components/QueryBuilder/utils_fr";
import { uuidv4, withUniqueKey } from "../../../common/components/Search/components/QueryBuilder/utils";
import constantsReglesPerimetre from "../../../common/components/Search/constantsReglesPerimetre";
import { FORMATIONS_ES_INDEX } from "../../../constants/es";
import { serialize } from "../../../common/utils/rulesUtils";

const rulesOperators = operators.filter(({ value }) =>
  ["===", "!==", "===*", "!==*", "===^", "===$", "*."].includes(value)
);

export function computeQuery(queries) {
  const obj = {};
  queries
    .filter((q) => q.query)
    .forEach((q, k) => {
      let combinator = q.combinator;
      if (k === 0) {
        combinator = queries.length === 1 ? "AND" : queries[1].combinator;
      }

      const key = combinator === "AND" ? "$and" : "$or";
      obj[key] = obj[key] ?? [];
      obj[key].push(q.query);
    });
  return obj;
}

export const RuleBuilder = ({ regle_complementaire_query, regle_complementaire, onQueryChange, isDisabled }) => {
  const { queryBuilderField: fields } = constantsReglesPerimetre;

  const templateRule = useMemo(
    () => ({
      field: fields[0].value,
      operator: rulesOperators[0].value,
      value: "",
      combinator: "AND",
      index: 0,
    }),
    [fields]
  );

  console.log(regle_complementaire);
  const initialValue = regle_complementaire_query ? JSON.parse(regle_complementaire_query) : null;
  const [rules, setRules] = useState(withUniqueKey(initialValue || [templateRule]));

  useEffect(() => {
    const query = computeQuery(
      rules.map((r) => ({
        ...r,
        query: rulesOperators.find((o) => o.value === r.operator).mongoQuery(r.field, r.value),
      }))
    );
    const serializedQuery = serialize(query);

    if (serializedQuery !== regle_complementaire) {
      onQueryChange(serializedQuery, JSON.stringify(rules));
    }
  }, [onQueryChange, rules, regle_complementaire]);

  const onAdd = useCallback(
    () =>
      setRules((prevRules) => [
        ...prevRules,
        {
          ...templateRule,
          index: prevRules.length,
          key: uuidv4(),
        },
      ]),
    [templateRule]
  );
  const onDelete = useCallback((index) => {
    setRules((prevRules) =>
      prevRules
        .filter((e) => e.index !== index)
        .filter((e) => e)
        .map((v, k) => ({
          ...v,
          index: k,
        }))
    );
  }, []);
  const onChange = useCallback((r) => {
    setRules((prevRules) => {
      prevRules[r.index] = {
        ...r,
        key: prevRules[r.index].key,
      };
      return [...prevRules];
    });
  }, []);

  return (
    <>
      {rules.map((rule) => (
        <Rule
          isDisabled={isDisabled}
          key={rule.key}
          combinator={rule.combinator}
          field={rule.field}
          operator={rule.operator}
          value={rule.value}
          fields={fields}
          operators={rulesOperators}
          combinators={combinators}
          collection={FORMATIONS_ES_INDEX}
          index={rule.index}
          length={rules.length}
          onAdd={onAdd}
          onDelete={onDelete}
          onChange={onChange}
          noSuggest
        />
      ))}
    </>
  );
};
