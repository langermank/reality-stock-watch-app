import seasons from "~/data/season.json";
import { useLoaderData } from "@remix-run/react";

export const loader = ({ params: { short_name } }) => {
  const season = seasons.find((c) => c.short_name === short_name);
  return { season };
};

export default () => {
  const season = useLoaderData();
  return <pre>{JSON.stringify(season, null, 2)}</pre>;
};
