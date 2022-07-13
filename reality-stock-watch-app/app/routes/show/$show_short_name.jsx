// import seasons from "~/data/season.json";
import supabase from "~/utils/supabase";
import { useLoaderData, Link, Outlet, useLocation } from "@remix-run/react";

// show_short_name matches file path, change this if actual data changes
export const loader = async ({ params: { short_name } }) => {
  //   const season = seasons.filter((c) => c.show_short_name === show_short_name);

  //   return { season };
  const { data: seasons, error } = await supabase
    .from("seasons")
    .select("name, short_name");

  if (error) {
    console.log("error,", error.message);
  }

  return {
    seasons,
  };
};

export default () => {
  const season = useLoaderData();
  console.log(seasons);
  return (
    <div>
      <p>List all seasons from show supabase</p>
      {/* map through season data based on page param */}
      {Object.entries(season).map(([key, value]) => (
        <ul>
          {/* map through value array of season data */}
          {value.map((season) => (
            <li key={season.short_name}>
              <Link to={`${season.short_name}`}>{season.name}</Link>
            </li>
          ))}
        </ul>
      ))}
    </div>
  );
};
