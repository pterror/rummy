import React from "react";

export type CardBackProps = {
  style?: React.CSSProperties;
};

export const CardBack: React.FC<CardBackProps> = ({ style }) => (
  <img src={"/cards/back.svg"} style={style} />
);
