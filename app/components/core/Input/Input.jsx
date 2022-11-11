import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Warning, WarningOctagon, CircleWavyCheck } from "phosphor-react";
import { guid } from "../../../utils/uuid-generator";

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

  const hintTextId = useMemo(() => guid("hint-text"), []);
  const validationId = useMemo(() => guid("validation-id"), []);

  const ariaDescribedBy = `${(hint ? hintTextId : '')} ${(validationMessage ? validationId : '')}`;

  return (
    <div className="InputLayout" data-fullWidth={fullWidth ? "true" : undefined}>
      <span className="InputLabelWrap">
        <label htmlFor={id} className="Input-label">
          {label}
        </label>
        {hint && <span id={hintTextId} className="Input-hint">{hint}</span>}
      </span>
      <div className="InputWrap">
        {icon && <span className="IconWrap">{icon}</span>}
        <input
          className={icon ? "Input--icon Input" : "Input"}
          disabled={disabled}
          id={id}
          data-size={size}
          aria-describedby={ariaDescribedBy || undefined}
          {...other}
        />
        {validationMessage && (
          <span id={validationId} className="Input-validation" data-state={state}>
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
