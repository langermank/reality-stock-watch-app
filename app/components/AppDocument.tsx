import {
  Links,
  LiveReload,
  Meta,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import type { PropsWithChildren } from "react";

export function AppDocument({ children }: PropsWithChildren) {
  const { env } = useLoaderData();
  return (
    <html lang='en' data-theme='dark'>
      <head>
        <Links />

        <Meta />
      </head>

      <body>
        {children}

        <ScrollRestoration />
        <Scripts />

        <script dangerouslySetInnerHTML={{ __html: `window.env = ${JSON.stringify(env)}` }} />
        {process.env.NODE_ENV === "development" ? <LiveReload /> : null}
      </body>
    </html>
  );
}
