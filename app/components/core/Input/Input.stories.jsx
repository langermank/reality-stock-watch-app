import { FileX, CaretDown } from "phosphor-react";
import React from "react";

import Input from "./Input.jsx";

export default {
  title: "Components/Input",
  component: Input,
  args: {
    label: "Label",
    placeholder: "Placeholder",
  },
};

export const Playground = (args) => <Input {...args} />;
