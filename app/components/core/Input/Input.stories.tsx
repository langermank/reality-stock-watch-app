import { MagnifyingGlass } from "phosphor-react";
import React from "react";
import type { ComponentMeta, ComponentStory } from "@storybook/react";
import { Input } from "./Input";

export default {
  title: "Components/Input",
  component: Input,
  args: {
    label: "Label",
    placeholder: "Placeholder",
    fullWidth: false,
  },
} as ComponentMeta<typeof Input>;

export const Playground: ComponentStory<typeof Input> = (args) => <Input {...args} />;

export const WithIcon: ComponentStory<typeof Input> = (args) => <Input {...args} />;
WithIcon.args = {
  icon: <MagnifyingGlass />,
};
