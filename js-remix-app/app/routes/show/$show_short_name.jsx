import seasons from "~/data/season.json";
import { useLoaderData, Link, Outlet, useLocation } from "@remix-run/react";

// show_short_name matches file path, change this if actual data changes
export const loader = async ({ params: { show_short_name } }) => {
  const season = seasons.filter((c) => c.show_short_name === show_short_name);

  return { season };
};

export default () => {
  const season = useLoaderData();

  return (
    <div>
      {/* map through season data based on page param */}
      {Object.entries(season).map(([key, value]) => (
        <ul>
          {/* map through value array of season data */}
          {value.map((show) => (
            <li key={show.short_name}>
              <Link to={`${show.short_name}`}>{show.name}</Link>
            </li>
          ))}
        </ul>
      ))}
    </div>
  );
};
