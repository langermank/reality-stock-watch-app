import React from "react";
import type { PropsWithChildren } from "react";

type AppLayoutProps = PropsWithChildren<{}>;
type NavProps = {
  open?: boolean;
};

const Nav: React.FC<PropsWithChildren<NavProps>> = ({ children, open }): JSX.Element => {
  return <div data-id={open ? "open" : "closed"}>{children}</div>;
};
const Logo: React.FC<PropsWithChildren> = ({ children }): JSX.Element => <div>{children}</div>;
const Toggle: React.FC<PropsWithChildren> = ({ children }): JSX.Element => <div>{children}</div>;
const PageNotification: React.FC<PropsWithChildren> = ({ children }): JSX.Element => (
  <div className='AppLayout-header--notif' data-id='notifications'>
    {children}
  </div>
);
const PageContent: React.FC<PropsWithChildren> = ({ children }): JSX.Element => (
  <div>{children}</div>
);
const FooterContent: React.FC<PropsWithChildren> = ({ children }): JSX.Element => (
  <div>{children}</div>
);

export function AppLayout({ children }: AppLayoutProps) {
  const slots = {
    nav: null,
    logo: null,
    toggle: null,
    pageNotification: null,
    pageContent: null,
    footerContent: null,
  };
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    if (child.type === Nav) {
      slots.nav = child;
      return;
    }
    if (child.type === Logo) {
      slots.logo = child;
      return;
    }
    if (child.type === Toggle) {
      slots.toggle = child;
      return;
    }
    if (child.type === PageNotification) {
      slots.pageNotification = child;
      return;
    }
    if (child.type === PageContent) {
      slots.pageContent = child;
      return;
    }
    if (child.type === FooterContent) {
      slots.footerContent = child;
      return;
    }
  });
  return (
    <div className='AppLayout'>
      <header className='AppLayout-header'>
        <div className='AppLayout-header--control' data-id='sidepane-control'>
          {slots.logo}
          {slots.toggle}
        </div>
        {slots.pageNotification}
      </header>
      <div className='AppLayout-sidebar' data-state='open' data-id='sidepanel'>
        <div data-id='sidepane'>{slots.nav}</div>
      </div>
      <div className='AppLayout-content'>
        <main>{slots.pageContent}</main>
        <footer>{slots.footerContent}</footer>
      </div>
    </div>
  );
}

AppLayout.Nav = Nav;
AppLayout.Logo = Logo;
AppLayout.Toggle = Toggle;
AppLayout.PageNotification = PageNotification;
AppLayout.PageContent = PageContent;
AppLayout.FooterContent = FooterContent;
