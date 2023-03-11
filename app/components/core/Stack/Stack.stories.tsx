import type { ComponentMeta, ComponentStory } from "@storybook/react";
import React from "react";
import { Stack } from "./Stack";
import { StackItem } from "./StackItem";
import { Card } from "../Card/Card";

export default {
  title: "Components/Stack",
  component: Stack,
  argTypes: {
    direction: {
      control: {
        type: "radio",
        options: ["inline", "block"],
      },
    },
    gap: {
      control: {
        type: "radio",
        options: ["none", "condensed", "normal"],
      },
    },
    align: {
      control: {
        type: "radio",
        options: ["start", "center", "end", "baseline"],
      },
    },
    alignWrap: {
      control: {
        type: "radio",
        options: ["start", "center", "end", "distribute", "distributeEvenly"],
      },
    },
    spread: {
      control: {
        type: "radio",
        options: ["start", "center", "end", "distribute", "distributeEvenly"],
      },
    },
    wrap: {
      control: {
        type: "radio",
        options: ["wrap", "nowrap"],
      },
    },
  },
} as ComponentMeta<typeof Stack>;

export const Playground: ComponentStory<typeof Stack> = (args) => (
  <>
    <Stack {...args}>
      <Card>Item 1</Card>
      <Card>Item 2</Card>
      <Card>Item 3</Card>
      <StackItem modifier={{ narrow: "keepSize", regular: "expand" }}>
        <Card>Item 3</Card>
      </StackItem>
    </Stack>
  </>
);
