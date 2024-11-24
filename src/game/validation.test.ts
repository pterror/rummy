import { expect, test } from "vitest";
import { canMeldWithCard, isValidMeld, pairs } from "./validation";
import { Card, Meld } from "../cards";

test("pairs function", () => {
  const elements = [1, 2, 3, 4, 0];
  expect(pairs(elements)).toEqual([
    [1, 2],
    [1, 3],
    [1, 4],
    [1, 0],
    [2, 3],
    [2, 4],
    [2, 0],
    [3, 4],
    [3, 0],
    [4, 0],
  ]);
});

test("meld validation", () => {
  const validMelds: Meld[] = (
    [
      ["2H", "2C", "2D"],
      ["3C", "3D", "3H", "3S"],
      ["2C", "3C", "4C"],
      ["7H", "6H", "9H", "8H"],
      ["AC", "2C", "3C"],
      ["QD", "KD", "AD"],
    ] as Card[][]
  ).map<Meld>((cards) => ({ player1Cards: cards, player2Cards: [] }));
  validMelds.forEach((meld) =>
    expect(isValidMeld(meld), JSON.stringify(meld)).toBeTruthy()
  );

  const invalidMelds: Meld[] = (
    [
      ["2H", "2C"],
      ["2C", "3C"],
      ["2C", "3C", "4D"],
      ["7H", "8H", "TH"],
      ["2C", "3C", "4C", "7C"],
    ] as Card[][]
  ).map<Meld>((cards) => ({ player1Cards: cards, player2Cards: [] }));
  invalidMelds.forEach((meld) =>
    expect(isValidMeld(meld), JSON.stringify(meld)).toBeFalsy()
  );
});

test("canMeldWithCard", () => {
  const truthyCases: [Card[], Card, Meld[]][] = [
    [["2C", "4C"], "3C", []],
    [["2C", "2D"], "2H", []],
    [["2C"], "7H", [{ player1Cards: ["7D", "7H", "7C"], player2Cards: [] }]],
    [["2C"], "7H", [{ player1Cards: ["4H", "5H", "6H"], player2Cards: [] }]],
  ];
  truthyCases.forEach(([hand, targetCard, currentMelds]) =>
    expect(
      canMeldWithCard(hand, targetCard, currentMelds),
      JSON.stringify([hand, targetCard, currentMelds])
    ).toBeTruthy()
  );

  const falsyCases: [Card[], Card, Meld[]][] = [
    [["2C", "3D"], "4C", []],
    [["2C", "3C"], "2D", []],
    [["2C"], "7H", [{ player1Cards: ["8D", "8H", "8C"], player2Cards: [] }]],
    [["2C"], "7H", [{ player1Cards: ["3H", "4H", "5H"], player2Cards: [] }]],
  ];
  falsyCases.forEach(([hand, targetCard, currentMelds]) =>
    expect(
      canMeldWithCard(hand, targetCard, currentMelds),
      JSON.stringify([hand, targetCard, currentMelds])
    ).toBeFalsy()
  );
});
