import React from "react";
import Changelog from "../../common/components/Changelog/Changelog";

import content from "../../CHANGELOG";

import "./journal.css";
import Layout from "../layout/Layout";

const Journal = () => {
  return (
    <Layout>
      <div className="page journal">
        <h1 className="mt-3 mb-3">Journal des modifications</h1>
        <Changelog content={content} />
      </div>
    </Layout>
  );
};

export default Journal;
