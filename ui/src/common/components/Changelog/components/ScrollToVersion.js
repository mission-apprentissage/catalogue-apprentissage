import React from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons";

import ScrollToVersionItem from "./ScrollToVersionItem.js";

const ScrollToVersion = ({ versions }) => (
  <div>
    <div className="changelog-scroll-to">
      Aller à <FontAwesomeIcon icon={faAngleDown} />
      <ul className="changelog-scroll-to-list">
        {versions &&
          versions.length > 0 &&
          versions.map(({ version, slug }, i) => <ScrollToVersionItem version={version} slug={slug} key={i} />)}
      </ul>
    </div>
  </div>
);

ScrollToVersion.propTypes = {
  version: PropTypes.array,
};

export default ScrollToVersion;
