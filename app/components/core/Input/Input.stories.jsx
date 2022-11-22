import { MagnifyingGlass } from "phosphor-react";
import React from "react";

import Input from "./Input.jsx";

export default {
  title: "Components/Input",
  component: Input,
  args: {
    label: "Label",
    placeholder: "Placeholder",
    fullWidth: false,
  },
};

export const Playground = (args) => <Input {...args} />;

export const WithIcon = (args) => <Input {...args} />;
WithIcon.args = {
  icon: <MagnifyingGlass />,
};
