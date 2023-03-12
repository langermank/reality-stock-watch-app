import React from "react";
import type { PropsWithChildren } from "react";
import { Button } from "../core/button/Button";
import { Sidebar } from "phosphor-react";

type AppLayoutPublicProps = PropsWithChildren<{
  panelCollapsed?: boolean;
}>;
type NavProps = {
  // state?: "collapsed" | "expanded";
};
type ToggleProps = {
  state?: "collapsed" | "expanded";
};

const Nav: React.FC<PropsWithChildren<NavProps>> = ({ children }): JSX.Element => {
  return <>{children}</>;
};
const Logo: React.FC<PropsWithChildren> = ({ children }): JSX.Element => <>{children}</>;
const Toggle: React.FC<PropsWithChildren> = ({ children }): JSX.Element => <>{children}</>;
const PageNotification: React.FC<PropsWithChildren> = ({ children }): JSX.Element => (
  <>{children}</>
);
const PageTitle: React.FC<PropsWithChildren> = ({ children }): JSX.Element => <>{children}</>;
const PageContent: React.FC<PropsWithChildren> = ({ children }): JSX.Element => (
  <div>{children}</div>
);
const FooterContent: React.FC<PropsWithChildren> = ({ children }): JSX.Element => (
  <div>{children}</div>
);
const LoginButton: React.FC<PropsWithChildren> = ({ children }): JSX.Element => <>{children}</>;

export function AppLayoutPublic({ children, panelCollapsed }: AppLayoutPublicProps) {
  const slots = {
    nav: null,
    logo: null,
    toggle: null,
    pageNotification: null,
    pageTitle: null,
    pageContent: null,
    footerContent: null,
    loginButton: null,
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
    if (child.type === PageContent) {
      slots.pageContent = child;
      return;
    }
    if (child.type === FooterContent) {
      slots.footerContent = child;
      return;
    }
    if (child.type === LoginButton) {
      slots.loginButton = child;
      return;
    }
  });

  return (
    <div className='AppLayoutPublic'>
      <header className='AppLayoutPublic-header'>
        <div className='AppLayoutPublic-header--wrap'>
          <div className='AppLayoutPublic-header--logo'>{slots.logo}</div>
          <nav className='AppLayoutPublic-header--nav'>{slots.nav}</nav>
          <div className='AppLayoutPublic-header--login'>{slots.loginButton}</div>
        </div>
      </header>
      <div className='AppLayoutPublic-content'>
        <main>{slots.pageContent}</main>
        <footer>{slots.footerContent}</footer>
      </div>
    </div>
  );
}

AppLayoutPublic.Nav = Nav;
AppLayoutPublic.Logo = Logo;
AppLayoutPublic.Toggle = Toggle;
AppLayoutPublic.PageNotification = PageNotification;
AppLayoutPublic.PageTitle = PageTitle;
AppLayoutPublic.PageContent = PageContent;
AppLayoutPublic.FooterContent = FooterContent;
AppLayoutPublic.LoginButton = LoginButton;
