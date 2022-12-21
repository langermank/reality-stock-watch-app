import React, { useRef, Children, PropsWithChildren, forwardRef, type Ref } from "react";
import { DismissButton, Overlay, usePopover } from "react-aria";

export type PopoverProps = {
  offset?: number;
};

// TODO: ask Kiran about the difference between const and function
// TODO: figure out how to get types for these props
export const Popover = ({
  children,
  state,
  offset = 8,
  ...props
}: PropsWithChildren<PopoverProps>) => {
  let popoverRef = useRef();
  let { popoverProps, underlayProps, arrowProps, placement } = usePopover(
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
        style={{
          ...popoverProps.style,
          background: "lightgray",
          border: "1px solid gray",
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
