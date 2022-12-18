import React, { PropsWithChildren, forwardRef, type Ref } from "react";
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
  trailingActionIcon?: React.ReactNode;
  alignContent?: "center" | "start";
  ariaLabelledById?: string;
  id?: string;
  // ref?: Ref<HTMLButtonElement>;
};

export const Button = ({
  onClick,
  disabled,
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
  id,
}: PropsWithChildren<ButtonProps>) => {
  return (
    <button
      onClick={onClick}
      className={clsx("Button", iconOnly && "Button-iconOnly")}
      disabled={disabled}
      aria-labelledby={ariaLabelledById}
      data-variant={variant}
      data-size={size}
      data-width={!iconOnly && width}
      data-trailing-action={trailingActionIcon ? "true" : undefined}
      id={id}
    >
      {!iconOnly && (
        <>
          <span
            className="Button-content"
            data-icon-position={!iconOnly && iconPosition}
            data-align-content={alignContent}
          >
            {icon && <span className="Button-icon">{icon}</span>}
            <span className="Button-label">{children}</span>
          </span>
          {trailingActionIcon}
        </>
      )}
      {iconOnly && (
        <>
          <span className="Button-icon">{icon}</span>
          <span hidden id={ariaLabelledById}>
            {children}
          </span>
          {trailingActionIcon}
        </>
      )}
    </button>
  );
};

Button.displayName = "Button";

// TODO: pass ref and ...rest to access all default button types

// https://react-typescript-cheatsheet.netlify.app/docs/advanced/patterns_by_usecase/

// export type Ref = HTMLButtonElement;

// export const Button = forwardRef<Ref, ButtonProps>(
//   (
//     {
//       onClick,
//       disabled,
//       children,
//       size,
//       width,
//       variant,
//       icon,
//       iconOnly,
//       iconPosition,
//       trailingActionIcon,
//       alignContent,
//       ariaLabelledById,
//       id,
//       ...rest
//     },
//     ref
//   ) => {
//     return ()});
