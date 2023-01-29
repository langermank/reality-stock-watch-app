import { Sidebar } from "phosphor-react";
import type { ComponentMeta, ComponentStory } from "@storybook/react";
import React from "react";
import { AppLayout } from "./AppLayout";
import { Button } from "../core/button/Button";
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
  return (
    <AppLayout>
      <AppLayout.Logo>StockWatch</AppLayout.Logo>
      <AppLayout.Toggle>
        <Button iconOnly icon={<Sidebar />} size='small' variant='muted'></Button>
      </AppLayout.Toggle>
      <AppLayout.PageNotification>Notification</AppLayout.PageNotification>
      <AppLayout.Nav>
        <NavList {...args}>
          <MenuNavLink to='/'>First</MenuNavLink>
          <MenuNavLink to='/'>Second</MenuNavLink>
          <MenuNavLink to='/'>Third</MenuNavLink>
          <MenuButton
            isOpen={open}
            onOpenChange={setOpen}
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
