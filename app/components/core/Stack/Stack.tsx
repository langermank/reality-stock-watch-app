import React from "react";

// interface Thingamajig {
//   id: ID;
//   text: string;
// }

// interface Props {
//   propWhichIsArray: Thingamajig[];
// }

export type StackProps = {
  children?: React.ReactNode;
  direction?: "inline" | "block";
  gap?: "none" | "condensed" | "normal" | "spacious";
  align?: "start" | "center" | "end" | "baseline";
  alignWrap?: "start" | "center" | "end" | "distribute" | "distributeEvenly";
  spread?: "start" | "center" | "end" | "distribute" | "distributeEvenly";
  //   wrap?: "wrap" | "nowrap";
  wrap?: boolean;
  //   responsiveVariant?: narrow: []
};

export type ResponsiveProps = {
  narrow: StackProps[];
};

export function Stack({
  children,
  direction = "block",
  gap = "normal",
  align = "start",
  alignWrap = "start",
  spread = "start",
  wrap = false,
}: StackProps) {
  return (
    <div
      className='Stack'
      data-wrap={wrap ? "true" : undefined}
      data-dir={direction}
      data-gap={gap}
      data-align={align}
      data-align-wrap={alignWrap}
      data-spread={spread}
      data-responsive='one two'
    >
      {children}
    </div>
  );
}
