import React from "react";

export type ContainerProps = {
  width?: "small" | "medium" | "large";
  children?: React.ReactNode;
};

export function Container({ width = "medium", children }: ContainerProps) {
  return (
    <div className='Container' data-width={width}>
      {children}
    </div>
  );
}

Container.displayName = "Container";
