import React, { useState, useEffect } from "react";
import Autosuggest from "react-autosuggest";
import { Input, Button, Select } from "@chakra-ui/react";

const endpointNewFront = process.env.REACT_APP_ENDPOINT_NEW_FRONT || "https://catalogue.apprentissage.beta.gouv.fr/api";

const esQuery = (queries) => {
  let query = "";
  for (let i = 0; i < queries.length; i++) {
    query += `${JSON.stringify(queries[i])}\n`;
  }

  return fetch(`${endpointNewFront}/search/_msearch`, {
    mode: "cors",
    method: "POST",
    redirect: "follow",

    referrer: "no-referrer",
    headers: { "Content-Type": "application/x-ndjson" },
    body: query,
  })
    .then((r) => r.json())
    .catch((e) => {
      console.log(e);
    });
};

export default function Rule({ fields, operators, combinators, collection, ...props }) {
  // const [{ url, headers }] = useSharedContext();
  const [combinator, setCombinator] = useState(props.combinator);
  const [field, setField] = useState(props.field);
  const [operator, setOperator] = useState(props.operator);
  const [value, setValue] = useState(props.value);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    props.onChange({ field, operator, value, combinator, index: props.index });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [field, operator, value, combinator]);

  const combinatorElement = props.index ? (
    <Select
      id={`react-es-rule-combinator-${field}-0`}
      maxWidth={90}
      margin={"5px"}
      className="react-es-rule-combinator"
      value={combinator}
      onChange={(e) => setCombinator(e.target.value)}
    >
      {combinators.map((c) => (
        <option key={c.value} value={c.value}>
          {c.text}
        </option>
      ))}
    </Select>
  ) : null;

  const deleteButton = props.index ? (
    <Button
      size="sm"
      colorScheme="red"
      className="react-es-rule-delete"
      style={{ marginLeft: "10px", alignSelf: "center", fontSize: 16 }}
      onClick={() => props.onDelete(props.index)}
    >
      &times;
    </Button>
  ) : null;

  let input = null;
  if (operators.find((o) => o.value === operator && o.useInput)) {
    // Autocomplete zone.
    if (!Array.isArray(field)) {
      input = (
        <Autosuggest
          suggestions={suggestions}
          onSuggestionsFetchRequested={async ({ value }) => {
            let query;
            const suggestionQuery = operators.find((o) => o.value === operator).suggestionQuery;
            if (suggestionQuery) {
              query = suggestionQuery(field, value);
            } else {
              const terms = { field, include: `.*${value}.*`, order: { _count: "desc" }, size: 10 };
              query = { query: { match_all: {} }, aggs: { [field]: { terms } }, size: 0 };
            }
            // arr.push({ query: { bool: { must: [{ range: { created_at: { gte: start_at.toISOString() } } }] } }, size: 0 });
            const suggestions = await esQuery([{ index: collection, type: "_doc" }, query]);
            setSuggestions(suggestions.responses[0].aggregations[field].buckets.map((e) => e.key));
          }}
          onSuggestionsClearRequested={() => setSuggestions([])}
          getSuggestionValue={(suggestion) => suggestion}
          renderSuggestion={(suggestion) => <div>{suggestion}</div>}
          inputProps={{
            value,
            onChange: (event, { newValue }) => setValue(newValue),
            className: "react-es-rule-value form-control",
            style: { margin: 5 },
            autoComplete: "new-password",
          }}
        />
      );
    } else {
      input = (
        <Input
          className="react-es-rule-value"
          value={value}
          autoComplete="new-password"
          onChange={(e) => setValue(e.target.value)}
        />
      );
    }
  }
  return (
    <div className="react-es-rule" style={{ display: "flex" }}>
      {combinatorElement}
      <Select
        id={`react-es-rule-combinator-${field}-1`}
        minWidth={130}
        margin={"5px"}
        className="react-es-rule-field"
        value={fields.findIndex((e) => String(e.value) === String(field))}
        onChange={(e) => setField(fields[e.target.value].value)}
      >
        {fields.map((f, k) => {
          return (
            <option key={k} value={k}>
              {f.text}
            </option>
          );
        })}
      </Select>
      <Select
        id={`react-es-rule-combinator-${field}-2`}
        maxWidth={90}
        margin={"5px"}
        className="react-es-rule-operator"
        value={operator}
        onChange={(e) => setOperator(e.target.value)}
      >
        {operators.map((o) => {
          return (
            <option key={o.value} value={o.value}>
              {o.text}
            </option>
          );
        })}
      </Select>
      {input}
      <Button
        size="sm"
        colorScheme="blue"
        className="react-es-rule-add"
        onClick={props.onAdd}
        style={{ marginLeft: "10px", alignSelf: "center", fontSize: 16 }}
      >
        +
      </Button>
      {deleteButton}
    </div>
  );
}
