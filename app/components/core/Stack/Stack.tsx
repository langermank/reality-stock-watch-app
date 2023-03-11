import React from "react";
import type { PropsWithChildren } from "react";
import type { ResponsivePropsType } from "../../../utils/responsive-variant";
import { convertToResponsiveAttributes } from "../../../utils/responsive-variant";

export type StackProps = {
  direction?: "inline" | "block";
  gap?: "none" | "condensed" | "normal" | "spacious";
  align?: "start" | "center" | "end" | "baseline";
  alignWrap?: "start" | "center" | "end" | "distribute" | "distributeEvenly";
  spread?: "start" | "center" | "end" | "distribute" | "distributeEvenly";
  wrap?: boolean;
};

export type ResponsiveStackProps = PropsWithChildren<ResponsivePropsType<StackProps>>;

export function Stack({
  children,
  direction,
  gap = "normal",
  align = "start",
  alignWrap = "start",
  spread = "start",
  wrap = false,
}: ResponsiveStackProps) {
  const dataAttributes = convertToResponsiveAttributes({
    responsiveProps: {
      direction,
      gap,
      align,
      alignWrap,
      spread,
      wrap,
    },
  });

  return (
    <div className='Stack' {...dataAttributes}>
      {children}
    </div>
  );
}
