import React from "react";

const ScrollVersionItem = ({ version, slug }) => (
  <div>
    <li className="changelog-scroll-to-list-item">
      <a href={`#v${slug}`} className="js-scroll-to" data-target={`#v${slug}`}>
        {`v${version}`}
      </a>
    </li>
  </div>
);

export default ScrollVersionItem;
