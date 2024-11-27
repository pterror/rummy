import { Card } from "../cards";
import React from "react";

export type CardProps = {
  card: Card;
  onClick?: (card: Card) => void;
};

export const CardComponent: React.FC<CardProps> = ({ card, onClick }) => (
  <img src={`/cards/${card}.svg`} onPointerUp={() => onClick?.(card)} />
);
