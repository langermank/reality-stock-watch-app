import leaderboards from "~/data/leaderboard.json";
import seasons from "~/data/season.json";
import { json } from "@remix-run/node";
import { useLoaderData, Link, Outlet, useLocation } from "@remix-run/react";

export default () => {
  //   const params = useLoaderData();
  //   console.log(params);
  //   const leaderboard = useLoaderData();
  //   const season = useLoaderData();
  //   console.log(season);
  return (
    <div>
      <p>Leaderboard week data</p>
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
