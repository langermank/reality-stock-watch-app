import React from "react";

export type StackProps = {
  children?: React.ReactNode;
  modifier?: "expand" | "keepSize" | undefined;
};

export function Stack({ children, modifier }: StackProps) {
  return (
    <div className='Stack-item' data-modifier={modifier}>
      {children}
    </div>
  );
}
