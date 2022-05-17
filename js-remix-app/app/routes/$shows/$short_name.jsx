import shows from "~/data/show.json";
import seasonsData from "~/data/season.json";
import { useLoaderData, Link, Outlet } from "@remix-run/react";

export const loader = ({ params: { short_name } }) => {
  const seasons = seasonsData.find((c) => c.short_name === short_name);
  return { seasons };
};

// export const loader = ({ params }) => {
//   //   const seasons = params;
//   console.log(params.season);
//   //   const currentWeek = seasons.find((c) => c.current_week === current_week);
//   return { params };
// };

// export const loader: LoaderFunction = async ({ params }) => {
//   console.log(params.userId);
//   console.log(params.projectId);
// };

export default () => {
  const seasons = useLoaderData();
  //   const currentWeek = useLoaderData();
  //   console.log(params.season);
  return (
    <div>
      <p>List all seasons for show here</p>
      <Outlet />
      {/* <pre>{JSON.stringify(season, null, 2)}</pre> */}
      {seasons.map((season) => (
        <p key={season.id}>
          <Link to={`${season.short_name}`}>{season.name}</Link>
        </p>
      ))}

      {/* <Link to={`${season.short_name}`}>Current week</Link> */}
      {/* {seasons.map((currentWeek) => (
        <li key={season.short_name}>
          <Link to={`${season.current_week}`}>{season.name} current week</Link>
        </li>
      ))} */}
    </div>
  );
};
