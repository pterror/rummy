import { produce } from "immer";
import {
  DISCARD_ACTION,
  DiscardActionType,
  DRAW_ACTION,
  DrawActionType,
  GameAction,
  GO_OUT_ACTION,
  GoOutActionType,
  MELD_ACTION,
  MeldActionType,
  PICKUP_ACTION,
  PickupActionType,
} from "./actions";
import { EMPTY_MELD, GamePhase, newRoundState, State } from "./state";
import { canMeldWithCard, isRun, isValidMeld } from "./validation";
import {
  Card,
  cardRank,
  cardsScore,
  cardSuit,
  Meld,
  rankToNumber,
} from "../cards";
import isEqual from "lodash.isequal";

type Reducer<T> = (state: State, action: T) => State;

export const drawReducer: Reducer<DrawActionType> = (state) => {
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
  const playerHand = state.player1Turn
    ? ("player1Hand" as const)
    : ("player2Hand" as const);
  let meld = produce(action.args.existingMeld ?? EMPTY_MELD, (m) => {
    m[meldTurnKey].push(...action.args.cards);
    return m;
  });
  if (
    state.phase !== GamePhase.PLAY ||
    !isValidMeld(meld) ||
    (state.mustMeldCard && !action.args.cards.includes(state.mustMeldCard)) ||
    !action.args.cards.every((card) => state[playerHand].includes(card))
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
    const meldCards = [...meld[meldTurnKey]];
    meldCards.sort(
      (a, b) => rankToNumber(cardRank(a)) - rankToNumber(cardRank(b))
    );
    meld = { ...meld, [meldTurnKey]: meldCards };
    newState.melds.push(meld);
    newState[playerHand] = newState[playerHand].filter(
      (card) => !action.args.cards.includes(card)
    );
  });
};

export const goOutReducer: Reducer<GoOutActionType> = (state, action) => {
  const turnPlayerHand = state.player1Turn
    ? ("player1Hand" as const)
    : ("player2Hand" as const);
  if (state.phase !== GamePhase.PLAY || state[turnPlayerHand].length > 0) {
    return state;
  }

  return produce(state, (newState) => {
    const player1Score =
      newState.player1Score +
      cardsScore(newState.melds.flatMap((meld) => meld.player1Cards)) -
      cardsScore(newState.player1Hand);
    const player2Score =
      newState.player2Score +
      cardsScore(newState.melds.flatMap((meld) => meld.player2Cards)) -
      cardsScore(newState.player2Hand);
    const nextState = newRoundState(newState, action.args?.seed);
    return {
      ...nextState,
      player1Score,
      player2Score,
      phase:
        player1Score >= 500 || player2Score >= 500
          ? GamePhase.COMPLETE
          : nextState.phase,
    };
  });
};

export const baseReducer: Reducer<GameAction> = (state, action) => {
  switch (action.action) {
    case DRAW_ACTION:
      return drawReducer(state, action);
    case DISCARD_ACTION:
      return discardReducer(state, action);
    case PICKUP_ACTION:
      return pickupReducer(state, action);
    case MELD_ACTION:
      return meldReducer(state, action);
    case GO_OUT_ACTION:
      return goOutReducer(state, action);
    default:
      return state;
  }
};
