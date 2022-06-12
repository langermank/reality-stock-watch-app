import { Link } from "@remix-run/react";
import seasons from "~/data/season.json";

export const loader = ({ params: { short_name } }) => {
  const season = seasons.find((c) => c.short_name === short_name);

  return { season };
};

export default function Sidebar() {
  return (
    <aside>
      <nav>
        <h1>Sidebar</h1>

        <ul>
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
      </nav>
    </aside>
  );
}
