import React from "react";
import type { PropsWithChildren } from "react";
import type { ResponsivePropsType } from "../../../utils/responsive-variant";
import { convertToResponsiveAttributes } from "../../../utils/responsive-variant";

export type StackItemProps = {
  modifier?: "expand" | "keepSize" | undefined;
};

export type ResponsiveStackProps = PropsWithChildren<ResponsivePropsType<StackItemProps>>;

export function StackItem({ children, modifier }: ResponsiveStackProps) {
  const dataAttributes = convertToResponsiveAttributes({
    responsiveProps: {
      modifier,
    },
  });

  return (
    <div className='StackItem' {...dataAttributes}>
      {children}
    </div>
  );
}
