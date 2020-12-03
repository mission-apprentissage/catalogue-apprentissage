import React from "react";
import { ReactiveBase, ReactiveList } from "@appbaseio/reactivesearch";
import { Layout, Accordion } from "./components";
import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";

const useStyle = makeStyles({
  root: {
    width: "100%",
  },
});

function PageReconciliation() {
  const classes = useStyle();
  const elasticEndpoint = "http://localhost/api/es/";
  const serverEndpoint = "http://localhost/api";
  const [coverage, setCoverage] = React.useState();

  React.useEffect(() => {
    (async function getCoverage() {
      const type = "3";
      const response = await fetch(`${serverEndpoint}/coverage?type=${type}`);
      const data = await response.json();
      setCoverage(data);
    })();
  }, []);

  if (!coverage) {
    return <div>Chargement des données...</div>;
  }

  console.log(coverage.filter((x) => x.matching_mna_etablissement.length > 0).length, coverage.length);

  return (
    <Layout>
      {coverage.map((item) => {
        return (
          <Box className={classes.root} p={2}>
            <Accordion data={item} />
          </Box>
        );
      })}
    </Layout>
  );

  // return (
  //   <ReactiveBase url={elasticEndpoint} app="psformations">
  //     <ReactiveList
  //       componentId="result"
  //       title="Results"
  //       dataField="_id"
  //       loader="Chargement des résultats.."
  //       size={8}
  //       pagination={true}
  //       showEndPage={true}
  //       // renderPagination={(paginationProp) => {
  //       //   return <Pagination {...paginationProp} />;
  //       // }}
  //       showResultStats={true}
  //       sortBy="asc"
  //       defaultQuery={() => {
  //         return {
  //           //_source: exportTrainingColumns.map(def => def.accessor),
  //           query: {
  //             match: {},
  //           },
  //         };
  //       }}
  //       renderItem={(data) => {
  //         console.log(data);
  //       }}
  //       // react={{ and: FILTERS }}
  //     />
  //   </ReactiveBase>
  // );
}

export default PageReconciliation;
