import React from "react";

import Select from "./Select.jsx";

export default {
  title: "Components/Select",
  component: Select,
  args: {
    label: "Label",
    placeholder: "Placeholder",
    fullWidth: false,
    id: "select-id"
  },
};

export const Playground = (args) => <Select {...args} />;
