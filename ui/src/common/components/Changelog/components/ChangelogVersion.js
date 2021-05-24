import React from "react";
import FeatureItem from "./FeatureItem.js";

const createMarkup = (html) => {
  return { __html: html };
};

const ChangelogVersion = ({ version, date, about, fixes, features, improvements }) => {
  const slug = version.replace(/\./gi, "");
  return (
    <div id={`v${slug}`} className="changelog-item js-changelog-item">
      <header className="changelog-header">
        <h2 className="changelog-version">
          <a href={`#v${slug}`}>v.{version}</a>
        </h2>
        <h3 className="changelog-date">{date}</h3>
        <div className="changelog-about" dangerouslySetInnerHTML={createMarkup(about)} />
      </header>
      <div className="changelog-update-descriptions">
        {features &&
          features.length > 0 &&
          features.map((item, i) => <FeatureItem type={1} description={item} key={i} />)}
        {improvements &&
          improvements.length > 0 &&
          improvements.map((item, i) => <FeatureItem type={2} description={item} key={i} />)}
        {fixes && fixes.length > 0 && fixes.map((item, i) => <FeatureItem type={3} description={item} key={i} />)}
      </div>
      <div className="changelog-link" />
    </div>
  );
};

export default ChangelogVersion;
