import { produce } from "immer";
import {
  DiscardActionType,
  DrawActionType,
  GoOutActionType,
  MeldActionType,
  PickupActionType,
} from "./actions";
import { GamePhase, newRoundState, State } from "./state";
import { canMeldWithCard, isRun, isValidMeld } from "./validation";
import { Card, cardRank, cardsScore, cardSuit, Meld } from "../cards";
import isEqual from "lodash.isequal";

type Reducer<T> = (state: State, action: T) => State;

export const drawReducer: Reducer<DrawActionType> = (state, _action) => {
  if (state.phase !== GamePhase.DRAW) {
    return state;
  }

  return produce(state, (newState) => {
    if (newState.deck.length === 0) {
      newState.deck = newState.discard.reverse();
      newState.discard = [newState.deck.shift()!];
    }

    const card = newState.deck.shift()!;
    newState[state.player1Turn ? "player1Hand" : "player2Hand"].push(card);
    newState.phase = GamePhase.PLAY;
  });
};

export const pickupReducer: Reducer<PickupActionType> = (state, action) => {
  const mustMeldCard = state.discard[action.args.pickupIndex];
  if (
    state.phase !== GamePhase.DRAW ||
    state.discard.length <= action.args.pickupIndex ||
    !canMeldWithCard(
      state[state.player1Turn ? "player1Hand" : "player2Hand"],
      mustMeldCard,
      state.melds
    )
  ) {
    return state;
  }

  return produce(state, (newState) => {
    const cards = newState.discard.splice(action.args.pickupIndex);
    newState[state.player1Turn ? "player1Hand" : "player2Hand"].push(...cards);
    newState.mustMeldCard = mustMeldCard;
    newState.phase = GamePhase.PLAY;
  });
};

export const discardReducer: Reducer<DiscardActionType> = (state, action) => {
  const turnPlayerHand = state.player1Turn
    ? ("player1Hand" as const)
    : ("player2Hand" as const);
  if (
    state.phase !== GamePhase.PLAY ||
    state.mustMeldCard ||
    !state[turnPlayerHand].includes(action.args.card)
  ) {
    return state;
  }

  return produce(state, (newState) => {
    newState[turnPlayerHand] = newState[turnPlayerHand].filter(
      (card) => card !== action.args.card
    );
    newState.discard.push(action.args.card);
    newState.phase = GamePhase.DRAW;
    newState.player1Turn = !newState.player1Turn;
  });
};

export const meldReducer: Reducer<MeldActionType> = (state, action) => {
  const meldTurnKey: keyof Meld = state.player1Turn
    ? "player1Cards"
    : "player2Cards";
  let meld = produce(
    action.args.existingMeld ?? {
      player1Cards: [],
      player2Cards: [],
    },
    (m) => {
      m[meldTurnKey].push(...action.args.cards);
      return m;
    }
  );
  if (
    state.phase !== GamePhase.PLAY ||
    !isValidMeld(meld) ||
    (state.mustMeldCard && action.args.cards.includes(state.mustMeldCard))
  ) {
    return state;
  }

  return produce(state, (newState) => {
    if (action.args.existingMeld) {
      newState.melds = newState.melds.filter(
        (m) => !isEqual(m, action.args.existingMeld)
      );
    }
    newState.mustMeldCard = undefined;
    if (
      meld[meldTurnKey].map(cardRank).includes("A") &&
      isRun(meld[meldTurnKey]) &&
      !meld[meldTurnKey].map(cardRank).includes("K")
    ) {
      meld = {
        ...meld,
        [meldTurnKey]: meld[meldTurnKey].map<Card>((card) =>
          cardRank(card) !== "A" ? card : `1${cardSuit(card)}`
        ),
      };
    }
    newState.melds.push(meld);
  });
};

export const goOutReducer: Reducer<GoOutActionType> = (state, _action) => {
  if (state.phase !== GamePhase.PLAY) {
    return state;
  }

  return produce(state, (newState) => {
    newState.player1Score +=
      cardsScore(newState.melds.flatMap((meld) => meld.player1Cards)) -
      cardsScore(newState.player1Hand);
    newState.player2Score +=
      cardsScore(newState.melds.flatMap((meld) => meld.player2Cards)) -
      cardsScore(newState.player2Hand);
    return newRoundState(newState);
  });
};
