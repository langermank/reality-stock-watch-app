import React, { forwardRef, useMemo } from "react";
import { Warning, WarningOctagon, CircleWavyCheck } from "phosphor-react";
import { guid } from "../../../utils/uuid-generator";
import clsx from "clsx";

export type InputProps = {
  label: string;
  hint?: string;
  validationMessage?: string;
  disabled?: boolean;
  id: string;
  sizeVariant?: "default" | "small";
  state?: "warning" | "error" | "success";
  icon?: React.ReactNode;
  fullWidth?: boolean;
  visuallyHideLabel?: boolean;
} & React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      disabled,
      id,
      label,
      sizeVariant = "default",
      icon,
      hint,
      validationMessage,
      state,
      fullWidth,
      visuallyHideLabel,
      ...rest
    },
    ref
  ) => {
    const hintTextId = useMemo(() => guid("hint-text"), []);
    const validationId = useMemo(() => guid("validation-id"), []);

    const ariaDescribedBy = `${hint ? hintTextId : ""} ${validationMessage ? validationId : ""}`;

    return (
      <div className='InputLayout' data-fullWidth={fullWidth ? "true" : undefined}>
        <span className={clsx("InputLabelWrap", visuallyHideLabel && "visuallyHidden")}>
          <label htmlFor={id} className={clsx("Input-label")}>
            {label}
          </label>
          {hint && (
            <span id={hintTextId} className='Input-hint'>
              {hint}
            </span>
          )}
        </span>
        <span className='InputWrap'>
          {icon && <span className='IconWrap'>{icon}</span>}
          <input
            className={icon ? "Input--icon Input" : "Input"}
            disabled={disabled}
            id={id}
            data-size={sizeVariant}
            aria-describedby={ariaDescribedBy || undefined}
            ref={ref}
            {...rest}
          />
        </span>
        {validationMessage && (
          <span className='Input-validation' data-state={state} id={validationId}>
            {state === "error" && <WarningOctagon />}
            {state === "warning" && <Warning />}
            {state === "success" && <CircleWavyCheck />}
            <p>{validationMessage}</p>
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
