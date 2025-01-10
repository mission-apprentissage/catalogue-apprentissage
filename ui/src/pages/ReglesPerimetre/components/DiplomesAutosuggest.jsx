import React, { useCallback, useState } from "react";
import Autosuggest from "react-autosuggest";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/react";
import { useNiveaux } from "../../../common/api/perimetre";
import { CloseCircleLine } from "../../../theme/components/icons";

export const DiplomesAutosuggest = ({ plateforme, onSuggestionSelected }) => {
  const { data: niveauxData } = useNiveaux({ plateforme });

  const diplomes = niveauxData?.reduce(
    (acc, { niveau, diplomes }) => [...acc, ...diplomes.map((diplome) => ({ ...diplome, niveau: niveau.value }))],
    []
  );

  const [suggestions, setSuggestions] = useState([]);
  const [chosenValue, setChosenValue] = useState("");

  const getSuggestions = useCallback(
    (value) => {
      const inputValue = value.trim().toLowerCase();
      const inputLength = inputValue.length;

      return inputLength === 0
        ? []
        : diplomes.filter((diplome) => diplome.value.toLowerCase().slice(0, inputLength) === inputValue);
    },
    [diplomes]
  );

  const getSuggestionValue = (suggestion) => suggestion.value;

  const renderSuggestion = (suggestion) => <div>{suggestion.value}</div>;

  const onSuggestionsFetchRequested = useCallback(
    ({ value }) => {
      setSuggestions(getSuggestions(value));
    },
    [getSuggestions]
  );

  const onSuggestionsClearRequested = useCallback(() => {
    setSuggestions([]);
  }, []);

  const inputProps = {
    placeholder: "Recherchez un diplôme",
    value: chosenValue,
    onChange: (event, { newValue }) => {
      setChosenValue(newValue);
    },
  };

  const onSelect = (event, { suggestion }) => {
    onSuggestionSelected({ suggestion });
  };

  const cancel = useCallback(() => {
    setChosenValue("");
  }, []);

  return (
    <Autosuggest
      suggestions={suggestions}
      onSuggestionsFetchRequested={onSuggestionsFetchRequested}
      onSuggestionsClearRequested={onSuggestionsClearRequested}
      getSuggestionValue={getSuggestionValue}
      renderSuggestion={renderSuggestion}
      inputProps={inputProps}
      onSuggestionSelected={onSelect}
      renderInputComponent={({ key, ...inputProps }) => (
        <InputGroup key={key} flex={"1 1 auto"} w={"auto"}>
          <Input m="5px" autoComplete="none" {...inputProps} />
          {inputProps.value && (
            <InputRightElement
              m={"5px"}
              children={<CloseCircleLine data-testid={"clear-btn"} boxSize={4} onClick={cancel} />}
            />
          )}
        </InputGroup>
      )}
    />
  );
};
