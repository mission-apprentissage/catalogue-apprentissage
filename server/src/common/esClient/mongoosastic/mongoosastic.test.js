const assert = require("assert");
const integrationTests = require("../../../../tests/utils/integrationTests");
const { createModel } = require("../../models/createModel");
const { setupBeforeEach, setupAfterEach } = require("../../../../tests/helpers/setup");
const { cleanAll } = require("../../../../tests/utils/testUtils");
// const { mongoosastic, postDocumentSave, postQuerySave } = require(".");
const logger = require("../../logger");
const sinon = require("sinon");

integrationTests(__filename, () => {
  const Test = createModel(
    "tests",
    [
      {
        message: {
          index: true,
          type: String,
          default: null,
          description: "Le message du test",
        },
      },
      { timestamps: true },
    ],
    {
      elastic: {
        index: "tests",
      },
    }
  );

  beforeEach(async () => {
    setupBeforeEach();
    await Test.deleteMany();
    await Test.unsynchronize();
  });

  afterEach(async () => {
    setupAfterEach();

    await cleanAll();
    sinon.restore();
  });

  it.skip("should call createModel without error", () => {
    createModel(
      "tests",
      [
        {
          message: {
            type: String,
            default: null,
          },
        },
        { timestamps: true },
      ],
      {
        elastic: {
          index: "tests",
        },
      }
    );
  });

  it.skip("should create a document without error", async () => {
    const test1 = await Test.create({ message: "Test1" });

    assert.strictEqual(test1.message, "Test1");

    const test2 = new Test({ message: "Test2" });
    test2.save();

    assert.strictEqual(test2.message, "Test2");
  });

  it.skip("should call postDocumentSave when calling save on a document", async () => {
    const loggerDebug = sinon.spy(logger, "debug");
    const test = new Test({ message: "Test" });

    await test.save();

    sinon.assert.calledOnceWithMatch(loggerDebug, { type: "mongoosastic" }, "POST DOCUMENT SAVE");
  });

  it.skip("should call postDocumentSave when calling create on a model", async () => {
    const loggerDebug = sinon.spy(logger, "debug");
    await Test.create({ message: "Test" });

    sinon.assert.calledOnceWithMatch(loggerDebug, { type: "mongoosastic" }, "POST DOCUMENT SAVE");
  });

  // TODO : Now updateOne seems to call both document and query hooks...
  // it.skip("should call postDocumentSave when calling updateOne on a document", async () => {
  //   const loggerDebug = sinon.spy(logger, "debug");
  //   const test = new Test();

  //   test.message = "Test";

  //   await test.save();

  //   // const savedTest = await Test.findOne({ message: "Test" });

  //   test.message = "Another test";

  //   await test.updateOne({});

  //   console.log(loggerDebug);
  //   sinon.assert.calledTwice(loggerDebug);
  //   sinon.assert.calledWithMatch(loggerDebug.firstCall, { type: "mongoosastic" }, "POST DOCUMENT SAVE");
  //   sinon.assert.calledWithMatch(loggerDebug.thirdCall, { type: "mongoosastic" }, "POST DOCUMENT SAVE");
  // });

  it.skip("should call postDocumentRemove when calling deleteOne on a document", async () => {
    const loggerDebug = sinon.spy(logger, "debug");
    const test = new Test();
    test.message = "Test";

    await test.save();

    const savedTest = await Test.findOne({ message: "Test" });

    await savedTest.deleteOne();

    sinon.assert.calledTwice(loggerDebug);
    sinon.assert.calledWithMatch(loggerDebug.firstCall, { type: "mongoosastic" }, "POST DOCUMENT SAVE");
    sinon.assert.calledWithMatch(loggerDebug.secondCall, { type: "mongoosastic" }, "POST DOCUMENT REMOVE");
  });

  it.skip("should call postQuerySave when calling updateOne on a model", async () => {
    const loggerDebug = sinon.spy(logger, "debug");

    const test = await Test.create({ message: "Test" });

    // console.log(await Test.find());

    await Test.updateOne({ _id: test._id }, { $set: { message: "Another message" } });

    // console.log(await Test.find());

    sinon.assert.calledTwice(loggerDebug);
    sinon.assert.calledWithMatch(loggerDebug.firstCall, { type: "mongoosastic" }, "POST DOCUMENT SAVE");
    sinon.assert.calledWithMatch(loggerDebug.secondCall, { type: "mongoosastic" }, "POST QUERY SAVE");
  });

  it.skip("should call postQuerySave when calling replaceOne on a model", async () => {
    const loggerDebug = sinon.spy(logger, "debug");

    const test = await Test.create({ message: "Test" });

    // console.log(await Test.find());

    await Test.replaceOne({ _id: test._id }, { $set: { message: "Another message" } }); // console.log(await Test.find());

    // console.log(await Test.find());

    sinon.assert.calledTwice(loggerDebug);
    sinon.assert.calledWithMatch(loggerDebug.firstCall, { type: "mongoosastic" }, "POST DOCUMENT SAVE");
    sinon.assert.calledWithMatch(loggerDebug.secondCall, { type: "mongoosastic" }, "POST QUERY SAVE");
  });

  it.skip("should call postQuerySave when calling findOneAndReplace on a model", async () => {
    const loggerDebug = sinon.spy(logger, "debug");

    const test = await Test.create({ message: "Test" });

    // console.log(await Test.find());

    await Test.findOneAndReplace({ _id: test._id }, { $set: { message: "Another message" } });

    // console.log(await Test.find());

    sinon.assert.calledTwice(loggerDebug);
    sinon.assert.calledWithMatch(loggerDebug.firstCall, { type: "mongoosastic" }, "POST DOCUMENT SAVE");
    sinon.assert.calledWithMatch(loggerDebug.secondCall, { type: "mongoosastic" }, "POST QUERY SAVE");
  });

  it.skip("should call postQuerySave when calling findOneAndUpdate on a model", async () => {
    const loggerDebug = sinon.spy(logger, "debug");

    const test = await Test.create({ message: "Test" });

    // console.log(await Test.find());

    await Test.findOneAndUpdate({ _id: test._id }, { $set: { message: "Another message" } });

    // console.log(await Test.find());

    sinon.assert.calledTwice(loggerDebug);
    sinon.assert.calledWithMatch(loggerDebug.firstCall, { type: "mongoosastic" }, "POST DOCUMENT SAVE");
    sinon.assert.calledWithMatch(loggerDebug.secondCall, { type: "mongoosastic" }, "POST QUERY SAVE");
  });

  it.skip("should call postQueryRemove when calling deleteOne on a model", async () => {
    const loggerDebug = sinon.spy(logger, "debug");

    const test = await Test.create({ message: "Test" });

    // console.log(await Test.find());

    await Test.deleteOne({ _id: test._id }, { $set: { message: "Another message" } });

    // console.log(await Test.find());

    sinon.assert.calledTwice(loggerDebug);
    sinon.assert.calledWithMatch(loggerDebug.firstCall, { type: "mongoosastic" }, "POST DOCUMENT SAVE");
    sinon.assert.calledWithMatch(loggerDebug.secondCall, { type: "mongoosastic" }, "PRE QUERY REMOVE");
  });

  it.skip("should call postQueryRemove when calling findOneAndDelete on a model", async () => {
    const loggerDebug = sinon.spy(logger, "debug");

    const test = await Test.create({ message: "Test" });

    // console.log(await Test.find());

    await Test.findOneAndDelete({ _id: test._id }, { $set: { message: "Another message" } });

    // console.log(await Test.find());

    sinon.assert.calledTwice(loggerDebug);
    sinon.assert.calledWithMatch(loggerDebug.firstCall, { type: "mongoosastic" }, "POST DOCUMENT SAVE");
    sinon.assert.calledWithMatch(loggerDebug.secondCall, { type: "mongoosastic" }, "PRE QUERY REMOVE");
  });

  /**
   * Les tests suivants peuvent être utilisé pour vérifier la synchronisation avec une instance elastic search en local.
   * Pour executer, remplacer it par it.
   */

  it.skip("synchronize with an elastic instance when calling create on a model", async () => {
    Test.startAllMongoosaticHooks();

    await Test.create({ message: "Test1" });

    Test.pauseAllMongoosaticHooks();
  });

  it.skip("synchronize with an elastic instance when calling findOneAndUpdate on a model", async () => {
    const loggerDebug = sinon.spy(logger, "debug");

    Test.startAllMongoosaticHooks();

    const test1 = await Test.create({ message: "To be changed" });
    const test2 = await Test.create({ message: "Not to be changed" });

    await Test.findOneAndUpdate({ _id: test1._id }, { $set: { message: "Changed" } });

    Test.pauseAllMongoosaticHooks();

    for (call of loggerDebug.getCalls()) {
      if (call.args.includes("POST QUERY SAVE")) {
        console.log("call", call);
      }
    }
  });

  it.skip("synchronize with an elastic instance when calling findOneAndDelete on a model", async () => {
    const loggerDebug = sinon.spy(logger, "debug");

    Test.startAllMongoosaticHooks();

    const test1 = await Test.create({ message: "To be deleted" });
    const test2 = await Test.create({ message: "Not to be deleted" });

    await Test.findOneAndDelete({ _id: test1._id });

    Test.pauseAllMongoosaticHooks();
    for (call of loggerDebug.getCalls()) {
      if (call.args.includes("PRE QUERY REMOVE")) {
        console.log("call", call);
      }
    }
  });

  it.skip("synchronize with an elastic instance when calling updateMany on a model", async () => {
    const loggerDebug = sinon.spy(logger, "debug");

    Test.startAllMongoosaticHooks();

    const test1 = await Test.create({ message: "Test 1" });
    const test2 = await Test.create({ message: "Test 2" });
    const test3 = await Test.create({ message: "Test 3" });
    const test4 = await Test.create({ message: "Test 4" });
    const testA = await Test.create({ message: "Blabla" });

    await Test.updateMany({ message: /^Test.*/ }, { $set: { message: "Toto" } });

    Test.pauseAllMongoosaticHooks();
    for (call of loggerDebug.getCalls()) {
      if (call.args.includes("PRE QUERY UPDATE MANY")) {
        console.log("call", call);
      }
    }
  });

  it.skip("synchronize with an elastic instance when calling deleteOne on a model", async () => {
    const loggerDebug = sinon.spy(logger, "debug");

    Test.startAllMongoosaticHooks();

    const test1 = await Test.create({ message: "Test 1" });
    const test2 = await Test.create({ message: "Test 2" });
    const test3 = await Test.create({ message: "Test 3" });
    const test4 = await Test.create({ message: "Test 4" });
    const testA = await Test.create({ message: "Blabla" });

    await Test.deleteOne({ message: "Blabla" });

    Test.pauseAllMongoosaticHooks();
    for (call of loggerDebug.getCalls()) {
      if (call.args.includes("PRE QUERY REMOVE")) {
        console.log("call", call);
      }
    }
  });

  it.skip("synchronize with an elastic instance when calling deleteMany on a model", async () => {
    const loggerDebug = sinon.spy(logger, "debug");

    Test.startAllMongoosaticHooks();

    const test1 = await Test.create({ message: "Test 1" });
    const test2 = await Test.create({ message: "Test 2" });
    const test3 = await Test.create({ message: "Test 3" });
    const test4 = await Test.create({ message: "Test 4" });
    const testA = await Test.create({ message: "Blabla" });

    await Test.deleteMany({ message: /^Test.*/ });

    Test.pauseAllMongoosaticHooks();
    for (call of loggerDebug.getCalls()) {
      if (call.args.includes("PRE QUERY REMOVE")) {
        console.log("call", call);
      }
    }
  });
});
