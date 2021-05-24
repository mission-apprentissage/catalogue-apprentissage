import React, { useState, useEffect } from "react";
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
  context,
}) {
  let history = useHistory();

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
    history.push(`?qb-${context}=${str}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(rules)]);

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
          autoComplete={autoComplete}
          onAdd={() => setRules([...rules, { ...templateRule, index: rules.length, key: uuidv4() }])}
          onDelete={(index) => {
            setRules(
              rules
                .filter((e) => e.index !== index)
                .filter((e) => e)
                .map((v, k) => ({ ...v, index: k }))
            );
          }}
          onChange={(r) => {
            rules[r.index] = { ...r, key: rules[r.index].key };
            setRules([...rules]);
          }}
        />
      ))}
    </div>
  );
}

export default ({ react, fields, collection, lang = "en", context }) => {
  return (
    <ReactiveComponent
      componentId={`QUERYBUILDER-${context}`}
      react={react}
      URLParams={true}
      value={`qb-${context}`}
      render={(data) => (
        <SubComponent collection={collection} fields={fields} {...data} lang={lang} context={context} />
      )}
    />
  );
};

const SubComponent = ({ setQuery, fields, collection, lang, context }) => {
  const [initialValue, setInitialValue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setQuery({ query: { match_all: {} }, value: "" });
    let s = new URLSearchParams(window.location.search);
    s = s.get(`qb-${context}`);
    if (s) {
      setInitialValue(JSON.parse(s));
    }

    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <div />;

  return (
    <div>
      <QueryBuilder
        context={context}
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
