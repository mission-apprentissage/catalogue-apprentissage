import React, { useState, useEffect, useCallback } from "react";
import { ReactiveComponent } from "@appbaseio/reactivesearch";
import { useHistory } from "react-router-dom";

import { defaultOperators, defaultCombinators, mergedQueries, uuidv4, withUniqueKey } from "./utils";
import { operators as frOperators, combinators as frCombinators } from "./utils_fr";
import Rule from "./rule";

function QueryBuilder({
  fields,
  operators,
  combinators,
  templateRule,
  initialValue,
  onQuery,
  autoComplete,
  collection,
  lang,
}) {
  const history = useHistory();

  operators = operators || (lang === "fr" ? frOperators : defaultOperators);
  combinators = combinators || (lang === "fr" ? frCombinators : defaultCombinators);
  templateRule = templateRule || {
    field: fields[0].value,
    operator: operators[0].value,
    value: "",
    combinator: "AND",
    index: 0,
  };
  const [rules, setRules] = useState(withUniqueKey(initialValue || [templateRule]));

  useEffect(() => {
    const queries = mergedQueries(
      rules.map((r) => ({ ...r, query: operators.find((o) => o.value === r.operator).query(r.field, r.value) }))
    );
    onQuery(queries);
    const obj = JSON.stringify(rules);
    const str = encodeURIComponent(obj);

    let s = new URLSearchParams(window.location.search);
    s.set("qb", str);

    history.push(`?${s}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rules]);

  const onAdd = useCallback(
    () => setRules((prevRules) => [...prevRules, { ...templateRule, index: prevRules.length, key: uuidv4() }]),
    [templateRule]
  );
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
          value={rule.value}
          fields={fields}
          operators={operators}
          combinators={combinators}
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
}

export default ({ react, fields, collection, lang = "en" }) => {
  return (
    <ReactiveComponent
      componentId={`QUERYBUILDER`}
      react={react}
      URLParams={true}
      value={"qb"}
      render={(data) => <SubComponent collection={collection} fields={fields} {...data} lang={lang} />}
    />
  );
};

const SubComponent = ({ setQuery, fields, collection, lang }) => {
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
        lang={lang}
        onQuery={(queries) => {
          if (
            !queries.must.length &&
            !queries.must_not.length &&
            !queries.should.length &&
            !queries.should_not.length
          ) {
            return setQuery({ query: { match_all: {} }, value: "" });
          }

          setQuery({ query: { bool: queries }, value: "" });
        }}
      />
    </div>
  );
};
