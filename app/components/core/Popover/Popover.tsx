import React, { useRef } from "react";
import type { PropsWithChildren } from "react";
import { DismissButton, Overlay, usePopover } from "react-aria";

export type PopoverProps = {
  offset?: number;
  placement?:
    | "bottom"
    | "bottom left"
    | "bottom right"
    | "bottom start"
    | "bottom end"
    | "top"
    | "top left"
    | "top right"
    | "top start"
    | "top end"
    | "left"
    | "left top"
    | "left bottom"
    | "start"
    | "start top"
    | "start bottom"
    | "right"
    | "right top"
    | "right bottom"
    | "end"
    | "end top"
    | "end bottom";
};

// TODO: figure out how to get types for these props
export const Popover = ({
  children,
  state,
  offset = 8,
  placement = "bottom left",
  ...props
}: PropsWithChildren<PopoverProps>) => {
  //   const popoverRef = useRef<HTMLDivElement>(null);
  let popoverRef = useRef();
  let overlayRef = useRef();
  let { popoverProps, underlayProps } = usePopover(
    {
      ...props,
      offset,
      popoverRef,
      overlayRef,
      scrollRef: overlayRef,
    },
    state
  );

  console.log(popoverProps, "placement", placement, underlayProps, props.triggerRef as any, offset);
  return (
    <Overlay>
      <div ref={overlayRef} {...underlayProps} style={{ position: "fixed", inset: 0 }} />
      <div
        {...popoverProps}
        ref={popoverRef}
        // className="DropdownMenu-overlay"
        // style={{
        //   ...popoverProps.style,
        // }}
      >
        <DismissButton onDismiss={state.close} />
        {children}
        <DismissButton onDismiss={state.close} />
      </div>
    </Overlay>
  );
};

Popover.displayName = "Popover";
