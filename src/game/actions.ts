import { Card, Meld } from "../cards";

export const DRAW_ACTION = "DRAW" as const;
export const actionDraw = (args: { player1: boolean }) => ({
  action: DRAW_ACTION,
  args,
});
export type DrawActionType = ReturnType<typeof actionDraw>;

export const PICKUP_ACTION = "PICKUP" as const;
export const actionPickup = (args: {
  player1: boolean;
  pickupIndex: number;
}) => ({
  action: PICKUP_ACTION,
  args,
});
export type PickupActionType = ReturnType<typeof actionPickup>;

export const DISCARD_ACTION = "DISCARD" as const;
export const actionDiscard = (args: { player1: boolean; card: Card }) => ({
  action: DISCARD_ACTION,
  args,
});
export type DiscardActionType = ReturnType<typeof actionDiscard>;

export const MELD_ACTION = "MELD" as const;
export const actionMeld = (args: {
  player1: boolean;
  cards: Card[];
  existingMeld?: Meld;
}) => ({
  action: MELD_ACTION,
  args,
});
export type MeldActionType = ReturnType<typeof actionMeld>;

export const GO_OUT_ACTION = "GO_OUT" as const;
export const actionGoOut = (args: { player1: boolean }) => ({
  action: GO_OUT_ACTION,
  args,
});
export type GoOutActionType = ReturnType<typeof actionGoOut>;
