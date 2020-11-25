import React, { useEffect, useState } from "react";
import { Page, Grid, Header, Card, Button, Form as TablerForm } from "tabler-react";
import { _get, _delete, _post, _put } from "../../common/httpClient";
import { useFormik } from "formik";

const UserLine = ({ user }) => {
  const { values, handleSubmit, handleChange } = useFormik({
    initialValues: {
      accessAllCheckbox: user?.isAdmin ? ["on"] : [],
      accessAcademieList: user ? user.academie.split(",") : "",
      newUsername: user?.username || "",
      newEmail: user?.email || "",
      newTmpPassword: "1MotDePassTemporaire!",
    },
    onSubmit: (
      { apiKey, accessAllCheckbox, accessAcademieList, newUsername, newEmail, newTmpPassword },
      { setSubmitting }
    ) => {
      return new Promise(async (resolve, reject) => {
        const accessAcademie = accessAcademieList.join(",");
        const accessAll = accessAllCheckbox.includes("on");

        try {
          if (user) {
            const body = {
              username: newUsername,
              options: {
                academie: accessAcademie,
                email: newEmail,
                permissions: {
                  isAdmin: accessAll,
                },
              },
            };
            await _put(`/api/admin/user/${user.username}`, body);
            document.location.reload(true);
          } else {
            const body = {
              username: newUsername,
              password: newTmpPassword,
              options: {
                academie: accessAcademie,
                email: newEmail,
                permissions: {
                  isAdmin: accessAll,
                },
              },
            };
            await _post(`/api/admin/user/`, body);
            document.location.reload(true);
          }
        } catch (e) {
          console.log(e);
        }

        setSubmitting(false);
        resolve("onSubmitHandler complete");
      });
    },
  });

  const onDeleteClicked = async () => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm("Delete user !?") && user.isAdmin) {
      await _delete(`/api/admin/user/${user.username}`);
      document.location.reload(true);
    }
  };

  return (
    <form className="userLine" onSubmit={handleSubmit}>
      <TablerForm.Group label="Username">
        <TablerForm.Input
          type="text"
          name="newUsername"
          id="newUsername"
          value={values.newUsername}
          onChange={handleChange}
        />
      </TablerForm.Group>
      <TablerForm.Group label="Email">
        <TablerForm.Input type="email" name="newEmail" id="newEmail" value={values.newEmail} onChange={handleChange} />
      </TablerForm.Group>

      {!user && (
        <TablerForm.Group label="Mot de passe temporaire">
          <TablerForm.Input
            type="text"
            name="newTmpPassword"
            id="newTmpPassword"
            value={values.newTmpPassword}
            onChange={handleChange}
          />
        </TablerForm.Group>
      )}

      <TablerForm.Group>
        <label className="custom-control-inline">
          <input
            type="checkbox"
            name="accessAllCheckbox"
            id="accessAllCheckbox"
            className="custom-control custom-checkbox custom-control-inline"
            onChange={handleChange}
            checked={values.accessAllCheckbox.length > 0}
          />
          <span>Admin</span>
        </label>
      </TablerForm.Group>

      <TablerForm.Group label="Académies">
        <TablerForm.Group>
          <label className="custom-control-inline">
            <input
              type="checkbox"
              name="accessAcademieList"
              id="accessAcademieList"
              className="custom-control custom-checkbox custom-control-inline"
              onChange={handleChange}
              value={"-1"}
              checked={values.accessAcademieList.includes("-1")}
            />
            <span>Toutes</span>
          </label>

          {[
            "01",
            "02",
            "03",
            "04",
            "06",
            "07",
            "08",
            "09",
            "10",
            "11",
            "12",
            "13",
            "14",
            "15",
            "16",
            "17",
            "18",
            "19",
            "20",
            "22",
            "23",
            "24",
            "25",
            "27",
            "28",
            "31",
            "32",
            "33",
            "43",
            "70",
          ].map((num, i) => {
            return (
              <label key={i} className="custom-control-inline">
                <input
                  type="checkbox"
                  name="accessAcademieList"
                  id="accessAcademieList"
                  className="custom-control custom-checkbox custom-control-inline"
                  onChange={handleChange}
                  value={num}
                  checked={values.accessAcademieList.includes(num)}
                />
                <span>{num}</span>
              </label>
            );
          })}
        </TablerForm.Group>
      </TablerForm.Group>

      {user && (
        <>
          <Button type="submit" color="primary" className="mr-5">
            Save
          </Button>
          <Button color="danger" onClick={onDeleteClicked}>
            Delete user
          </Button>
        </>
      )}
      {!user && (
        <Button type="submit" color="primary" className="mt-3">
          Créer l'utilisateur
        </Button>
      )}
    </form>
  );
};

export default () => {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    async function run() {
      const usersList = await _get(`/api/admin/users/`);
      setUsers(usersList);
    }
    run();
  }, []);

  return (
    <Page>
      <Page.Main>
        <Page.Content title="Utilisateurs">
          <>
            <Header.H5>List des utilisateurs</Header.H5>
            <Grid.Row cards={true}>
              <Grid.Col sm={12}>
                {users.map((userAttr, i) => {
                  return (
                    <Card title={userAttr.username} isCollapsible isCollapsed key={i}>
                      <Card.Body>
                        <UserLine user={userAttr} />
                      </Card.Body>
                    </Card>
                  );
                })}

                <Card title="CREER UN UTILISATEUR" isCollapsible isCollapsed>
                  <Card.Body>
                    <UserLine user={null} />
                  </Card.Body>
                </Card>
              </Grid.Col>
            </Grid.Row>
          </>
        </Page.Content>
      </Page.Main>
    </Page>
  );
};
