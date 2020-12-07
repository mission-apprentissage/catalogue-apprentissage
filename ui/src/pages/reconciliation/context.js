import React from "react";

const Context = React.createContext({
  popup: Boolean,
  mapping: Array,
  handlePopup: () => {},
  updateMapping: () => {},
});

class ContextProvider extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      popup: true,
      mapping: [],
      handlePopup: this.handlePopup,
      updateMapping: this.updateMapping,
    };
  }

  handlePopup = () => this.setState({ popup: !this.state.popup });

  updateMapping = (values) => {
    const copy = [...this.state.mapping];

    copy.push(values);

    this.setState({ mapping: copy });
  };

  handleSubmit = () => {
    /**
     * check if state has formation and choice
     * if yes
     *    Call API
     *      On success, display toaster and let the user know he can move on somehow
     * else
     *    set flag to true and display toaster for 2 secondes
     */
  };

  render() {
    return <Context.Provider value={this.state}>{this.props.children}</Context.Provider>;
  }
}

export { Context };
export default ContextProvider;
