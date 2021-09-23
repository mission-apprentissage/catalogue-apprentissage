const assert = require("assert");
const { distanceBetweenCoordinates } = require("../../../../src/common/utils/distanceUtils");

describe(__filename, () => {
  it("should compute distance between coordinates", () => {
    let result = distanceBetweenCoordinates(1, 1, 1, 1);
    assert.strictEqual(result, 0);

    result = distanceBetweenCoordinates(48.85053461447283, 2.3083430674498158, 48.8915255395329, 2.3942656979918544);
    assert.strictEqual(result, 7763);
  });
});
