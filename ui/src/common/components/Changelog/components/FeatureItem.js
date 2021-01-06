import React from "react";
import PropTypes from "prop-types";

const FeatureItem = ({ type, description }) => {
  let itemClass = "";
  let label = "";
  switch (type) {
    case 2:
      itemClass = "improvement";
      label = "amélioration";
      break;
    case 3:
      itemClass = "bug-fix";
      label = "correctif";
      break;
    default:
    case 1:
      itemClass = "feature";
      label = "fonctionnalité";
      break;
  }

  return (
    <p
      className={`changelog-update-description changelog-${itemClass} js-changelog-update-description`}
      data-instafilta-category={itemClass}
      data-instafilta-hide="false"
    >
      <span className="changelog-type">{label}</span>
      {description}
    </p>
  );
};

FeatureItem.propTypes = {
  type: PropTypes.number,
  description: PropTypes.string,
};

export default FeatureItem;
