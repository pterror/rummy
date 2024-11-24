import { Card, Meld } from "../cards";

export const DRAW_ACTION = "DRAW" as const;
export const actionDraw = () => ({
  action: DRAW_ACTION,
});
export type DrawActionType = ReturnType<typeof actionDraw>;

export const PICKUP_ACTION = "PICKUP" as const;
export const actionPickup = (args: { pickupIndex: number }) => ({
  action: PICKUP_ACTION,
  args,
});
export type PickupActionType = ReturnType<typeof actionPickup>;

export const DISCARD_ACTION = "DISCARD" as const;
export const actionDiscard = (args: { card: Card }) => ({
  action: DISCARD_ACTION,
  args,
});
export type DiscardActionType = ReturnType<typeof actionDiscard>;

export const MELD_ACTION = "MELD" as const;
export const actionMeld = (args: { cards: Card[]; existingMeld?: Meld }) => ({
  action: MELD_ACTION,
  args,
});
export type MeldActionType = ReturnType<typeof actionMeld>;

export const GO_OUT_ACTION = "GO_OUT" as const;
export const actionGoOut = () => ({
  action: GO_OUT_ACTION,
});
export type GoOutActionType = ReturnType<typeof actionGoOut>;
