import contestants from "~/data/contestant.json";
import { useLoaderData, Link, Outlet, useLocation } from "@remix-run/react";

// week matches file path, change this if actual data changes
export const loader = async ({ params: { season_id } }) => {
  const contestant = contestants.filter((c) => c.season_id === season_id);

  return { contestant };
};

export default () => {
  const contestant = useLoaderData();

  return (
    <div>
      <p>Contestants</p>
      {/* {Object.entries(contestant).map(([key, value]) => (
        <ul>
          {value.map((contestant) => (
            <pre>{JSON.stringify(contestant, null, 2)}</pre>
          ))}
        </ul>
      ))} */}
    </div>
  );
};
