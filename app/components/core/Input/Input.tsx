import React, { useMemo } from "react";
import { Warning, WarningOctagon, CircleWavyCheck } from "phosphor-react";
import { guid } from "../../../utils/uuid-generator";

export type InputProps = {
  label: string;
  hint?: string;
  validationMessage?: string;
  disabled?: boolean;
  id?: string;
  size?: "default" | "small";
  state?: "warning" | "error" | "success";
  icon?: React.ReactNode;
  fullWidth?: boolean;
};

// TODO: Q for Kiran, should we be doing default exports?
export const Input = ({
  disabled,
  id,
  label,
  size,
  icon,
  hint,
  validationMessage,
  state,
  fullWidth,
}: InputProps) => {
  const hintTextId = useMemo(() => guid("hint-text"), []);
  const validationId = useMemo(() => guid("validation-id"), []);

  const ariaDescribedBy = `${hint ? hintTextId : ""} ${validationMessage ? validationId : ""}`;

  return (
    <div className="InputLayout" data-fullWidth={fullWidth ? "true" : undefined}>
      <span className="InputLabelWrap">
        <label htmlFor={id} className="Input-label">
          {label}
        </label>
        {hint && (
          <span id={hintTextId} className="Input-hint">
            {hint}
          </span>
        )}
      </span>
      <div className="InputWrap">
        {icon && <span className="IconWrap">{icon}</span>}
        <input
          className={icon ? "Input--icon Input" : "Input"}
          disabled={disabled}
          id={id}
          data-size={size}
          aria-describedby={ariaDescribedBy || undefined}
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
