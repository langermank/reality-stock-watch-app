import {
  useLoaderData,
  Link,
  NavLink,
  Outlet,
  useLocation,
} from "@remix-run/react";

import seasons from "~/data/season.json";
import shows from "../data/show.json";
// import withAuthRequired from "~/utils/withAuthRequired";

// save for auth
// const userLinks = [
//   { to: "/posts", icon: HomeIcon, text: "Home" },
//   { to: "/explore", icon: ExploreIcon, text: "Explore" },
//   { to: `/users/${user?.username}`, icon: UserIcon, text: "Profile" },
//   { to: "/settings", icon: SettingsIcon, text: "Settings" },
// ];

// const guestLinks = [
//   { to: "/explore", icon: ExploreIcon, text: "Explore" },
//   { to: "/join", icon: EmailIcon, text: "Join" },
//   { to: "/login", icon: KeyIcon, text: "Log In" },
// ];

// const links = user ? userLinks : guestLinks;

export const loader = ({ params: { short_name } }) => {
  const season = seasons.find((c) => c.short_name === short_name);

  return { season };
};

export default function Sidebar() {
  //   const { shows } = useLoaderData();
  //   const { seasons } = useLoaderData();

  return (
    <nav>
      <h1>Sidebar</h1>
      {/* <Link to={`/show/${season.short_name}`}>{season.name}</Link> */}
      {/* <Outlet /> */}
      {/* <Link to="/show">Go to channels 👉</Link> */}
      <ul>
        <li>
          <Link to={`/`}>Home</Link>
        </li>
        {seasons.map((season) => (
          <li key={season.id}>
            <Link to={`${season.show_short_name}/${season.short_name}`}>
              {season.name}
            </Link>
          </li>
        ))}
        {seasons.map((season) => (
          <li key={season.id}>
            <Link
              to={`${season.show_short_name}/${season.short_name}/leaderboard`}
            >
              {season.name} leaderboard
            </Link>
          </li>
        ))}
      </ul>
      {/* <Outlet /> */}
    </nav>
  );
}
