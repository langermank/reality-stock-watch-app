import React, { useMemo } from "react";
import { Warning, WarningOctagon, CircleWavyCheck } from "phosphor-react";
import { guid } from "../../../utils/uuid-generator";

// TODO: map through select options

export type SelectProps = {
  label: string;
  hint?: string;
  validationMessage?: string;
  disabled?: boolean;
  id?: string;
  size?: "default" | "small";
  state?: "warning" | "error" | "success";
  fullWidth?: boolean;
};

export const Select = ({
  disabled,
  id,
  label,
  size = "default",
  hint,
  validationMessage,
  state,
  fullWidth,
}: SelectProps) => {
  const hintTextId = useMemo(() => guid("hint-text"), []);
  const validationId = useMemo(() => guid("validation-id"), []);

  const ariaDescribedBy = `${hint ? hintTextId : ""} ${validationMessage ? validationId : ""}`;

  return (
    <div className='InputLayout' data-fullWidth={fullWidth ? "true" : undefined}>
      <span className='InputLabelWrap'>
        <label htmlFor={id} className='Input-label'>
          {label}
        </label>
        {hint && (
          <span id={hintTextId} className='Input-hint'>
            {hint}
          </span>
        )}
      </span>
      <div className='SelectWrap'>
        <select
          className='Select'
          disabled={disabled}
          id={id}
          data-size={size}
          aria-describedby={ariaDescribedBy || undefined}
        >
          <option value='1'>Tempy temp</option>
        </select>
        {validationMessage && (
          <span id={validationId} className='Input-validation' data-state={state}>
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
