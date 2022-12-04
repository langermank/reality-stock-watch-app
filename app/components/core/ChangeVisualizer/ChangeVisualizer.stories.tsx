import React from "react";
import { ChangeVisualizer } from "./ChangeVisualizer.tsx";

export default {
  title: "Components/ChangeVisualizer",
  component: ChangeVisualizer,
  args: {
    label: "$500",
  },
};

export const Playground = (args) => <ChangeVisualizer {...args} />;
