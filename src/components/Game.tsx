import React, { useReducer } from "react";
import { createInitialState, State } from "../game/state";
import { baseReducer } from "../game/reducers";
import { GameAction } from "../game/actions";
import { OpponentHand } from "./OpponentHand";
import { Hand } from "./Hand";
import { Deck } from "./Deck";
import { Discard } from "./Discard";

type GameState = {
  state: State;
  dispatch: React.Dispatch<GameAction>;
};

const GameStateContext = React.createContext<GameState>(null!);

export type GameProps = {
  isPlayer1: boolean;
};

export const Game: React.FC<GameProps> = ({ isPlayer1 }) => {
  const [state, dispatch] = useReducer(
    baseReducer,
    undefined,
    createInitialState
  );
  return (
    <GameStateContext.Provider value={{ state, dispatch }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "90vh",
        }}
      >
        <OpponentHand
          numCards={
            isPlayer1 ? state.player2Hand.length : state.player1Hand.length
          }
        />
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-evenly",
          }}
        >
          <Deck numCards={state.deck.length} />
          <Discard cards={state.discard} />
        </div>
        <Hand
          cards={isPlayer1 ? state.player1Hand : state.player2Hand}
          melds={state.melds}
          isPlayer1={isPlayer1}
          isInDiscardPhase={isPlayer1 ? state.player1Turn : !state.player1Turn}
        />
      </div>
    </GameStateContext.Provider>
  );
};
