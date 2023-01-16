import React from "react";
import { ArrowSquareUp, ArrowSquareDown, DiceOne } from "phosphor-react";

export type ChangeVisualizerProps = {
  changeState?: "increase" | "decrease" | "nochange";
  label?: string;
};

export function ChangeVisualizer({ label, changeState = "nochange" }: ChangeVisualizerProps) {
  const icon = () => {
    if (changeState === "increase") {
      return <ArrowSquareUp weight='fill' />;
    } else if (changeState === "decrease") {
      return <ArrowSquareDown weight='fill' />;
    } else {
      return <DiceOne weight='fill' />;
    }
  };
  return (
    <div className='ChangeVisualizer' data-state={changeState}>
      {icon()}
      {label && <p className='ChangeVisualizer-label'>{label}</p>}
    </div>
  );
}
