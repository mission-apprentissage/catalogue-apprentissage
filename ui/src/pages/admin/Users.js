import React from "react";
import { Page, Grid, Header } from "tabler-react";

export default () => {
  return (
    <Page>
      <Page.Main>
        <Page.Content title="Utilisateurs">
          <>
            <Header.H5>List des utilisateurs</Header.H5>
            <Grid.Row cards={true}>
              <Grid.Col sm={4} lg={2}>
                Yo
              </Grid.Col>
            </Grid.Row>
          </>
        </Page.Content>
      </Page.Main>
    </Page>
  );
};
