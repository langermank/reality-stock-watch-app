import type { PropsWithChildren } from "react";
import { useState } from "react";
import { AppLayout } from "./AppLayout";
import { Button } from "../core/button/Button";
import { Heading } from "../core/Heading/Heading";
import { Sidebar } from "phosphor-react";
import { Sidepane } from "./Sidepane";

export function MainLayout({ children }: PropsWithChildren) {
  let [open, setOpen] = useState(false);
  let [panelState, setpanelState] = useState(false);
  return (
    <>
      <AppLayout panelCollapsed={panelState}>
        <AppLayout.Logo>Stockwatch</AppLayout.Logo>
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

        <AppLayout.PageTitle>
          <Heading as='h1' size='display'>
            Dashboard
          </Heading>
        </AppLayout.PageTitle>
        {/* <AppLayout.PageNotification>
          <Card variant='neutral'>The market opens in 5 hours!</Card>
        </AppLayout.PageNotification> */}
        <AppLayout.Nav>
          <Sidepane />
        </AppLayout.Nav>

        <AppLayout.PageContent>
          <div>{children}</div>
        </AppLayout.PageContent>

        <AppLayout.FooterContent>
          <Footer />
        </AppLayout.FooterContent>
      </AppLayout>
    </>
  );
}

function Footer() {
  return <div>footer</div>;
}
