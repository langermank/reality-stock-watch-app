import { FileX, CaretDown } from "phosphor-react";
import type { ComponentMeta, ComponentStory } from "@storybook/react";
import React from "react";
import { AppLayout } from "./AppLayout";

export default {
  title: "App/AppLayout",
  component: AppLayout,
} as ComponentMeta<typeof AppLayout>;

export const Playground: ComponentStory<typeof AppLayout> = (args) => (
  <AppLayout>
    <AppLayout.Nav>
      <button>hey</button>
    </AppLayout.Nav>
    <AppLayout.Logo>
      <img src='/' />
    </AppLayout.Logo>
  </AppLayout>
);
