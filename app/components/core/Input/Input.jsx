import React from "react";
import PropTypes from "prop-types";
import { Warning, WarningOctagon, CircleWavyCheck } from "phosphor-react";

const Input = ({
  className,
  disabled,
  id,
  label,
  width,
  size,
  icon,
  hint,
  validationMessage,
  state,
  ...other
}) => {
  return (
    <div class="InputLabelWrap">
      <label for={id} class="Input-label">
        {label}
      </label>
      <div class="InputWrap">
        {icon && <span class="IconWrap">{icon}</span>}
        <input
          className={icon ? "Input--icon Input" : "Input"}
          disabled={disabled}
          id={id}
          data-width={width}
          data-size={size}
          {...other}
        />
        {hint && <span className="Input-hint">{hint}</span>}
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
  width: PropTypes.oneOf(["default", "fullWidth"]),
  size: PropTypes.oneOf(["default", "small"]),
  state: PropTypes.oneOf(["warning", "error", "success"]),
  icon: PropTypes.node,
};

Input.defaultProps = {
  className: null,
  disabled: false,
  id: "",
  width: "default",
  size: "default",
  icon: null,
  hint: null,
  validationMessage: null,
  state: null,
};

export default Input;
