import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ReactiveComponent } from "@appbaseio/reactivesearch";

import {
  mergedQueries,
  uuidv4,
  withUniqueKey,
  operators as defaultOperators,
  combinators as defaultCombinators,
} from "./utils";
import Rule from "./rule";

const QueryBuilder = ({
  fields,
  operators = defaultOperators,
  combinators = defaultCombinators,
  templateRule,
  initialValue,
  onQuery,
  autoComplete,
  collection,
}) => {
  const navigate = useNavigate();

  templateRule = templateRule || {
    field: fields[0].value,
    operator: operators[0].value,
    value: "",
    combinator: "AND",
    comment: "",
    index: 0,
  };

  const [rules, setRules] = useState(withUniqueKey(initialValue || [templateRule]));
  const [filteredCombinators, setFilteredCombinators] = useState(combinators);

  useEffect(() => {
    const queries = mergedQueries(
      rules.map((r) => ({ ...r, query: operators.find((o) => o.value === r.operator).query(r.field, r.value) }))
    );
    onQuery(queries);
    const obj = JSON.stringify(rules);
    const str = encodeURIComponent(obj);

    let s = new URLSearchParams(window.location.search);
    s.set("qb", str);

    navigate(`?${s}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps

    setFilteredCombinators(
      rules[2] ? combinators.filter((combinator) => combinator.value === rules[1].combinator) : combinators
    );
  }, [rules, rules.length]);

  const onAdd = useCallback(() => {
    setRules((prevRules) => [
      ...prevRules,
      {
        ...templateRule,
        combinator: prevRules[prevRules.length - 1].combinator,
        index: prevRules.length,
        key: uuidv4(),
      },
    ]);
  }, [templateRule]);
  const onDelete = useCallback((index) => {
    setRules((prevRules) =>
      prevRules
        .filter((e) => e.index !== index)
        .filter((e) => e)
        .map((v, k) => ({ ...v, index: k }))
    );
  }, []);
  const onChange = useCallback((r) => {
    setRules((prevRules) => {
      prevRules[r.index] = { ...r, key: prevRules[r.index].key };
      return [...prevRules];
    });
  }, []);
  return (
    <div className="react-es-query-builder">
      {rules.map((rule) => (
        <Rule
          combinator={rule.combinator}
          field={rule.field}
          operator={rule.operator}
          showComment={false}
          comment={rule.comment}
          value={rule.value}
          fields={fields}
          operators={operators}
          combinators={filteredCombinators}
          key={rule.key}
          collection={collection}
          index={rule.index}
          length={rules.length}
          autoComplete={autoComplete}
          onAdd={onAdd}
          onDelete={onDelete}
          onChange={onChange}
        />
      ))}
    </div>
  );
};

const SubComponent = ({ setQuery, fields, collection, showComments }) => {
  const [initialValue, setInitialValue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setQuery({ query: { match_all: {} }, value: "" });
    let s = new URLSearchParams(window.location.search);
    s = s.get("qb");
    if (s) {
      try {
        setInitialValue(JSON.parse(decodeURIComponent(s)));
      } catch (e) {
        console.error(e);
        console.log(s);
      }
    }

    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <div />;

  return (
    <div>
      <QueryBuilder
        collection={collection}
        initialValue={initialValue}
        fields={fields}
        onQuery={(queries) => {
          if (!queries.must.length && !queries.must_not.length && !queries.should.length) {
            return setQuery({ query: { match_all: {} }, value: "" });
          }

          setQuery({ query: { bool: queries }, value: "" });
        }}
      />
    </div>
  );
};

export default ({ react, fields, collection }) => {
  return (
    <ReactiveComponent
      componentId={`QUERYBUILDER`}
      react={react}
      URLParams={true}
      value={"qb"}
      render={(data) => <SubComponent collection={collection} fields={fields} {...data} />}
    />
  );
};
