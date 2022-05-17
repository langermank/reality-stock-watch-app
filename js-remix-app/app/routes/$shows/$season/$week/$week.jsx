import weeks from "~/data/season.json";
import { useLoaderData } from "@remix-run/react";

export const loader = ({ params: { current_week } }) => {
  const week = weeks.find((c) => c.current_week === current_week);
  return { week };
};

export default () => {
  const week = useLoaderData();
  return <pre>{JSON.stringify(week, null, 2)}</pre>;
};

// use this file to pull data
