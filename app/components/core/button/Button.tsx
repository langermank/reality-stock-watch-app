import React, { forwardRef } from "react";
import type { PropsWithChildren } from "react";
import clsx from "clsx";

// TODO: how to get PropsWithChildren in here?
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
              data-align-content={alignContent}
            >
              {icon && <span className='Button-icon'>{icon}</span>}
              <span className='Button-label'>{children}</span>
            </span>
            {trailingActionIcon}
          </>
        )}
        {iconOnly && (
          <>
            <span className='Button-icon'>{icon}</span>
            <span hidden id={ariaLabelledById}>
              {children}
            </span>
            {trailingActionIcon}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
