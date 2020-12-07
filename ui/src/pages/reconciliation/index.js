import React from "react";
// eslint-disable-next-line
import { ReactiveBase, ReactiveList } from "@appbaseio/reactivesearch";
import { Layout, Accordion, Loading, Modal } from "./components";
import { Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ContextProvider, { Context } from "./context";
import { _get } from "../../common/httpClient";

const useStyle = makeStyles({
  root: {
    width: "100%",
  },
});

// eslint-disable-next-line
const elasticEndpoint = "http://localhost/api/es/";
const serverEndpoint = "http://localhost/api";

function PageReconciliation() {
  const classes = useStyle();
  const [coverage, setCoverage] = React.useState();
  const { popup } = React.useContext(Context);

  React.useEffect(() => {
    (async function getCoverage() {
      const type = "3";
      const response = await _get(`${serverEndpoint}/coverage?type=${type}`);
      setCoverage(response);
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

  // return (
  //   <ContextProvider>
  //     <Layout>
  //       {coverage.map((item, index) => {
  //         return (
  //           <Box key={index} className={classes.root} p={2}>
  //             <Accordion data={item} />
  //           </Box>
  //         );
  //       })}
  //       {popup && <Modal />}
  //     </Layout>
  //   </ContextProvider>
  // );

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
