import { Outlet } from "@remix-run/react";
import { AppDocument } from "./components/AppDocument";
import { MainLayout } from "./components/layout/MainLayout";
// styles
import globalStylesUrl from "./styles/global.css";
import reset from "./styles/reset.css";
import radixDark from "./styles/radix-dark.css";
import radixLight from "./styles/radix-light.css";
import Fonts from "./styles/fonts.css";

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
    <AppDocument>
      <MainLayout>
        <Outlet />
      </MainLayout>
    </AppDocument>
  );
}
