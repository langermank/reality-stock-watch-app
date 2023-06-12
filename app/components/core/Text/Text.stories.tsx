import React from "react";
import { Text } from "./Text";

export default {
  title: "Components/Text",
  component: Text,
};

export const Playground = (args) => <Text {...args}>Child</Text>;

export const Networth = (args) => <Text {...args}>Hello</Text>;
