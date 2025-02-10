import { buildUpdatesHistory, sortDescending, sortAscending } from "./historyUtils";

const date1 = new Date("2022-09-01T00:00:00.000Z");
const date2 = new Date("2022-09-02T00:00:00.000Z");

const string1 = date1.toISOString();
// console.log(`${new Date(string1)} :  ${string1}`);
const string2 = date2.toISOString();
// console.log(`${new Date(string2)} :  ${string2}`);

const number1 = date1.getTime();
// console.log(`${new Date(number1)} : ${number1}`);
const number2 = date2.getTime();
// console.log(`${new Date(number2)} : ${number2}`);

const ascDate = [{ updated_at: date1 }, { updated_at: date2 }];

const descDate = [{ updated_at: date2 }, { updated_at: date1 }];

const ascNumber = [{ updated_at: number1 }, { updated_at: number2 }];

const ascString = [{ updated_at: string1 }, { updated_at: string2 }];

const descNumber = [{ updated_at: number2 }, { updated_at: number1 }];

const descString = [{ updated_at: string2 }, { updated_at: string1 }];

it("sortAscending works as espected", () => {
  expect(sortAscending(ascDate[0], ascDate[1]) > 0).toBeFalsy();
  expect(sortAscending(ascDate[1], ascDate[0]) > 0).toBeTruthy();
  expect(sortAscending(ascNumber[0], ascNumber[1]) > 0).toBeFalsy();
  expect(sortAscending(ascNumber[1], ascNumber[0]) > 0).toBeTruthy();
  expect(sortAscending(ascString[0], ascString[1]) > 0).toBeFalsy();
  expect(sortAscending(ascString[1], ascString[0]) > 0).toBeTruthy();
  expect(sortAscending(ascNumber[0], ascString[1]) > 0).toBeFalsy();
  expect(sortAscending(ascNumber[1], ascString[0]) > 0).toBeTruthy();
  expect(sortAscending(ascString[0], ascNumber[1]) > 0).toBeFalsy();
  expect(sortAscending(ascString[1], ascNumber[0]) > 0).toBeTruthy();

  expect(sortAscending(descDate[0], descDate[1]) < 0).toBeFalsy();
  expect(sortAscending(descDate[1], descDate[0]) < 0).toBeTruthy();
  expect(sortAscending(descNumber[0], descNumber[1]) < 0).toBeFalsy();
  expect(sortAscending(descNumber[1], descNumber[0]) < 0).toBeTruthy();
  expect(sortAscending(descString[0], descString[1]) < 0).toBeFalsy();
  expect(sortAscending(descString[1], descString[0]) < 0).toBeTruthy();
  expect(sortAscending(descNumber[0], descString[1]) < 0).toBeFalsy();
  expect(sortAscending(descNumber[1], descString[0]) < 0).toBeTruthy();
  expect(sortAscending(descString[0], descNumber[1]) < 0).toBeFalsy();
  expect(sortAscending(descString[1], descNumber[0]) < 0).toBeTruthy();
});

it("sortDescending works as espected", () => {
  expect(sortDescending(ascDate[0], ascDate[1]) < 0).toBeFalsy();
  expect(sortDescending(ascDate[1], ascDate[0]) < 0).toBeTruthy();
  expect(sortDescending(ascNumber[0], ascNumber[1]) < 0).toBeFalsy();
  expect(sortDescending(ascNumber[1], ascNumber[0]) < 0).toBeTruthy();
  expect(sortDescending(ascString[0], ascString[1]) < 0).toBeFalsy();
  expect(sortDescending(ascString[1], ascString[0]) < 0).toBeTruthy();
  expect(sortDescending(ascNumber[0], ascString[1]) < 0).toBeFalsy();
  expect(sortDescending(ascNumber[1], ascString[0]) < 0).toBeTruthy();
  expect(sortDescending(ascString[0], ascNumber[1]) < 0).toBeFalsy();
  expect(sortDescending(ascString[1], ascNumber[0]) < 0).toBeTruthy();

  expect(sortDescending(descDate[0], descDate[1]) > 0).toBeFalsy();
  expect(sortDescending(descDate[1], descDate[0]) > 0).toBeTruthy();
  expect(sortDescending(descNumber[0], descNumber[1]) > 0).toBeFalsy();
  expect(sortDescending(descNumber[1], descNumber[0]) > 0).toBeTruthy();
  expect(sortDescending(descString[0], descString[1]) > 0).toBeFalsy();
  expect(sortDescending(descString[1], descString[0]) > 0).toBeTruthy();
  expect(sortDescending(descNumber[0], descString[1]) > 0).toBeFalsy();
  expect(sortDescending(descNumber[1], descString[0]) > 0).toBeTruthy();
  expect(sortDescending(descString[0], descNumber[1]) > 0).toBeFalsy();
  expect(sortDescending(descString[1], descNumber[0]) > 0).toBeTruthy();
});

it("buildUpdatesHistory works as espected", () => {
  const previousUpdateHistory = [{ updated_at: date1 }, { updated_at: date2 }];

  const original = {
    field: "previousValue",
    updates_history: previousUpdateHistory,
  };

  const nextUpdateHistory = buildUpdatesHistory(original, { field: "nextValue" }, ["field"]);
  expect(nextUpdateHistory[nextUpdateHistory.length - 1].from.field === "previousValue").toBeTruthy();
  expect(nextUpdateHistory[nextUpdateHistory.length - 1].to.field === "nextValue").toBeTruthy();
  expect(nextUpdateHistory[nextUpdateHistory.length - 1].updated_at).toBeTruthy();
});
