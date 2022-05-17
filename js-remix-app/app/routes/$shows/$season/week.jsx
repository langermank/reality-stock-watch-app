import { useLoaderData, Link, Outlet, useLocation } from "@remix-run/react";
import weeks from "~/data/season.json";
// import withAuthRequired from "~/utils/withAuthRequired";
// use this file to show data based on route
// this component wraps around any component in sister folder components (folder with same name)
export const loader = async () => {
  return {
    weeks,
  };
};

export default () => {
  const { weeks } = useLoaderData();
  //   const location = useLocation();
  console.log(weeks);
  return (
    <div>
      <p>Season weeks</p>
      {weeks.map((season) => (
        <li key={season.id}>
          <Link to={`${season.current_week}`}>{season.name} current week</Link>
        </li>
      ))}

      {/* <Outlet /> */}

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
