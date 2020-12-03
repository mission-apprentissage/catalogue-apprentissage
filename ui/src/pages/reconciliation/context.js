import React from "react";

const Context = React.createContext({
  popup: Boolean,
  handlePopup: () => {},
});

class ContextProvider extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      popup: true,
      handlePopup: this.handlePopup,
    };
  }

  handlePopup = () => this.setState({ popup: !this.state.popup });

  render() {
    return <Context.Provider value={this.state}>{this.props.children}</Context.Provider>;
  }
}

export { Context };
export default ContextProvider;
