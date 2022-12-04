import React from "react";

export type CardProps = {
  variant?:
    | "positive"
    | "negative"
    | "warning"
    | "neutral"
    | "gold"
    | "silver"
    | "bronze"
    | undefined;
  padding?: "normal" | "condensed" | "spacious";
  children?: React.ReactNode;
};

export function Card({ variant, padding = "normal", children }: CardProps) {
  return (
    <div className="Card" data-variant={variant} data-padding={padding}>
      {children}
    </div>
  );
}
