import seasons from "~/data/season.json";
import { useLoaderData, Link, Outlet, useLocation } from "@remix-run/react";

// week matches file path, change this if actual data changes
export const loader = async ({ params: { week } }) => {
  const season = seasons.filter((c) => c.week === week);

  return { season };
};

export default () => {
  const season = useLoaderData();

  return (
    <div>
      <p>Week specific data</p>
      {/* {Object.entries(season).map(([key, value]) => (
        <ul>
          {value.map((season) => (
            <pre>{JSON.stringify(season, null, 2)}</pre>
          ))}
        </ul>
      ))} */}
    </div>
  );
};
