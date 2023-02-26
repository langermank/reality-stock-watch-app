import React, { forwardRef } from "react";
import type { PropsWithChildren } from "react";
import clsx from "clsx";

export type ButtonProps = {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  size?: "small" | "default";
  width?: "default" | "full";
  variant?:
    | "primary"
    | "primaryGhost"
    | "secondary"
    | "secondaryGhost"
    | "muted"
    | "danger"
    | "unstyled";
  icon?: React.ReactNode;
  iconOnly?: boolean;
  iconPosition?: "left" | "right";
  iconSpacing?: "default" | "spacious";
  trailingActionIcon?: React.ReactNode;
  alignContent?: "center" | "start";
  ariaLabelledById?: string;
  id?: string;
  className?: string;
} & React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;

type ButtonPropsWithChildren = PropsWithChildren<ButtonProps>;

export const Button = forwardRef<HTMLButtonElement, ButtonPropsWithChildren>(
  (
    {
      children,
      size,
      width,
      variant,
      icon,
      iconOnly,
      iconPosition,
      iconSpacing,
      trailingActionIcon,
      alignContent,
      ariaLabelledById,
      className,
      ...rest
    },
    ref
  ) => {
    return (
      <button
        className={clsx("Button", iconOnly && "Button-iconOnly", className && className)}
        aria-labelledby={ariaLabelledById}
        data-variant={variant}
        data-size={size}
        data-width={width ? width : undefined}
        data-trailing-action={trailingActionIcon ? "true" : undefined}
        ref={ref}
        {...rest}
      >
        {!iconOnly && (
          <>
            <span
              className='Button-content'
              data-icon-position={!iconOnly && iconPosition}
              data-icon-spacing={!iconOnly && iconSpacing}
              data-align-content={alignContent}
            >
              {icon && <span className='Button-icon'>{icon}</span>}
              <span className='Button-label'>{children}</span>
            </span>
            {trailingActionIcon}
          </>
        )}
        {iconOnly && trailingActionIcon && (
          <>
            <span hidden id={ariaLabelledById}>
              {children}
            </span>
            {trailingActionIcon}
          </>
        )}
        {iconOnly && !trailingActionIcon && (
          <>
            <span className='Button-icon'>{icon}</span>
            <span hidden id={ariaLabelledById}>
              {children}
            </span>
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
