import isEqual from "lodash.isequal";
import { Card, cardRank, cardSuit, Meld, rankToNumber } from "../cards";

export const isRun = (cards: Card[]) => {
  const ranks = cards
    .map((card) => rankToNumber(cardRank(card)))
    .sort((a, b) => a - b);
  return [
    ranks,
    ranks
      .map((rank) => (rank === rankToNumber("A") ? 1 : rank))
      .sort((a, b) => a - b),
  ].some((rankValues) =>
    isEqual(
      Array.from(
        { length: rankValues[rankValues.length - 1] - rankValues[0] + 1 },
        (_, i) => i + rankValues[0]
      ),
      rankValues
    )
  );
};

export const isValidMeld = (meld: Meld) => {
  if (
    ![meld.player1Cards, meld.player2Cards].some((cards) => cards.length >= 3)
  ) {
    return false;
  }
  const cards = [...meld.player1Cards, ...meld.player2Cards];
  return (
    new Set(cards.map(cardRank)).size === 1 ||
    (new Set(cards.map(cardSuit)).size === 1 && isRun(cards))
  );
};

export const pairs = <T>(array: T[]) =>
  array.flatMap((v, i) => array.slice(i + 1).map<[T, T]>((w) => [v, w]));

export const canMeldWithCard = (
  hand: Card[],
  targetCard: Card,
  currentMelds: Meld[]
) =>
  currentMelds.some(
    (meld) =>
      isValidMeld({
        ...meld,
        player1Cards: [...meld.player1Cards, targetCard],
      }) ||
      isValidMeld({ ...meld, player2Cards: [...meld.player2Cards, targetCard] })
  ) ||
  pairs(hand).some((pair) =>
    isValidMeld({ player1Cards: [...pair, targetCard], player2Cards: [] })
  );
