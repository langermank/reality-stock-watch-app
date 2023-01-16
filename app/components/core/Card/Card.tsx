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
  title?: string;
  fullWidth?: boolean;
};

export function Card({
  variant,
  padding = "normal",
  children,
  title,
  fullWidth = false,
}: CardProps) {
  return (
    <div
      className='Card'
      data-variant={variant}
      data-padding={padding}
      data-fullwidth={fullWidth}
      data-has-title={title ? "true" : undefined}
    >
      {title && (
        <div className='Card-title' data-padding={padding}>
          {title}
        </div>
      )}
      {title ? (
        <div className='Card-body' data-padding={padding}>
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  );
}
