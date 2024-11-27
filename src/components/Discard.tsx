import React from "react";
import { Card } from "../cards";
import { CardComponent } from "./Card";
import "./Discard.css";

export type DiscardProps = {
  cards: Card[];
};

export const Discard: React.FC<DiscardProps> = ({ cards }) => (
  <div className="discard">
    {cards.map((card, i) => (
      <div
        className="discard-card"
        style={{ zIndex: -i, left: -i * 25 }}
        key={card}
      >
        <CardComponent card={card} />
      </div>
    ))}
  </div>
);
