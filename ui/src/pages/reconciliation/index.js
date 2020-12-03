import React from "react";
import { ReactiveBase, ReactiveList } from "@appbaseio/reactivesearch";
import { Layout, Accordion, Loading, Modal } from "./components";
import { Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ContextProvider, { Context } from "./context";

const useStyle = makeStyles({
  root: {
    width: "100%",
  },
  loader: {
    root: {
      height: "100vh",
    },
  },
});

const elasticEndpoint = "http://localhost/api/es/";
const serverEndpoint = "http://localhost/api";

function PageReconciliation() {
  const classes = useStyle();
  const [coverage, setCoverage] = React.useState();
  const { popup } = React.useContext(Context);
  console.log("popup", popup);

  React.useEffect(() => {
    (async function getCoverage() {
      const type = "3";
      const response = await fetch(`${serverEndpoint}/coverage?type=${type}`);
      const data = await response.json();
      setCoverage(data);
    })();
  }, []);

  if (!coverage) {
    return (
      <Layout>
        <Loading />
      </Layout>
    );
  }

  return (
    <ContextProvider>
      <Layout>
        <Box className={classes.root} p={2}>
          <Accordion data={coverage[0]} />
        </Box>
        {popup && <Modal />}
      </Layout>
    </ContextProvider>
  );

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
