import React from "react";
import PropTypes from "prop-types";

import ScrollToVersion from "./ScrollToVersion.js";

const ChangelogFilter = ({ versions, onChange }) => (
  <div className="ChangelogFilter">
    <div className="changelog-filters">
      <input type="text" className="changelog-input js-changelog-input" />
      <input
        id="changelog-filter-feature"
        className="changelog-checkbox"
        type="checkbox"
        value="feature"
        onChange={onChange}
      />
      <label className="changelog-checkbox-label changelog-state-feature" htmlFor="changelog-filter-feature">
        fonctionnalités
      </label>
      <input
        id="changelog-filter-improvement"
        className="changelog-checkbox"
        type="checkbox"
        value="improvement"
        onChange={onChange}
      />
      <label className="changelog-checkbox-label changelog-state-improvement" htmlFor="changelog-filter-improvement">
        améliorations
      </label>
      <input
        id="changelog-filter-bug-fix"
        className="changelog-checkbox"
        type="checkbox"
        value="bugFix"
        onChange={onChange}
      />
      <label className="changelog-checkbox-label changelog-state-bugFix" htmlFor="changelog-filter-bug-fix">
        correctifs
      </label>
      <ScrollToVersion versions={versions} />
    </div>
  </div>
);

ChangelogFilter.propTypes = {
  verions: PropTypes.array,
  onChange: PropTypes.func,
};

export default ChangelogFilter;
