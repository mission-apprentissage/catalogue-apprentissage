import React from "react";
import { SingleList } from "@appbaseio/reactivesearch";
import { CATALOGUE_GENERAL_LABEL, CATALOGUE_NON_ELIGIBLE_LABEL } from "../../../../constants/catalogueLabels";

const HardFilters = React.memo(({ filters, context, isBaseFormations, isBaseReconciliationPs }) => {
  const [statutReconciliation, setStatutReconciliation] = React.useState("AUTOMATIQUE");
  React.useEffect(() => {
    switch (context) {
      case "reconciliation_ps_forts":
        setStatutReconciliation("AUTOMATIQUE");
        break;
      case "reconciliation_ps_faibles":
        setStatutReconciliation("A_VERIFIER");
        break;
      case "reconciliation_ps_rejetes":
        setStatutReconciliation("REJETE");
        break;
      case "reconciliation_ps_inconnus":
        setStatutReconciliation("INCONNU");
        break;
      case "reconciliation_ps_valides":
        setStatutReconciliation("VALIDE");
        break;
      default:
        break;
    }
  }, [context]);
  return (
    <>
      {!isBaseReconciliationPs && (
        <SingleList
          componentId="published"
          dataField="published"
          react={{ and: filters }}
          value={"true"}
          defaultValue={"true"}
          showFilter={false}
          showSearch={false}
          showCount={false}
          render={() => {
            return <div />;
          }}
        />
      )}
      {isBaseFormations && (
        <SingleList
          componentId="catalogue_published"
          dataField="etablissement_reference_catalogue_published"
          react={{ and: filters.filter((e) => e !== "catalogue_published") }}
          value={context === "catalogue_general" ? CATALOGUE_GENERAL_LABEL : CATALOGUE_NON_ELIGIBLE_LABEL}
          defaultValue={context === "catalogue_general" ? CATALOGUE_GENERAL_LABEL : CATALOGUE_NON_ELIGIBLE_LABEL}
          transformData={(data) => {
            return data.map((d) => ({
              ...d,
              key: d.key === 1 ? CATALOGUE_GENERAL_LABEL : CATALOGUE_NON_ELIGIBLE_LABEL,
            }));
          }}
          customQuery={(data) => {
            return !data || data.length === 0
              ? {}
              : {
                  query: {
                    bool: {
                      must: [
                        { match: { etablissement_reference_catalogue_published: data === CATALOGUE_GENERAL_LABEL } },
                      ],
                    },
                  },
                };
          }}
          showFilter={false}
          showSearch={false}
          showCount={true}
          render={() => {
            return <div />;
          }}
        />
      )}
      {isBaseReconciliationPs && statutReconciliation !== "REJETE" && (
        <SingleList
          componentId="statut_reconciliation"
          dataField="statut_reconciliation.keyword"
          react={{ and: filters }}
          value={statutReconciliation}
          defaultValue={statutReconciliation}
          showFilter={false}
          showSearch={false}
          showCount={false}
          render={() => {
            return <div />;
          }}
        />
      )}
      {isBaseReconciliationPs && statutReconciliation === "REJETE" && (
        <SingleList
          componentId="statut_reconciliation"
          dataField="statut_reconciliation.keyword"
          react={{ and: filters }}
          showFilter={false}
          showSearch={false}
          showCount={false}
          customQuery={(data) => {
            return {
              query: {
                bool: {
                  should: [{ match: { statut_reconciliation: "REJETE" } }],
                },
              },
            };
          }}
          render={() => {
            return <div />;
          }}
        />
      )}
    </>
  );
});
export default HardFilters;
