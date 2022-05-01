import { useLoaderData, Link, Outlet, useLocation } from "@remix-run/react";
import seasons from "~/data/season.json";
// import withAuthRequired from "~/utils/withAuthRequired";

// this component wraps around any component in sister folder components (folder with same name)
export const loader = async () => {
  return {
    seasons,
  };
};

export default () => {
  const { seasons } = useLoaderData();
  //   const location = useLocation();
  console.log(seasons);
  return (
    <div>
      {seasons.map((season) => (
        <p key={season.id}>
          <Link to={`/show/season/${season.short_name}`}>
            <span className="text-gray-400 mr-1">#</span>
            {season.name}
          </Link>
        </p>
      ))}
      <Outlet />

      {/* <div className="flex-1 p-8 flex flex-col">
        {location.pathname === "/channels" ||
        location.pathname === "/channels/" ? (
          <div className="flex-1 flex items-center justify-center text-center">
            👈 Choose a channel!
          </div>
        ) : null}
        <Outlet />
      </div> */}
    </div>
  );
};
