import React from "react";
import ScrollToVersionItem from "./ScrollToVersionItem.js";
import { ArrowDownLine } from "../../../../theme/components/icons";

const ScrollToVersion = ({ versions }) => (
  <div>
    <div className="changelog-scroll-to">
      Aller à <ArrowDownLine />
      <ul className="changelog-scroll-to-list">
        {versions &&
          versions.length > 0 &&
          versions.map(({ version, slug }, i) => <ScrollToVersionItem version={version} slug={slug} key={i} />)}
      </ul>
    </div>
  </div>
);

export default ScrollToVersion;
