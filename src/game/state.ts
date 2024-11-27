import { MersenneTwister19937, shuffle } from "random-js";
import { Card, Meld, REAL_CARDS } from "../cards";
import { produce } from "immer";

export const enum GamePhase {
  DRAW,
  PLAY,
  COMPLETE,
}

export const EMPTY_MELD: Meld = {
  player1Cards: [],
  player2Cards: [],
};

export type State = {
  deck: Card[];
  player1Hand: Card[];
  player2Hand: Card[];
  melds: Meld[];
  discard: Card[];
  player1First: boolean;
  player1Turn: boolean;
  phase: GamePhase;
  mustMeldCard?: Card;
  player1Score: number;
  player2Score: number;
};

export const createInitialState = (seed?: number): State => {
  const engine =
    seed !== undefined
      ? MersenneTwister19937.seed(seed)
      : /* v8 ignore next */
        MersenneTwister19937.autoSeed();

  const deck = [...REAL_CARDS];
  shuffle(engine, deck);

  const player1Hand = deck.splice(0, 9);
  const player2Hand = deck.splice(0, 9);
  const discard = deck.splice(0, 1);

  return {
    deck,
    player1Hand,
    player2Hand,
    melds: [],
    discard,
    player1First: true,
    player1Turn: true,
    phase: GamePhase.DRAW,
    player1Score: 0,
    player2Score: 0,
  };
};

export const newRoundState = (state: State, seed?: number): State => {
  const engine =
    seed !== undefined
      ? MersenneTwister19937.seed(seed)
      : /* v8 ignore next */
        MersenneTwister19937.autoSeed();

  const deck = [...REAL_CARDS];
  shuffle(engine, deck);

  const player1Hand = deck.splice(0, 9);
  const player2Hand = deck.splice(0, 9);
  const discard = deck.splice(0, 1);

  return produce(state, (newState) => {
    newState.player1Hand = player1Hand;
    newState.player2Hand = player2Hand;
    newState.discard = discard;
    newState.deck = deck;
    newState.melds = [];
    newState.player1First = !newState.player1First;
    newState.player1Turn = newState.player1First;
    newState.phase = GamePhase.DRAW;
  });
};
