import { test, expect, describe } from "vitest";
import {
  drawReducer,
  pickupReducer,
  meldReducer,
  discardReducer,
  goOutReducer,
} from "./reducers";
import { Card, cardsScore, Meld, REAL_CARDS } from "../cards";
import {
  createInitialState,
  EMPTY_MELD,
  GamePhase,
  newRoundState,
  State,
} from "./state";
import {
  actionDiscard,
  actionDraw,
  actionGoOut,
  actionMeld,
  actionPickup,
} from "./actions";

describe("drawReducer", () => {
  test("draw from deck", () => {
    const state = createInitialState(0);
    for (const hand of ["player1Hand", "player2Hand"] as const) {
      state.player1Turn = hand === "player1Hand";
      const output = drawReducer(state, actionDraw());
      expect(output).toEqual({
        ...state,
        deck: state.deck.slice(1),
        [hand]: [...state[hand], state.deck[0]],
        phase: GamePhase.PLAY,
      });
    }
  });

  test("draw from empty deck", () => {
    const state = createInitialState(0);
    state.discard.push(...state.deck);
    state.deck = [];
    for (const hand of ["player1Hand", "player2Hand"] as const) {
      state.player1Turn = hand === "player1Hand";
      const output = drawReducer(state, actionDraw());
      const newDeck = state.discard.reverse();
      expect(output).toEqual({
        ...state,
        deck: newDeck.slice(2),
        discard: [newDeck[0]],
        [hand]: [...state[hand], newDeck[1]],
        phase: GamePhase.PLAY,
      });
    }
  });

  test("draw fails when not draw phase", () => {
    const state = createInitialState(0);
    state.phase = GamePhase.PLAY;
    const output = drawReducer(state, actionDraw());
    expect(output).toEqual(state);
  });
});

describe("pickupReducer", () => {
  test("pickup top card", () => {
    for (const hand of ["player1Hand", "player2Hand"] as const) {
      const playerHand: Card[] = ["2H", "3H"];
      const discard: Card[] = ["4H"];
      const state: State = {
        deck: REAL_CARDS.filter(
          (card) => ![...playerHand, ...discard].includes(card)
        ),
        player1Hand: [],
        player1Score: 0,
        player1First: true,
        player1Turn: hand === "player1Hand",
        player2Hand: [],
        player2Score: 0,
        phase: GamePhase.DRAW,
        discard,
        melds: [],
        [hand]: playerHand,
      };

      const output = pickupReducer(state, actionPickup({ pickupIndex: 0 }));
      expect(output).toEqual({
        ...state,
        discard: [],
        [hand]: [...state[hand], state.discard[0]],
        mustMeldCard: state.discard[0],
        phase: GamePhase.PLAY,
      });
    }
  });

  test("pickup non-top card", () => {
    const player1Hand: Card[] = ["2H", "3H"];
    const discard: Card[] = ["2C", "4H", "2D"];
    const state: State = {
      deck: REAL_CARDS.filter(
        (card) => ![...player1Hand, ...discard].includes(card)
      ),
      player1Hand,
      player1Score: 0,
      player1First: true,
      player1Turn: true,
      player2Hand: [],
      player2Score: 0,
      phase: GamePhase.DRAW,
      discard,
      melds: [],
    };

    const output = pickupReducer(state, actionPickup({ pickupIndex: 1 }));
    expect(output).toEqual({
      ...state,
      discard: [state.discard[0]],
      player1Hand: [...state.player1Hand, ...state.discard.slice(1)],
      mustMeldCard: state.discard[1],
      phase: GamePhase.PLAY,
    });
  });

  test("pickup fails when cannot meld card", () => {
    const state = createInitialState(0);
    const output = pickupReducer(state, actionPickup({ pickupIndex: 0 }));
    expect(output).toEqual(state);
  });

  test("pickup fails when not draw phase", () => {
    const player1Hand: Card[] = ["2H", "3H"];
    const discard: Card[] = ["4H"];
    const state: State = {
      deck: REAL_CARDS.filter(
        (card) => ![...player1Hand, ...discard].includes(card)
      ),
      player1Hand,
      player1Score: 0,
      player1First: true,
      player1Turn: true,
      player2Hand: [],
      player2Score: 0,
      phase: GamePhase.PLAY,
      discard,
      melds: [],
    };
    const output = pickupReducer(state, actionPickup({ pickupIndex: 0 }));
    expect(output).toEqual(state);
  });
});

describe("discardReducer", () => {
  test("discard when meld not required", () => {
    const state = createInitialState(0);
    state.phase = GamePhase.PLAY;
    for (const hand of ["player1Hand", "player2Hand"] as const) {
      state.player1Turn = hand === "player1Hand";
      const output = discardReducer(
        state,
        actionDiscard({ card: state[hand][0] })
      );
      expect(output).toEqual({
        ...state,
        discard: [...state.discard, state[hand][0]],
        [hand]: state[hand].slice(1),
        phase: GamePhase.DRAW,
        player1Turn: !state.player1Turn,
      });
    }
  });

  test("discard fails when meld required", () => {
    const state = createInitialState(0);
    state.phase = GamePhase.PLAY;
    state.mustMeldCard = "4H";
    const output = discardReducer(
      state,
      actionDiscard({ card: state.player1Hand[0] })
    );
    expect(output).toEqual(state);
  });

  test("discard fails when not play phase", () => {
    const state = createInitialState(0);
    const output = discardReducer(
      state,
      actionDiscard({ card: state.player1Hand[0] })
    );
    expect(output).toEqual(state);
  });

  test("discard fails when hand does not include card", () => {
    const state = createInitialState(0);
    state.phase = GamePhase.PLAY;
    const output = discardReducer(
      state,
      actionDiscard({ card: state.discard[0] })
    );
    expect(output).toEqual(state);
  });
});

describe("meldReducer", () => {
  test("meld fails when game phase is not play", () => {
    const player1Hand: Card[] = ["2H", "3H", "4H"];
    const discard: Card[] = ["2C"];
    const state: State = {
      deck: REAL_CARDS.filter(
        (card) => ![...player1Hand, ...discard].includes(card)
      ),
      player1Hand,
      player1Score: 0,
      player1First: true,
      player1Turn: true,
      player2Hand: [],
      player2Score: 0,
      phase: GamePhase.DRAW,
      discard,
      melds: [],
    };
    const output = meldReducer(state, actionMeld({ cards: state.player1Hand }));
    expect(output).toEqual(state);
  });

  test("meld fails when using card not in hand", () => {
    const player1Hand: Card[] = ["2H", "3H"];
    const discard: Card[] = ["2C"];
    const state: State = {
      deck: REAL_CARDS.filter(
        (card) => ![...player1Hand, ...discard].includes(card)
      ),
      player1Hand,
      player1Score: 0,
      player1First: true,
      player1Turn: true,
      player2Hand: [],
      player2Score: 0,
      phase: GamePhase.PLAY,
      discard,
      melds: [],
    };
    const output = meldReducer(
      state,
      actionMeld({ cards: [...state.player1Hand, "4H"] })
    );
    expect(output).toEqual(state);
  });

  test("meld fails when meld is not valid", () => {
    const player1Hand: Card[] = ["2H", "3H", "4C"];
    const discard: Card[] = ["2C"];
    const state: State = {
      deck: REAL_CARDS.filter(
        (card) => ![...player1Hand, ...discard].includes(card)
      ),
      player1Hand,
      player1Score: 0,
      player1First: true,
      player1Turn: true,
      player2Hand: [],
      player2Score: 0,
      phase: GamePhase.PLAY,
      discard,
      melds: [],
    };
    const output = meldReducer(state, actionMeld({ cards: state.player1Hand }));
    expect(output).toEqual(state);
  });

  test("meld fails when required meld is not made", () => {
    const player1Hand: Card[] = ["2H", "3H", "4H", "2D", "2S"];
    const discard: Card[] = ["2C"];
    const state: State = {
      deck: REAL_CARDS.filter(
        (card) => ![...player1Hand, ...discard].includes(card)
      ),
      player1Hand,
      player1Score: 0,
      player1First: true,
      player1Turn: true,
      player2Hand: [],
      player2Score: 0,
      phase: GamePhase.PLAY,
      discard,
      mustMeldCard: "2S",
      melds: [],
    };
    const output = meldReducer(
      state,
      actionMeld({ cards: state.player1Hand.slice(0, 3) })
    );
    expect(output).toEqual(state);
  });

  test("3 card run meld", () => {
    for (const hand of ["player1Hand", "player2Hand"] as const) {
      const playerHand: Card[] = ["2H", "3H", "4H"];
      const discard: Card[] = ["2C"];
      const state: State = {
        deck: REAL_CARDS.filter(
          (card) => ![...playerHand, ...discard].includes(card)
        ),
        player1Hand: [],
        player1Score: 0,
        player1First: true,
        player1Turn: hand === "player1Hand",
        player2Hand: [],
        player2Score: 0,
        phase: GamePhase.PLAY,
        discard,
        melds: [],
        [hand]: playerHand,
      };
      const meldTurnKey: keyof Meld = state.player1Turn
        ? "player1Cards"
        : "player2Cards";

      const output = meldReducer(
        state,
        actionMeld({ cards: ["2H", "3H", "4H"] })
      );
      expect(output).toEqual({
        ...state,
        [hand]: [],
        melds: [
          ...state.melds,
          { ...EMPTY_MELD, [meldTurnKey]: ["2H", "3H", "4H"] },
        ],
        phase: GamePhase.PLAY,
      });
    }
  });

  test("3 card set meld", () => {
    for (const hand of ["player1Hand", "player2Hand"] as const) {
      const playerHand: Card[] = ["2H", "2C", "2D"];
      const discard: Card[] = ["3C"];
      const state: State = {
        deck: REAL_CARDS.filter(
          (card) => ![...playerHand, ...discard].includes(card)
        ),
        player1Hand: [],
        player1Score: 0,
        player1First: true,
        player1Turn: hand === "player1Hand",
        player2Hand: [],
        player2Score: 0,
        phase: GamePhase.PLAY,
        discard,
        melds: [],
        [hand]: playerHand,
      };
      const meldTurnKey: keyof Meld = state.player1Turn
        ? "player1Cards"
        : "player2Cards";

      const output = meldReducer(
        state,
        actionMeld({ cards: ["2H", "2C", "2D"] })
      );
      expect(output).toEqual({
        ...state,
        [hand]: [],
        melds: [
          ...state.melds,
          { ...EMPTY_MELD, [meldTurnKey]: ["2H", "2C", "2D"] },
        ],
        phase: GamePhase.PLAY,
      });
    }
  });

  test("lay on existing meld", () => {
    const player1Hand: Card[] = ["2H", "2S"];
    const discard: Card[] = ["2C"];
    const state: State = {
      deck: REAL_CARDS.filter(
        (card) => ![...player1Hand, ...discard].includes(card)
      ),
      player1Hand,
      player1Score: 0,
      player1First: true,
      player1Turn: true,
      player2Hand: [],
      player2Score: 0,
      phase: GamePhase.PLAY,
      discard,
      melds: [{ player1Cards: ["3H", "4H", "5H"], player2Cards: [] }],
    };
    const output = meldReducer(
      state,
      actionMeld({
        cards: [state.player1Hand[0]],
        existingMeld: state.melds[0],
      })
    );
    expect(output).toEqual({
      ...state,
      player1Hand: ["2S"],
      melds: [{ player1Cards: ["2H", "3H", "4H", "5H"], player2Cards: [] }],
      mustMeldCard: undefined,
    });
  });

  test("low A handling", () => {
    const player1Hand: Card[] = ["AH", "2H", "3H"];
    const discard: Card[] = ["2C"];
    const state: State = {
      deck: REAL_CARDS.filter(
        (card) => ![...player1Hand, ...discard].includes(card)
      ),
      player1Hand,
      player1Score: 0,
      player1First: true,
      player1Turn: true,
      player2Hand: [],
      player2Score: 0,
      phase: GamePhase.PLAY,
      discard,
      melds: [],
    };
    const output = meldReducer(
      state,
      actionMeld({
        cards: state.player1Hand,
      })
    );
    expect(output).toEqual({
      ...state,
      player1Hand: [],
      melds: [{ player1Cards: ["1H", "2H", "3H"], player2Cards: [] }],
      mustMeldCard: undefined,
    });
  });

  test("high A handling", () => {
    const player1Hand: Card[] = ["AH", "QH", "KH"];
    const discard: Card[] = ["2C"];
    const state: State = {
      deck: REAL_CARDS.filter(
        (card) => ![...player1Hand, ...discard].includes(card)
      ),
      player1Hand,
      player1Score: 0,
      player1First: true,
      player1Turn: true,
      player2Hand: [],
      player2Score: 0,
      phase: GamePhase.PLAY,
      discard,
      melds: [],
    };
    const output = meldReducer(
      state,
      actionMeld({
        cards: state.player1Hand,
      })
    );
    expect(output).toEqual({
      ...state,
      player1Hand: [],
      melds: [{ player1Cards: ["QH", "KH", "AH"], player2Cards: [] }],
      mustMeldCard: undefined,
    });
  });
});

describe("goOutReducer", () => {
  test("go out when hand empty", () => {
    for (const hand of ["player1Hand", "player2Hand"] as const) {
      const state = createInitialState(0);
      state.phase = GamePhase.PLAY;
      state.player1Turn = hand === "player1Hand";
      const loserHand =
        hand === "player1Hand"
          ? ("player2Hand" as const)
          : ("player1Hand" as const);
      const loserScore =
        hand === "player1Hand"
          ? ("player2Score" as const)
          : ("player1Score" as const);
      state.discard.push(...state[hand]);
      state[hand] = [];
      const output = goOutReducer(state, actionGoOut({ seed: 1 }));
      expect(output).toEqual({
        ...newRoundState(state, 1),
        [loserScore]: -cardsScore(state[loserHand]),
      });
    }
  });

  test("go out fails when hand not empty", () => {
    const state = createInitialState(0);
    state.phase = GamePhase.PLAY;
    const output = goOutReducer(state, actionGoOut());
    expect(output).toEqual(state);
  });

  test("go out fails when not draw phase", () => {
    const state = createInitialState(0);
    state.discard.push(...state.player1Hand);
    state.player1Hand = [];
    const output = goOutReducer(state, actionGoOut());
    expect(output).toEqual(state);
  });

  test("game complete when either player goes out with at least 500 points", () => {
    const state = createInitialState(0);
    state.phase = GamePhase.PLAY;
    state.player1Hand = [];
    state.player1Score = 495;
    state.melds = [{ player1Cards: ["2H", "3H", "4H"], player2Cards: [] }];
    const output = goOutReducer(state, actionGoOut({ seed: 1 }));
    expect(output).toEqual({
      ...newRoundState(state, 1),
      player1Score: 510,
      player2Score: -cardsScore(state.player2Hand),
      phase: GamePhase.COMPLETE,
    });
  });
});
