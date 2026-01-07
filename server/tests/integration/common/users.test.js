const assert = require("assert");
const integrationTests = require("../../utils/integrationTests");
const users = require("../../../src/common/components/users");
const { setupBeforeAll } = require("../../helpers/setup");

integrationTests(__filename, () => {
  before(async () => {
    setupBeforeAll();
  });

  it("Permet de créer un utilisateur", async () => {
    const { createUser, getUser } = await users();

    const created = await createUser("user", "password");
    assert.strictEqual(created.username, "user");
    assert.strictEqual(created.isAdmin, false);
    assert.strictEqual(created.password.startsWith("$6$rounds=1001"), true);

    const found = await getUser("user");
    assert.strictEqual(found.username, "user");
    assert.strictEqual(found.isAdmin, false);
    assert.strictEqual(found.password.startsWith("$6$rounds=1001"), true);
  });

  it("Permet de créer un utilisateur avec les droits d'admin", async () => {
    const { createUser, getUser } = await users();

    const user = await createUser("userAdmin", "password", { permissions: { isAdmin: true } });
    const found = await getUser("userAdmin");

    assert.strictEqual(user.isAdmin, true);
    assert.strictEqual(found.isAdmin, true);
  });

  it("Permet de supprimer un utilisateur", async () => {
    const { createUser, removeUser, getUser } = await users();

    await createUser("user_to_delete", "password", { permissions: { isAdmin: true } });
    await removeUser("user_to_delete");

    const found = await getUser("user_to_delete");
    assert.strictEqual(found, null);
  });

  it("Vérifie que le mot de passe est valide", async () => {
    const { createUser, authenticate } = await users();

    await createUser("user", "password");
    const user = await authenticate("user", "password");

    assert.strictEqual(user.username, "user");
  });

  it("Vérifie que le mot de passe est invalide", async () => {
    const { createUser, authenticate } = await users();

    await createUser("user", "password");
    const user = await authenticate("user", "INVALID");

    assert.strictEqual(user, null);
  });

  it("Vérifie qu'on peut changer le mot de passe d'un utilisateur", async () => {
    const { createUser, authenticate, changePassword } = await users();

    await createUser("user", "password");
    await changePassword("user", "newPassword");
    const user = await authenticate("user", "newPassword");

    assert.strictEqual(user.username, "user");
  });
});
