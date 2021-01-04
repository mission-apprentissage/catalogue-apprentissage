import React, { useEffect } from "react";
import { withRouter } from "react-router";
//import { useSelector } from "react-redux";

const ScrollToTop = () => {
  // const { location, action } = useSelector(state => state.router);
  useEffect(() => {
    // if (action === "POP") {
    //   return;
    // }
    // // In all other cases, check fragment/scroll to top
    // let hash = location.hash;
    // if (hash) {
    //   let element = document.querySelector(hash);
    //   if (element) {
    //     element.scrollIntoView({ block: "start", behavior: "smooth" });
    //   }
    // } else {
    window.scrollTo(0, 0);
    //}
  });
  return <div />;
};

export default withRouter(ScrollToTop);
