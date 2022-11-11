import React from "react";
import PropTypes from "prop-types";
import clsx from 'clsx';

const Button = React.forwardRef(
  (
    {
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
      className,
      id,
      ...other
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        onClick={onClick}
        className={clsx('Button', iconOnly && 'Button-iconOnly', className)}
        disabled={disabled}
        aria-labelledby={ariaLabelledById}
        data-variant={variant}
        data-size={size}
        data-width={!iconOnly && width}
        data-trailing-action={trailingActionIcon ? "true" : undefined}
        id={id}
        {...other}
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
  }
);

Button.propTypes = {
  className: PropTypes.string,
  id: PropTypes.string,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  disabled: PropTypes.bool,
  size: PropTypes.oneOf(["default", "small"]),
  width: PropTypes.oneOf(["default", "fullWidth"]),
  variant: PropTypes.oneOf([
    "secondary",
    "secondaryGhost",
    "primary",
    "primaryGhost",
    "muted",
    "danger",
    "unstyled",
  ]),
  icon: PropTypes.node,
  iconOnly: PropTypes.bool,
  iconPosition: PropTypes.oneOf(["left", "right"]),
  alignContent: PropTypes.oneOf(["center", "start"]),
  ariaLabelledById: PropTypes.string,
  trailingActionIcon: PropTypes.node,
  // ref: PropTypes.string,
};

Button.defaultProps = {
  className: null,
  children: null,
  disabled: false,
  size: "default",
  width: "default",
  variant: "secondary",
  icon: null,
  iconOnly: false,
  iconPosition: "left",
  alignContent: "center",
  ariaLabelledById: "",
  id: "",
  trailingActionIcon: null,
  // ref: null,
};

export default Button;

Button.displayName = "Button";
