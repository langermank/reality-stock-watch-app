import React from "react";
import type { PropsWithChildren, FC, FunctionComponent } from "react";
export type AppLayoutProps = {};

type AppLayoutProps = FunctionComponent & {
  Nav: React.FC;
};

// const Table: TableCmp = ({ children }): JSX.Element => <>{children}</>;
// const Thead: React.FC = ({ children }): JSX.Element => <thead>{children}</thead>;

export const AppLayout = (
  <div>
    <div data-id='sidepanel'>
      <div data-id='sidepane'>
        <AppLayout.Nav></AppLayout.Nav>
      </div>
    </div>
    <header>
      <div data-id='sidepane-control'>
        {logo}
        {button}
      </div>
      <div data-id='notifications'></div>
    </header>
    <div>
      <main></main>
      <footer></footer>
    </div>
  </div>
);

const Nav: React.FC = ({ children }): JSX.Element => <thead>{children}</thead>;

AppLayout.Nav = Nav;
// Table.Tbody = Tbody;
// Table.Row = Row;
// Table.Col = Col;
