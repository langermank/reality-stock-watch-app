import React from "react";
import type { PropsWithChildren, FC, FunctionComponent } from "react";
// export type AppLayoutProps = {};

type AppLayoutProps = PropsWithChildren<{}>;
type NavProps = {
  open?: boolean;
};
// const Table: TableCmp = ({ children }): JSX.Element => <>{children}</>;
// const Thead: React.FC = ({ children }): JSX.Element => <thead>{children}</thead>;

const Nav: React.FC<PropsWithChildren<NavProps>> = ({ children, open }): JSX.Element => {
  return <div data-id={open ? "open" : "closed"}>{children}-nav</div>;
};
const Logo: React.FC<PropsWithChildren> = ({ children }): JSX.Element => <div>{children}-logo</div>;

export function AppLayout({ children }: AppLayoutProps) {
  const slots = {
    nav: null,
    logo: null,
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
  });
  return (
    <div>
      <div data-id='sidepanel'>
        <div data-id='sidepane'>{slots.nav}</div>
      </div>
      <header>
        <div data-id='sidepane-control'>
          {slots.logo}
          {/* {button} */}
        </div>
        <div data-id='notifications'></div>
      </header>
      <div>
        <main></main>
        <footer></footer>
      </div>
    </div>
  );
}

AppLayout.Nav = Nav;
AppLayout.Logo = Logo;
// Table.Tbody = Tbody;
// Table.Row = Row;
// Table.Col = Col;

// interface ContentProps {
//   children: ReactNode;
// }
// const Content = (props: ContentProps) => <div>{props.children}</div>;

// interface Props {
//   children: ReactNode;
// }
// const Nav = (props: Props) => <div>{props.children}</div>;

// Nav.Content = Content;

// export default Nav;
