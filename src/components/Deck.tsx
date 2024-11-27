import React from "react";
import { CardBack } from "./CardBack";
import "./Deck.css";

export type DeckProps = {
  numCards: number;
};

export const Deck: React.FC<DeckProps> = ({ numCards }) => (
  <div className="deck">
    <CardBack
      style={{
        boxShadow: Array.from(
          { length: numCards },
          (_, i) => `${i + 1}px ${i + 1}px 0 1px lightgray`
        ).join(","),
      }}
    />
  </div>
);
