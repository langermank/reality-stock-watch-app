import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import globalStylesUrl from '~/styles/global.css';
import Footer from "./components/Footer";
import Header from "./components/Header";

//#region [ Context functions ]
// functions to provide specific pages with configuration over 
// the whole document, if necessary
export const meta = () => ({
  charset: "utf-8",
  title: "Reality Stocker Watch App",
  viewport: "width=device-width,initial-scale=1",
  keywords: "remix, javascript, react, server-side, reality show, learning",
});

export const links = () => [
  {rel: 'stylesheet', href: globalStylesUrl}
]
export const title = (() => {
  let titleText = '';
  return (value) => {
    if (!value) return value;
    titleText = value;
  }
})()
//#endregion

//#region [ App Components]
export default function App() {
  return (
    <Document titleText="Reality Stocker Watch App">
      <Layout>
        <Outlet />
      </Layout>
    </Document>   
  );
}

export function Document({ children, titleText }) {
  return (
    <html lang="en">
        <head>
          <Links />

          <title>{titleText ? titleText : title()}</title>

          <Meta />
        </head>

        <body>
          {children}

          <ScrollRestoration />
          <Scripts />

          {process.env.NODE_ENV === 'development' 
          ? <LiveReload />
          : null}
        </body>
      </html>
  )
}

export function Layout({ children }) {
  return (
    <>
      <div class="LayoutContent-wrapper">
        <Header />

        {children}
      </div>

      <Footer />
    </>
  )
}

export function ErrorBoundary({ error }) {
  console.error(error);

  return <>
    <Document title="Error">
      <h1>Error</h1>

      <p>{error.message}</p>
    </Document>
  </>
}
//#endregion
