import React from "react";
import { CardBack } from "./CardBack";
import "./Hand.css";

export type OpponentHandProps = {
  numCards: number;
};

export const OpponentHand: React.FC<OpponentHandProps> = ({ numCards }) => (
  <div className="hand">
    {Array.from({ length: numCards }, (_, i) => (
      <div className="card">
        <CardBack key={i} />
      </div>
    ))}
  </div>
);
