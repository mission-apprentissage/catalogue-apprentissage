import React from "react";

const Context = React.createContext({
  mapping: Array,
  updateMapping: () => {},
});

class ContextProvider extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mapping: {},
      updateMapping: this.updateMapping,
    };
  }

  updateMapping = (values) => {
    const { formationId, type, etablissementId } = values;
    const copy = { ...this.state.mapping };

    if (copy[formationId]) {
      let index = copy[formationId].findIndex((x) => x.id === etablissementId);
      if (index !== -1) {
        copy[formationId][index].type = type;
      } else {
        copy[formationId].push({ type: type, id: etablissementId });
      }
    } else {
      copy[formationId] = [
        {
          type: type,
          id: etablissementId,
        },
      ];
    }
    this.setState({ mapping: { ...this.state.mapping, ...copy } });
  };

  render() {
    return <Context.Provider value={this.state}>{this.props.children}</Context.Provider>;
  }
}

export { Context };
export default ContextProvider;
