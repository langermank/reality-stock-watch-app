import { Sidebar, Heart } from "phosphor-react";
import type { ComponentMeta, ComponentStory } from "@storybook/react";
import React from "react";
import { AppLayout } from "./AppLayout";
import { Button } from "../core/button/Button";
import { Card } from "../core/Card/Card";
import { MenuNavLink } from "../core/NavList/NavLink";
import { NavList } from "../core/NavList/NavList";
import { MenuButton } from "../core/DropdownMenu/DropdownMenu";
import { Item } from "@react-stately/collections";

export default {
  title: "App/AppLayout",
  component: AppLayout,
  layout: "fullscreen",
} as ComponentMeta<typeof AppLayout>;

export const Playground: ComponentStory<typeof AppLayout> = (args) => {
  let [open, setOpen] = React.useState(false);
  let [panelState, setpanelState] = React.useState(false);
  return (
    <AppLayout panelCollapsed={panelState}>
      <AppLayout.Logo>StockWatch</AppLayout.Logo>
      <AppLayout.Toggle>
        <Button
          iconOnly
          icon={<Sidebar />}
          size='small'
          variant='muted'
          // set panel state to expanded or collapsed
          onClick={() => setpanelState(!panelState)}
        ></Button>
      </AppLayout.Toggle>
      <AppLayout.PageNotification>
        <Card variant='neutral'>The market opens in 5 hours!</Card>
      </AppLayout.PageNotification>
      <AppLayout.Nav>
        <NavList {...args}>
          <MenuNavLink to='/' icon={<Heart />}>
            First
          </MenuNavLink>
          <MenuNavLink to='/' icon={<Heart />}>
            Second
          </MenuNavLink>
          <MenuNavLink to='/' icon={<Heart />}>
            Third
          </MenuNavLink>
          <MenuButton
            isOpen={open}
            onOpenChange={setOpen}
            icon={<Heart />}
            iconSpacing='spacious'
            iconOnly={panelState}
            label='Actions'
            onAction={(key) => {
              alert(key);
            }}
            width='full'
          >
            <Item key='copy'>Copy</Item>
            <Item key='cut'>Cut</Item>
            <Item key='paste'>Paste</Item>
            <Item key='view' href='https://google.com'>
              View
            </Item>
          </MenuButton>
        </NavList>
      </AppLayout.Nav>
      <AppLayout.PageContent>
        <div>Page Content</div>
      </AppLayout.PageContent>
      <AppLayout.FooterContent>Footer</AppLayout.FooterContent>
    </AppLayout>
  );
};
