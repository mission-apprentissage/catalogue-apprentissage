import React, { useState, useEffect, useRef, useCallback } from "react";
import Autosuggest from "react-autosuggest";
import { Input, Button, Select, Flex, InputGroup, InputRightElement } from "@chakra-ui/react";
import { Trash, CloseCircleLine } from "../../../../../theme/components/icons";

const CATALOGUE_API = `${process.env.REACT_APP_BASE_URL}/api`;

const esQuery = (queries, options) => {
  let query = "";
  for (let i = 0; i < queries.length; i++) {
    query += `${JSON.stringify(queries[i])}\n`;
  }

  return fetch(`${CATALOGUE_API}/search/_msearch`, {
    mode: "cors",
    method: "POST",
    redirect: "follow",

    referrer: "no-referrer",
    headers: { "Content-Type": "application/x-ndjson" },
    body: query,
    ...options,
  })
    .then((r) => {
      if (!options.signal?.aborted) {
        return r.json();
      }
    })
    .catch((e) => {
      if (!options.signal?.aborted) {
        console.error(e);
      }
    });
};

const Combinator = ({ combinator, setCombinator, combinators, isDisabled }) => {
  return (
    <Select
      isDisabled={isDisabled}
      maxWidth={90}
      m={"5px"}
      maxW={"7%"}
      value={combinator}
      onChange={(e) => setCombinator(e.target.value)}
    >
      {combinators.map((c) => (
        <option key={c.value} value={c.value}>
          {c.text}
        </option>
      ))}
    </Select>
  );
};

const DeleteButton = ({ deleteFn, isDisabled }) => (
  <Button
    isDisabled={isDisabled}
    variant={"secondary"}
    m={"5px"}
    p={0}
    height={8}
    width={8}
    minW={8}
    aria-label={"Supprimer la condition"}
    onClick={deleteFn}
    alignSelf="center"
  >
    <Trash color={"bluefrance"} boxSize={3} />
  </Button>
);

const AddButton = ({ onAdd, isDisabled }) => (
  <Button isDisabled={isDisabled} ml={"5px"} variant={"secondary"} height={8} fontSize={"zeta"} onClick={onAdd}>
    Ajouter une condition
  </Button>
);

const RuleInput = ({ suggestionQuery, field, collection, value, setValue, noSuggest, isDisabled }) => {
  const [suggestions, setSuggestions] = useState([]);

  const onSuggestionClear = useCallback(() => {
    setSuggestions([]);
  }, []);

  const onSuggestionFetch = useCallback(
    async ({ value }) => {
      const abortController = new AbortController();
      const run = async () => {
        let query;
        if (suggestionQuery) {
          query = suggestionQuery(field, value);
        } else {
          const terms = { field, include: `.*${value}.*`, order: { _count: "desc" }, size: 10 };
          query = { query: { match_all: {} }, aggs: { [field]: { terms } }, size: 0 };
        }
        // arr.push({ query: { bool: { must: [{ range: { created_at: { gte: start_at.toISOString() } } }] } }, size: 0 });
        const suggestions = await esQuery([{ index: collection, type: "_doc" }, query], {
          signal: abortController.signal,
        });
        setSuggestions(suggestions?.responses?.[0]?.aggregations?.[field]?.buckets?.map((e) => e.key) ?? []);
      };

      await run();
      return () => {
        abortController.abort();
        onSuggestionClear();
      };
    },
    [collection, field, suggestionQuery, onSuggestionClear]
  );

  // Autocomplete zone.
  if (!noSuggest && !Array.isArray(field)) {
    return (
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={onSuggestionFetch}
        onSuggestionsClearRequested={onSuggestionClear}
        getSuggestionValue={(suggestion) => suggestion}
        renderSuggestion={(suggestion) => <div>{suggestion}</div>}
        renderInputComponent={({ key, ...inputProps }) => (
          <InputGroup key={key} flex={"1 1 auto"} w={"auto"}>
            <Input m="5px" autoComplete="none" {...inputProps} />
            {inputProps.value && (
              <InputRightElement m={"5px"} children={<CloseCircleLine boxSize={4} onClick={() => setValue("")} />} />
            )}
          </InputGroup>
        )}
        inputProps={{
          value,
          onChange: (event, { newValue }) => setValue(newValue),
          isDisabled,
        }}
      />
    );
  }
  return (
    <InputGroup flex={"1 1 auto"} w={"auto"}>
      <Input
        isDisabled={isDisabled}
        value={value}
        m="5px"
        autoComplete="none"
        placeholder="Valeur"
        onChange={(e) => setValue(e.target.value)}
      />
      {value && <InputRightElement m={"5px"} children={<CloseCircleLine boxSize={4} onClick={() => setValue("")} />} />}
    </InputGroup>
  );
};

export default function Rule({
  fields,
  operators,
  combinators,
  collection,
  noSuggest,
  isDisabled,
  onChange,
  length,
  index,
  showComment,
  ...props
}) {
  // const [{ url, headers }] = useSharedContext();
  const [combinator, setCombinator] = useState(props.combinator);
  const [field, setField] = useState(props.field);
  const [operator, setOperator] = useState(props.operator);
  const [value, setValue] = useState(props.value);
  const [comment, setComment] = useState(props.comment);
  const timer = useRef(null);

  useEffect(() => {
    // debounce here to prevent lags
    clearTimeout(timer.current);

    timer.current = setTimeout(() => {
      onChange({ field, operator, value, combinator, comment, index: index });
    }, 500);

    return () => clearTimeout(timer.current);
  }, [field, operator, value, combinator, comment, index, onChange]);

  const currentOperator = operators.find((o) => o.value === operator);

  return (
    <>
      <Flex mb={2}>
        {!!index && (
          <Combinator
            isDisabled={isDisabled}
            combinator={combinator}
            combinators={combinators}
            setCombinator={setCombinator}
          />
        )}
        <Select
          flex={"0 1 auto"}
          isDisabled={isDisabled}
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
        <Select
          flex={"0 1 auto"}
          isDisabled={isDisabled}
          width={"auto"}
          margin={"5px"}
          maxW={"15%"}
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

        {currentOperator?.useInput && (
          <RuleInput
            isDisabled={isDisabled}
            collection={collection}
            field={field}
            value={value}
            setValue={setValue}
            suggestionQuery={currentOperator?.suggestionQuery}
            noSuggest={noSuggest}
          />
        )}

        {showComment && (
          <InputGroup flex={"1 1 auto"} w={"auto"}>
            <Input
              isDisabled={isDisabled}
              value={comment}
              m="5px"
              autoComplete="none"
              placeholder="Commentaire"
              onChange={(e) => setComment(e.target.value)}
            />
            {comment && (
              <InputRightElement m={"5px"} children={<CloseCircleLine boxSize={4} onClick={() => setComment("")} />} />
            )}
          </InputGroup>
        )}

        {!!index && <DeleteButton deleteFn={() => props.onDelete(index)} isDisabled={isDisabled} />}
      </Flex>
      {index === length - 1 && <AddButton onAdd={props.onAdd} isDisabled={isDisabled} />}
    </>
  );
}
