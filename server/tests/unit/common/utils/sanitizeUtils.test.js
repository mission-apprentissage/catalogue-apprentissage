const assert = require("assert");
const { sanitize } = require("../../../../src/common/utils/sanitizeUtils");

describe(__filename, () => {
  it("checks that query is sanitized", () => {
    let sanitized = sanitize({ $where: "hello" });
    assert.deepStrictEqual(sanitized, { _where: "hello" });

    sanitized = sanitize({ query: { $where: "hello" } });
    assert.deepStrictEqual(sanitized, { query: { _where: "hello" } });

    sanitized = sanitize({ "field.nested": { $in: ["hello", "test"] } });
    assert.deepStrictEqual(sanitized, { "field.nested": { _in: ["hello", "test"] } });
  });

  it("checks that query is sanitized & allow some mongo operators", () => {
    let sanitized = sanitize({ $where: "hello", name: { $in: ["bob", "alice"] } }, { allowSafeOperators: true });
    assert.deepStrictEqual(sanitized, { _where: "hello", name: { $in: ["bob", "alice"] } });
  });
});
