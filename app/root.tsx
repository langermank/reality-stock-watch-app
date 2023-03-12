import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import globalStylesUrl from "./styles/global.css";
import reset from "./styles/reset.css";
import radixDark from "./styles/radix-dark.css";
import radixLight from "./styles/radix-light.css";
import Fonts from "./styles/fonts.css";
import Footer from "./components/Footer";
import { AppLayout } from "./components/layout/AppLayout";
import { Button } from "./components/core/button/Button";
import { Heading } from "./components/core/Heading/Heading";
import { Sidebar } from "phosphor-react";
import Sidepane from "./components/Sidepane";
import { PageLayout } from "./components/PageLayout";
import React from "react";

//#region [ Context functions ]
// functions to provide specific pages with configuration over
// the whole document, if necessary
export const meta = () => ({
  charset: "utf-8",
  title: "Reality Stock Watch App",
  viewport: "width=device-width,initial-scale=1",
  keywords: "remix, javascript, react, server-side, reality show, learning",
});

export const links = () => [
  {
    rel: "preload",
    href: "/fonts/Bungee-Regular-webfont.woff",
    as: "font",
    type: "font/woff",
    crossOrigin: "anonymous",
  },
  {
    rel: "preload",
    href: "/fonts/Bungee-Shade-webfont.woff",
    as: "font",
    type: "font/woff",
    crossOrigin: "anonymous",
  },
  {
    rel: "preload",
    href: "/fonts/Manrope-Regular.woff2",
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous",
  },
  { rel: "stylesheet", href: globalStylesUrl },
  { rel: "stylesheet", href: reset },
  { rel: "stylesheet", href: radixDark },
  { rel: "stylesheet", href: radixLight },
  { rel: "stylesheet", href: Fonts },
];
export const title = (() => {
  let titleText = "";
  return (value) => {
    if (!value) return value;
    titleText = value;
  };
})();
//#endregion

export const loader = () => {
  return {
    env: {
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_KEY: process.env.SUPABASE_KEY,
    },
  };
};

//#region [ App Components]
export default function App() {
  return (
    <Document titleText='Reality Stock Watch App'>
      <Layout>
        <Outlet />
      </Layout>
    </Document>
  );
}

export function Document({ children, titleText }) {
  const { env } = useLoaderData();
  return (
    <html lang='en' data-theme='dark'>
      <head>
        <Links />

        <title>{titleText ? titleText : title()}</title>

        <Meta />
      </head>

      <body>
        {children}

        <ScrollRestoration />
        <Scripts />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.env = ${JSON.stringify(env)}`,
          }}
        />
        {process.env.NODE_ENV === "development" ? <LiveReload /> : null}
      </body>
    </html>
  );
}

export function Layout({ children }) {
  let [open, setOpen] = React.useState(false);
  let [panelState, setpanelState] = React.useState(false);
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
          <PageLayout>{children}</PageLayout>
        </AppLayout.PageContent>
        <AppLayout.FooterContent>
          <Footer />
        </AppLayout.FooterContent>
      </AppLayout>
    </>
  );
}

export function ErrorBoundary({ error }) {
  console.error(error);

  return (
    <>
      <Document title='Error'>
        <h1>Error</h1>

        <p>{error.message}</p>
      </Document>
    </>
  );
}
//#endregion
