import seasons from "~/data/season.json";
import contestants from "~/data/contestant.json";
import { useLoaderData, Link, Outlet, useLocation } from "@remix-run/react";

// short_name matches file path, change this if actual data changes
export const loader = async ({ params: { short_name } }) => {
  const season = seasons.filter((c) => c.short_name === short_name);

  return { season };
};

export default () => {
  const season = useLoaderData();

  return (
    <div>
      <p>Season specific data</p>
      <p>List out all contestants (index)</p>
      {/* map through season data based on page param */}
      {Object.entries(season).map(([key, value]) => (
        <ul>
          {/* map through value array of season data */}
          {value.map((season) => (
            <>
              <pre>{JSON.stringify(season, null, 2)}</pre>
              <li key={season.week}>
                <Link to={`${season.week}`}>Week {season.week}</Link>
              </li>
            </>
          ))}
        </ul>
      ))}
    </div>
  );
};
