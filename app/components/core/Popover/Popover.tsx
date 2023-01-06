import React, { useRef } from "react";
import type { PropsWithChildren } from "react";
import { DismissButton, Overlay, usePopover } from "react-aria";

export type PopoverProps = {
  offset?: number;
};

// TODO: figure out how to get types for these props
export const Popover = ({
  children,
  state,
  offset = 8,
  ...props
}: PropsWithChildren<PopoverProps>) => {
  //   const popoverRef = useRef<HTMLDivElement>(null);
  let popoverRef = useRef();
  let { popoverProps, underlayProps, placement } = usePopover(
    {
      ...props,
      offset,
      popoverRef,
    },
    state
  );

  return (
    <Overlay>
      <div {...underlayProps} style={{ position: "fixed", inset: 0 }} />
      <div
        {...popoverProps}
        ref={popoverRef}
        className="DropdownMenu-overlay"
        style={{
          ...popoverProps.style,
        }}
      >
        <DismissButton onDismiss={state.close} />
        {children}
        <DismissButton onDismiss={state.close} />
      </div>
    </Overlay>
  );
};

Popover.displayName = "Popover";
