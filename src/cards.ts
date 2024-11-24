export const SUITS = ["H", "D", "S", "C"] as const;

export type Suit = (typeof SUITS)[number];
export const RANKS = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "T",
  "J",
  "Q",
  "K",
  "A",
] as const;
export type Rank = (typeof RANKS)[number];

export type Card = `${Rank}${Suit}`;

export const cardRank = (card: Card): Rank => card[0] as Rank;
export const cardSuit = (card: Card): Suit => card[1] as Suit;

export const ALL_CARDS = RANKS.flatMap((rank: Rank) =>
  SUITS.map<Card>((suit: Suit) => `${rank}${suit}`)
);

export const REAL_CARDS = ALL_CARDS.filter((card) => cardRank(card) !== "1");

export type Meld = Readonly<{
  player1Cards: Card[];
  player2Cards: Card[];
}>;

export const rankToNumber = (rank: Rank): number => RANKS.indexOf(rank) + 1;

export const numberToRank = (num: number): Rank => {
  if (num < 1 || num > 14) {
    throw new Error("number out of bounds");
  }
  return RANKS[num - 1];
};

export const cardValue = (card: Card): number => {
  switch (cardRank(card)) {
    case "T":
    case "J":
    case "Q":
    case "K":
      return 10;
    case "A":
      return 15;
    default:
      return 5;
  }
};

export const cardsScore = (cards: Card[]): number =>
  cards.reduce((total, card) => total + cardValue(card), 0);
