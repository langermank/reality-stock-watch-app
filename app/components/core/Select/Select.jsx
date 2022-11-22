import React from "react";
import PropTypes from "prop-types";
import { Warning, WarningOctagon, CircleWavyCheck } from "phosphor-react";

const Select = ({
  className,
  disabled,
  id,
  label,
  size,
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
      <div class="SelectWrap">
        <select
          className="Select"
          disabled={disabled}
          id={id}
          data-size={size}
          {...other}
        >
          <option value="1">Tempy temp</option>
        </select>
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

Select.propTypes = {
  className: PropTypes.string,
  label: PropTypes.string.isRequired,
  hint: PropTypes.string,
  validationMessage: PropTypes.string,
  disabled: PropTypes.bool,
  id: PropTypes.string.isRequired,
  size: PropTypes.oneOf(["default", "small"]),
  state: PropTypes.oneOf(["warning", "error", "success"]),
  fullWidth: PropTypes.bool,
};

Select.defaultProps = {
  className: null,
  disabled: false,
  id: "",
  size: "default",
  hint: null,
  validationMessage: null,
  state: null,
  fullWidth: false,
};

export default Select;
