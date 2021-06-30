import React, { useState, useEffect, useRef } from "react";
import Autosuggest from "react-autosuggest";
import { Input, Button, Select, Flex, InputGroup, InputRightElement } from "@chakra-ui/react";
import { Trash } from "../../../../../theme/components/icons";
import { CloseCircleLine } from "../../../../../theme/components/icons/CloseCircleLine";

const endpointNewFront = `${process.env.REACT_APP_BASE_URL}/api`;

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
  const timer = useRef(null);

  useEffect(() => {
    // debounce here to prevent lags
    clearTimeout(timer.current);

    timer.current = setTimeout(() => {
      props.onChange({ field, operator, value, combinator, index: props.index });
    }, 500);

    return () => clearTimeout(timer.current);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [field, operator, value, combinator]);

  const combinatorElement = props.index ? (
    <Select maxWidth={90} m={"5px"} value={combinator} onChange={(e) => setCombinator(e.target.value)}>
      {combinators.map((c) => (
        <option key={c.value} value={c.value}>
          {c.text}
        </option>
      ))}
    </Select>
  ) : null;

  const deleteButton = props.index ? (
    <Button
      variant={"secondary"}
      m={"5px"}
      p={0}
      height={8}
      width={8}
      minW={8}
      aria-label={"Supprimer la condition"}
      onClick={() => props.onDelete(props.index)}
      alignSelf="center"
    >
      <Trash color={"bluefrance"} boxSize={3} />
    </Button>
  ) : null;

  const addButton =
    props.index === props.length - 1 ? (
      <Button variant={"secondary"} height={8} fontSize={"zeta"} onClick={props.onAdd}>
        Ajouter une condition
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
            setSuggestions(suggestions?.responses?.[0]?.aggregations?.[field]?.buckets?.map((e) => e.key) ?? []);
          }}
          onSuggestionsClearRequested={() => setSuggestions([])}
          getSuggestionValue={(suggestion) => suggestion}
          renderSuggestion={(suggestion) => <div>{suggestion}</div>}
          renderInputComponent={(inputProps) => (
            <InputGroup>
              <Input m="5px" autoComplete="new-password" {...inputProps} />
              {inputProps.value && (
                <InputRightElement m={"5px"} children={<CloseCircleLine boxSize={4} onClick={() => setValue("")} />} />
              )}
            </InputGroup>
          )}
          inputProps={{
            value,
            onChange: (event, { newValue }) => setValue(newValue),
          }}
        />
      );
    } else {
      input = <Input value={value} m="5px" autoComplete="new-password" onChange={(e) => setValue(e.target.value)} />;
    }
  }
  return (
    <>
      <Flex mb={2}>
        {combinatorElement}
        <Select
          width={"auto"}
          margin={"5px"}
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
        <Select width={"auto"} margin={"5px"} value={operator} onChange={(e) => setOperator(e.target.value)}>
          {operators.map((o) => {
            return (
              <option key={o.value} value={o.value}>
                {o.text}
              </option>
            );
          })}
        </Select>
        {input}

        {deleteButton}
      </Flex>
      {addButton}
    </>
  );
}
