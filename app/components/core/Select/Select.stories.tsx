import React from "react";
import type { ComponentMeta, ComponentStory } from "@storybook/react";
import { Select } from "./Select";

export default {
  title: "Components/Select",
  component: Select,
  args: {
    label: "Label",
    placeholder: "Placeholder",
    fullWidth: false,
    id: "select-id",
  },
} as ComponentMeta<typeof Select>;

export const Playground: ComponentStory<typeof Select> = (args) => <Select {...args} />;
