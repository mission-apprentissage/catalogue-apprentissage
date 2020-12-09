import React from "react";

const Context = React.createContext({
  popup: Boolean,
  mapping: Array,
  coverageData: Array,
  currentFormation: String,
  handlePopup: () => {},
  handlePopupSubmit: () => {},
  updateMapping: () => {},
  setCoverageData: () => {},
});

class ContextProvider extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      popup: true,
      coverageData: [],
      mapping: [],
      currentFormation: "",
      handlePopup: this.handlePopup,
      handlePopupSubmit: this.handlePopupSubmit,
      updateMapping: this.updateMapping,
      setCoverageData: this.setCoverageData,
    };
  }

  setCoverageData = (values) => this.setState({ coverageData: values });

  handlePopup = (id) => this.setState({ popup: !this.state.popup, currentFormation: id });

  handlePopupSubmit = (values) => {
    console.log("values context", values);
    const { etablissement, type } = values;
    const formation = this.coverageData.find((x) => (x._id = this.currentFormation));
    formation.matching_mna_etablissement.push(etablissement);
    this.updateMapping({ id: etablissement._id, type: type });
  };

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
