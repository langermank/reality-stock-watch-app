import { useLoaderData, Link, Outlet, useLocation } from "@remix-run/react";
// import shows from '../mock-data';

export default function Index() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>Welcome to Remix</h1>
      <Link to="/shows">Go to channels 👉</Link>
      {/* {shows.map(({ show }) => (
              <p>{show.id}</p>
          ))} */}
    </div>
  );
}
