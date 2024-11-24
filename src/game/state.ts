import { MersenneTwister19937, shuffle } from "random-js";
import { Card, Meld, REAL_CARDS } from "../cards";

export const enum GamePhase {
  DRAW,
  PLAY,
  DISCARD,
}

export type State = {
  deck: Card[];
  player1Hand: Card[];
  player2Hand: Card[];
  player1Melds: Meld[];
  player2Melds: Meld[];
  discard: Card[];
  player1Turn: boolean;
  phase: GamePhase;
};

export const createInitialState = (seed?: number): State => {
  const engine =
    seed !== undefined
      ? MersenneTwister19937.seed(seed)
      : MersenneTwister19937.autoSeed();

  const deck = [...REAL_CARDS];
  shuffle(engine, deck);

  const player1Hand = deck.splice(0, 7);
  const player2Hand = deck.splice(0, 7);
  const discard = deck.splice(0, 1);

  return {
    deck,
    player1Hand,
    player2Hand,
    player1Melds: [],
    player2Melds: [],
    discard,
    player1Turn: true,
    phase: GamePhase.DRAW,
  };
};
