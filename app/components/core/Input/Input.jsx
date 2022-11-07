import React from "react";
import PropTypes from "prop-types";
import { Warning, WarningOctagon, CircleWavyCheck } from "phosphor-react";

const Input = ({
  className,
  disabled,
  id,
  label,
  size,
  icon,
  hint,
  validationMessage,
  state,
  fullWidth,
  ...other
}) => {
  return (
    <div class="InputLayout" data-fullWidth={fullWidth ? "true" : undefined}>
      <span class="InputLabelWrap">
        <label for={id} class="Input-label">
          {label}
        </label>
        {hint && <span className="Input-hint">{hint}</span>}
      </span>
      <div class="InputWrap">
        {icon && <span class="IconWrap">{icon}</span>}
        <input
          className={icon ? "Input--icon Input" : "Input"}
          disabled={disabled}
          id={id}
          data-size={size}
          {...other}
        />
        {validationMessage && (
          <span className="Input-validation" data-state={state}>
            {state === "error" && <WarningOctagon />}
            {state === "warning" && <Warning />}
            {state === "success" && <CircleWavyCheck />}
            <p>{validationMessage}</p>
          </span>
        )}
      </div>
    </div>
  );
};

Input.propTypes = {
  className: PropTypes.string,
  label: PropTypes.string.isRequired,
  hint: PropTypes.string,
  validationMessage: PropTypes.string,
  disabled: PropTypes.bool,
  id: PropTypes.string,
  size: PropTypes.oneOf(["default", "small"]),
  state: PropTypes.oneOf(["warning", "error", "success"]),
  icon: PropTypes.node,
  fullWidth: PropTypes.bool,
};

Input.defaultProps = {
  className: null,
  disabled: false,
  id: "",
  width: null,
  size: "default",
  icon: null,
  hint: null,
  validationMessage: null,
  state: null,
  fullWidth: false,
};

export default Input;
