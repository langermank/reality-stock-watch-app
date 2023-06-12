import React from "react";

export type TextProps = {
  children?: React.ReactNode;
  size?: "small" | "medium" | "large";
  weight?: "regular" | "semibold";
};

export function Text({ children, size, weight }: TextProps) {
  return (
    <p className='Text' data-size={size} data-weight={weight}>
      {children}
    </p>
  );
}
