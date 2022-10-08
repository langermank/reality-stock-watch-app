import { useLoaderData, Link, Outlet, useLocation } from "@remix-run/react";
// import shows from "~/data/show.json";
import supabase from "~/utils/supabase";
// import withAuthRequired from "~/utils/withAuthRequired";

// this component wraps around any component in sister folder components (folder with same name)
export const loader = async () => {
  const { data: shows, error } = await supabase.from("shows").select("*");

  if (error) {
    console.log("error,", error.message);
  }
  return {
    shows,
  };
};

export default () => {
  const { shows } = useLoaderData();
  //   const location = useLocation();
  console.log(shows);
  return (
    <div>
      {shows.map((show) => (
        <p key={show.id}>
          <Link to={`/show/${show.short_name}`}>{show.name}</Link>
        </p>
      ))}
      <p>List all shows here</p>
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
