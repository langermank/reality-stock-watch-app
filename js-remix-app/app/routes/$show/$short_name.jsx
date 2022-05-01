import shows from "~/data/show.json";
import seasons from "~/data/season.json";
import { useLoaderData, Link, Outlet } from "@remix-run/react";

export const loader = ({ params: { short_name } }) => {
  const season = seasons.find((c) => c.short_name === short_name);
  const show = shows.find((c) => c.short_name === short_name);
  return { season, show };
};

export default () => {
  const season = useLoaderData();
  return (
    <div>
      <Outlet />
      <pre>{JSON.stringify(season, null, 2)}</pre>
      {seasons.map((season, show) => (
        <p key={season.id}>
          <Link to={`${season.short_name}`}>{season.name}</Link>
        </p>
      ))}
      <p>hello</p>
    </div>
  );
};
