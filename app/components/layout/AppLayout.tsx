import React from "react";
import type { PropsWithChildren } from "react";
import { Button } from "../core/button/Button";
import { Sidebar } from "phosphor-react";

type AppLayoutProps = PropsWithChildren<{
  panelCollapsed?: boolean;
}>;
type NavProps = {
  // state?: "collapsed" | "expanded";
};
type ToggleProps = {
  state?: "collapsed" | "expanded";
};

const Nav: React.FC<PropsWithChildren<NavProps>> = ({ children }): JSX.Element => {
  return <div>{children}</div>;
};
const Logo: React.FC<PropsWithChildren> = ({ children }): JSX.Element => <>{children}</>;
const Toggle: React.FC<PropsWithChildren> = ({ children }): JSX.Element => <>{children}</>;
const PageNotification: React.FC<PropsWithChildren> = ({ children }): JSX.Element => (
  <>{children}</>
);
const PageTitle: React.FC<PropsWithChildren> = ({ children }): JSX.Element => <>{children}</>;
const PageContent: React.FC<PropsWithChildren> = ({ children }): JSX.Element => <>{children}</>;
const FooterContent: React.FC<PropsWithChildren> = ({ children }): JSX.Element => (
  <div>{children}</div>
);

export function AppLayout({ children, panelCollapsed }: AppLayoutProps) {
  const slots = {
    nav: null,
    logo: null,
    toggle: null,
    pageNotification: null,
    pageTitle: null,
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
    if (child.type === PageTitle) {
      slots.pageTitle = child;
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
  let [collapsePanel, setcollapsePanel] = React.useState(false);
  return (
    <div className='AppLayout' data-panel-collapsed={panelCollapsed}>
      <header className='AppLayout-header'>
        <div className='AppLayout-header--control' data-id='sidepane-control'>
          <div className='AppLayout-header--logo'>{slots.logo}</div>
          {slots.toggle}
        </div>
        <div className='AppLayout-header--topbar' data-id='notifications'>
          <div className='AppLayout-header--title'>{slots.pageTitle}</div>
          <div className='AppLayout-header--notif'>{slots.pageNotification}</div>
        </div>
      </header>
      <div
        className='AppLayout-sidebar'
        // data-state={collapsePanel ? "collapsed" : "expanded"}
        data-id='sidepanel'
      >
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
AppLayout.PageTitle = PageTitle;
AppLayout.PageContent = PageContent;
AppLayout.FooterContent = FooterContent;
