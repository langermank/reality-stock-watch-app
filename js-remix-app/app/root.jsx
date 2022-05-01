import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useMatches,
  useLoaderData,
} from "@remix-run/react";
import Sidebar from "./components/Sidebar";
// import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
// import shows from "~/data/show.json";
// import seasons from "~/data/season.json";
// import Sidebar from "./routes/__sidebar.jsx";

// import type { User } from "~/data.server";
// import { getUser } from "~/data.server";

// type LoaderData = { user: User };

// export const loader = async () => {
//   return json({ Season: await seasons() });
// };

// export const loader = async () => {
//   return json({ Show: await shows() });
// };

// export const loader = async () => {
//   return {
//     shows,
//     seasons,
//   };
// };

export const meta = () => ({
  charset: "utf-8",
  title: "New Remix App",
  viewport: "width=device-width,initial-scale=1",
});

export default function App() {
  // const matches = useMatches();
  //   const { shows, seasons } = useLoaderData();
  //   console.log(seasons);
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <aside>
          <Sidebar />
        </aside>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
