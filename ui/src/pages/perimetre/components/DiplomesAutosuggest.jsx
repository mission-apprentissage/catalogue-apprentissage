import React, { useState } from "react";
import Autosuggest from "react-autosuggest";
import { useQuery } from "react-query";
import { getNiveaux } from "../../../common/api/perimetre";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/react";
import { CloseCircleLine } from "../../../theme/components/icons";

export const DiplomesAutosuggest = ({ onSuggestionSelected }) => {
  const { data: niveauxData } = useQuery("niveaux", () => getNiveaux(), {
    refetchOnWindowFocus: false,
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  const diplomes = niveauxData.reduce(
    (acc, { niveau, diplomes }) => [...acc, ...diplomes.map((diplome) => ({ ...diplome, niveau: niveau.value }))],
    []
  );

  const [suggestions, setSuggestions] = useState([]);
  const [chosenValue, setChosenValue] = useState("");

  const getSuggestions = (value) => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0
      ? []
      : diplomes.filter((diplome) => diplome.value.toLowerCase().slice(0, inputLength) === inputValue);
  };

  const getSuggestionValue = (suggestion) => suggestion.value;

  const renderSuggestion = (suggestion) => <div>{suggestion.value}</div>;

  const onSuggestionsFetchRequested = ({ value }) => setSuggestions(getSuggestions(value));

  const onSuggestionsClearRequested = () => setSuggestions([]);

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

  return (
    <Autosuggest
      suggestions={suggestions}
      onSuggestionsFetchRequested={onSuggestionsFetchRequested}
      onSuggestionsClearRequested={onSuggestionsClearRequested}
      getSuggestionValue={getSuggestionValue}
      renderSuggestion={renderSuggestion}
      inputProps={inputProps}
      onSuggestionSelected={onSelect}
      renderInputComponent={(inputProps) => (
        <InputGroup flex={"1 1 auto"} w={"auto"}>
          <Input m="5px" autoComplete="new-password" {...inputProps} />
          {inputProps.value && (
            <InputRightElement
              m={"5px"}
              children={<CloseCircleLine boxSize={4} onClick={() => setChosenValue("")} />}
            />
          )}
        </InputGroup>
      )}
    />
  );
};
