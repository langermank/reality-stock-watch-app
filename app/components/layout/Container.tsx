import React from "react";

export type ContainerProps = {
  width?: "sm" | "md" | "lg";
  children?: React.ReactNode;
};

export function Container({ width = "md", children }: ContainerProps) {
  return (
    <div className='Container' data-width={width}>
      {children}
    </div>
  );
}

Container.displayName = "Container";
